// src/pages/ChatPage.js
import React, { useState, useRef, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { FaFile, FaPaperPlane, FaPaperclip } from 'react-icons/fa';
import Header from '../components/Main/Header';
import Footer from '../components/Main/Footer';
import ChatList from '../components/Main/ChatList';
import ProfilePanel from '../components/Main/ProfilePanel';
import JsonViewer from '../components/JsonViewer/JsonViewer';
import TextFormatter from '../components/TextFormatter/TextFormatter';
import { fetchScanResultById, uploadAndAnalyzeFile, sendChatMessage } from '../services/ApiService';
import { parseMalwareAnalysisResponse, formatAnalysisMessage } from '../utils/MalwareAnalysisParser';

function ChatPage() {
  const { chatId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const initialFile = location.state?.file || null;
  const initialMessage = location.state?.message || '';
  
  // 로컬 저장소에서 세션 복원
  const loadFromStorage = location.state?.loadFromStorage || false;
  const existingChatSession = location.state?.chatSession || null;

  /*
  // Header title 생성
  const [headerTitle, setHeaderTitle] = useState(() => {
    if (initialFile) {
      return `${initialFile.name} 파일의 악성 코드 분석`;
    }
    // ChatList에서 온 경우 기존 세션의 title 사용
    if (existingChatSession?.title) {
      return existingChatSession.title;
    }
    return null;
  });
  */

  // headerTitle을 state로 관리 - 초기값은 null로 설정
  const [headerTitle, setHeaderTitle] = useState(null);

  // useRef로 분석 실행 여부 추적 (Strict Mode 대응)
  const hasAnalyzedRef = useRef(false);
  const isMountedRef = useRef(true);

  const [messages, setMessages] = useState([]); // 빈 배열로 시작
  const [text, setText] = useState('');
  const [showChatList, setShowChatList] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [parsedData, setParsedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [chatId_VT, setChatId_VT] = useState(null);

  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  // 메뉴 및 프로필 핸들러들
  const handleMenuClick = () => setShowChatList(true);
  const handleProfileClick = () => setShowProfile(true);
  const handleCloseChatList = () => setShowChatList(false);
  const handleCloseProfile = () => setShowProfile(false);

  // 난수 chatID 생성 함수
  const generateRandomChatId = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 12; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  // 새 채팅 시작 핸들러
  const handleStartNewChat = () => {
    const newChatId = generateRandomChatId();
    console.log('새 채팅 시작:', newChatId);
    navigate(`/chat/${newChatId}`);
  };

  // 로컬 저장소에서 특정 chatId의 세션 불러오기
  const loadChatSessionFromStorage = (targetChatId) => {
    try {
      const sessions = JSON.parse(localStorage.getItem('chatSessions') || '[]');
      const session = sessions.find(s => s.chatId === targetChatId);
      return session;
    } catch (error) {
      console.error('채팅 세션 로드 실패:', error);
      return null;
    }
  };

  // 세션 복원 함수
  const restoreChatSession = (sessionData) => {
    if (!sessionData) return;
    
    console.log('채팅 세션 복원 중:', sessionData);
    
    // 메시지 복원
    if (sessionData.messages && sessionData.messages.length > 0) {
      setMessages(sessionData.messages);
    }
    
    // 분석 결과 복원
    if (sessionData.analysisResult) {
      setAnalysisResult(sessionData.analysisResult);
      const parsed = parseAnalysisResponse(sessionData.analysisResult);
      setParsedData(parsed);
      setSessionParsedData(parsed);
    }
    
    // 제목 복원 및 설정
    if (sessionData.title) {
      console.log('복원된 제목:', sessionData.title);
      setHeaderTitle(sessionData.title); // 여기서 headerTitle 업데이트
    } else if (sessionData.fileName) {
      const generatedTitle = `${sessionData.fileName} 파일의 악성 코드 분석`;
      console.log('생성된 제목:', generatedTitle);
      setHeaderTitle(generatedTitle); // 여기서도 headerTitle 업데이트
    }
    
    setLoading(false);
  };

  // 채팅 세션 업데이트 함수
  const updateChatSession = (newMessage, isUser = false) => {
    try {
      const sessions = JSON.parse(localStorage.getItem('chatSessions') || '[]');
      const sessionIndex = sessions.findIndex(session => session.chatId === chatId);
      
      if (sessionIndex >= 0) {
        sessions[sessionIndex].messages.push(newMessage);
        sessions[sessionIndex].messageCount = sessions[sessionIndex].messages.length;
        sessions[sessionIndex].lastUpdated = new Date().toISOString();
        
        // 제목 업데이트 (headerTitle이 있는 경우)
        if (headerTitle) {
          sessions[sessionIndex].title = headerTitle;
        }
        
        localStorage.setItem('chatSessions', JSON.stringify(sessions));
        console.log('채팅 세션 업데이트됨:', chatId);
      } else {
        // 새 세션 생성 시 제목 포함
        const newSession = {
          id: chatId,
          chatId: chatId,
          title: headerTitle || `${initialFile?.name || 'Unknown'} 파일의 악성 코드 분석`, // 제목 형식 수정
          fileName: initialFile?.name || null,
          fileSize: initialFile?.size || 0,
          analysisResult: analysisResult,
          messages: [newMessage],
          messageCount: 1,
          lastUpdated: new Date().toISOString(),
          createdAt: new Date().toISOString()
        };
        
        sessions.unshift(newSession);
        localStorage.setItem('chatSessions', JSON.stringify(sessions));
        console.log('새 채팅 세션 생성됨:', chatId);
      }
    } catch (error) {
      console.error('채팅 세션 업데이트 실패:', error);
    }
  };

  // 세션 전체에서 파싱된 데이터를 유지하기 위한 state 추가
  const [sessionParsedData, setSessionParsedData] = useState(() => {
    // 페이지 로드 시 localStorage에서 기존 데이터 복원
    const saved = localStorage.getItem('chatSessionData');
    return saved ? JSON.parse(saved) : null;
  });

  // 개선된 파싱 함수 - 더 많은 변수들을 추출하고 저장
  const parseAnalysisResponse = (response) => {
    try {
      console.log('=== 확장된 파싱 시작 ===');
      console.log('원본 응답:', response);

      const reportVT = response?.reportfromVT || {};
      const reportLLM = response?.reportfromLLM || {};
      const extractedId = response?.extractedId || '';

      // 채팅용 ID 추출
      const vtChatId = reportVT?._id || null;
      console.log('추출된 채팅 ID (reportfromVT._id):', vtChatId);

      // VirusTotal 데이터 파싱
      const vtData = reportVT?.data || {};
      const vtAttributes = vtData?.attributes || {};
      const lastAnalysisResults = vtAttributes?.lastAnalysisResults || {};
      const lastAnalysisStats = vtAttributes?.lastAnalysisStats || {};
      const fileInfo = vtAttributes?.names || [];
      const fileSize = vtAttributes?.size || 0;
      const fileType = vtAttributes?.type_description || '';
      const md5Hash = vtAttributes?.md5 || '';
      const sha1Hash = vtAttributes?.sha1 || '';
      const sha256Hash = vtAttributes?.sha256 || '';

      // 악성 탐지 엔진들 추출
      const maliciousEngines = Object.entries(lastAnalysisResults)
        .filter(([engine, result]) => result.category === 'malicious')
        .map(([engine, result]) => ({ engine, result: result.result }));

      // 의심스러운 엔진들 추출
      const suspiciousEngines = Object.entries(lastAnalysisResults)
        .filter(([engine, result]) => result.category === 'suspicious')
        .map(([engine, result]) => ({ engine, result: result.result }));

      const parsedResult = {
        // VirusTotal 기본 정보
        vtChatId: vtChatId,
        vtId: reportVT?._id || '',
        vtScanId: vtData?.id || '',
        vtMaliciousCount: lastAnalysisStats?.malicious || 0,
        vtSuspiciousCount: lastAnalysisStats?.suspicious || 0,
        vtUndetectedCount: lastAnalysisStats?.undetected || 0,
        vtHarmlessCount: lastAnalysisStats?.harmless || 0,
        vtTimeoutCount: lastAnalysisStats?.timeout || 0,
        vtFailureCount: lastAnalysisStats?.failure || 0,
        vtTotalEngines: Object.keys(lastAnalysisResults).length,
        vtDetectionRate: `${lastAnalysisStats?.malicious || 0}/${Object.keys(lastAnalysisResults).length}`,

        // 파일 정보
        fileName: fileInfo[0] || '',
        fileSize: fileSize,
        fileType: fileType,
        md5: md5Hash,
        sha1: sha1Hash,
        sha256: sha256Hash,

        // 탐지 엔진 상세 정보
        vtMaliciousEngines: maliciousEngines,
        vtSuspiciousEngines: suspiciousEngines,
        vtMaliciousEnginesList: maliciousEngines.map(e => e.engine).join(', '),
        vtSuspiciousEnginesList: suspiciousEngines.map(e => e.engine).join(', '),

        // LLM 관련
        llmId: reportLLM?._id || '',
        llmReport: reportLLM?.report || '',

        // 기타
        extractedId: extractedId,
        analysisDate: new Date().toISOString(),
        rawResponse: response
      };

      // 채팅 ID 설정
      if (vtChatId) {
        setChatId_VT(vtChatId);
      }

      // localStorage에 저장하여 세션 간 유지
      localStorage.setItem('chatSessionData', JSON.stringify(parsedResult));

      console.log('=== 확장된 파싱 완료, 채팅 ID 설정 ===', vtChatId);
      console.log('저장된 변수들:', Object.keys(parsedResult));
      return parsedResult;

    } catch (error) {
      console.error('파싱 오류:', error);
      return null;
    }
  };

  // 사용 가능한 변수 목록을 확인하는 함수
  const checkVariableExists = (variableName, parsedData) => {
    if (!parsedData) return false;
    const availableVariables = [
      'vtChatId', 'vtId', 'vtScanId', 'vtMaliciousCount', 'vtSuspiciousCount',
      'vtUndetectedCount', 'vtHarmlessCount', 'vtTimeoutCount', 'vtFailureCount',
      'vtTotalEngines', 'vtDetectionRate', 'fileName', 'fileSize', 'fileType',
      'md5', 'sha1', 'sha256', 'vtMaliciousEnginesList', 'vtSuspiciousEnginesList',
      'llmId', 'llmReport', 'extractedId', 'analysisDate'
    ];
    return availableVariables.includes(variableName);
  };

  // 변수명으로 값 조회하는 함수 (기존 함수 확장)
  const getValueByVariableName = (variableName, parsedData) => {
    if (!parsedData) return null;
    const variableMap = {
      'vtChatId': parsedData.vtChatId,
      'vtId': parsedData.vtId,
      'vtScanId': parsedData.vtScanId,
      'vtMaliciousCount': parsedData.vtMaliciousCount,
      'vtSuspiciousCount': parsedData.vtSuspiciousCount,
      'vtUndetectedCount': parsedData.vtUndetectedCount,
      'vtHarmlessCount': parsedData.vtHarmlessCount,
      'vtTimeoutCount': parsedData.vtTimeoutCount,
      'vtFailureCount': parsedData.vtFailureCount,
      'vtTotalEngines': parsedData.vtTotalEngines,
      'vtDetectionRate': parsedData.vtDetectionRate,
      'fileName': parsedData.fileName,
      'fileSize': parsedData.fileSize,
      'fileType': parsedData.fileType,
      'md5': parsedData.md5,
      'sha1': parsedData.sha1,
      'sha256': parsedData.sha256,
      'vtMaliciousEnginesList': parsedData.vtMaliciousEnginesList,
      'vtSuspiciousEnginesList': parsedData.vtSuspiciousEnginesList,
      'llmId': parsedData.llmId,
      'llmReport': parsedData.llmReport,
      'extractedId': parsedData.extractedId,
      'analysisDate': parsedData.analysisDate,
      'vtMaliciousEngines': JSON.stringify(parsedData.vtMaliciousEngines, null, 2),
      'vtSuspiciousEngines': JSON.stringify(parsedData.vtSuspiciousEngines, null, 2)
    };
    return variableMap[variableName];
  };

  // chatId 변경 시 메시지 초기화 및 세션 복원
  useEffect(() => {
    const analyzeInitialFile = async () => {
      console.log('chatId 변경됨:', chatId, 'loadFromStorage:', loadFromStorage);
      
      // chatId가 변경될 때마다 headerTitle 초기화
      setHeaderTitle(null);
      
      // 로딩 상태 초기화
      setLoading(false);
      setText('');

      // 세션 복원 로직 먼저 체크
      if (loadFromStorage && existingChatSession && existingChatSession.chatId === chatId) {
        // URL에서 전달받은 세션 데이터로 복원
        restoreChatSession(existingChatSession);
        return;
      }

      // 로컬 저장소에서 해당 chatId의 세션 찾기
      const storedSession = loadChatSessionFromStorage(chatId);
      if (storedSession) {
        // 저장된 세션이 있으면 복원
        restoreChatSession(storedSession);
        return;
      }

      // 기존 파일 분석 로직
      if (hasAnalyzedRef.current || !initialFile || !isMountedRef.current) {
        console.log('분석 스킵:', { hasAnalyzed: hasAnalyzedRef.current, hasFile: !!initialFile, isMounted: isMountedRef.current });
        return;
      }

      hasAnalyzedRef.current = true;
      const skipAnalysis = location.state?.skipAnalysis;
      const existingResult = location.state?.result;

      console.log('ChatPage 초기화 (단일 실행):', { initialFile: initialFile?.name, skipAnalysis, hasExistingResult: !!existingResult });

      // 초기 메시지 설정
      const initialMessages = [];
      if (initialFile) {
        const userMessageText = initialMessage ? `${initialFile.name}\n${initialMessage}` : `${initialFile.name}`;
        initialMessages.push({
          text: userMessageText,
          isUser: true,
          file: initialFile.name,
          timestamp: new Date().toISOString()
        });
        initialMessages.push({
          text: "분석 중입니다...",
          isUser: false,
          isLoading: true,
          timestamp: new Date().toISOString()
        });
        setMessages(initialMessages);
        setLoading(true);
      } else if (initialMessage && initialMessage.trim()) {
        initialMessages.push({
          text: initialMessage.trim(),
          isUser: true,
          timestamp: new Date().toISOString()
        });
        initialMessages.push({
          text: "메시지를 받았습니다. 어떻게 도와드릴까요?",
          isUser: false,
          timestamp: new Date().toISOString()
        });
        setMessages(initialMessages);
      }

      try {
        let result;
        if (existingResult) {
          console.log('기존 결과 사용:', existingResult);
          result = existingResult;
        } else if (!skipAnalysis && initialFile) {
          console.log('새로 분석 시작');
          result = await uploadAndAnalyzeFile(initialFile);
        } else if (initialFile) {
          console.error('결과가 없는데 skipAnalysis가 true입니다.');
          throw new Error('분석 결과를 찾을 수 없습니다.');
        }

        if (!isMountedRef.current) return;

        if (result) {
          console.log('분석 결과 처리 중:', result);

          // 새로운 파싱 함수 사용
          const parsed = parseAnalysisResponse(result);
          setParsedData(parsed);
          setSessionParsedData(parsed);

          // LLM 리포트만 표시
          const llmReport = parsed?.llmReport || '분석 리포트를 찾을 수 없습니다.';

          // 로딩 메시지 제거하고 AI 메시지 추가
          setMessages(prev => {
            const filteredMessages = prev.filter(msg => !msg.isLoading);
            const aiMessage = {
              text: llmReport, // LLM 리포트만 표시
              isUser: false,
              timestamp: new Date().toISOString()
            };
            console.log('AI 메시지 추가 (단일):', aiMessage);
            return [...filteredMessages, aiMessage];
          });

          setAnalysisResult(result);
        }

      } catch (error) {
        if (!isMountedRef.current) return;
        console.error('파일 분석 실패:', error);
        setMessages(prev => {
          const filteredMessages = prev.filter(msg => !msg.isLoading);
          const errorMessage = {
            text: `죄송합니다, 파일 분석 중 오류가 발생했습니다: ${error.message}`,
            isUser: false,
            timestamp: new Date().toISOString()
          };
          return [...filteredMessages, errorMessage];
        });
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
        }
      }

      // location.state 초기화 (한 번만 사용)
      if (loadFromStorage && location.state) {
        window.history.replaceState({}, document.title);
      }
    };

    analyzeInitialFile();

    return () => {
      isMountedRef.current = false;
    };
  }, [chatId]); // chatId만 의존성으로 설정

  // 컴포넌트 마운트 상태 추적
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // 자동 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 파일 선택 핸들러
  const handleFileSelect = (file) => {
    setSelectedFile(file);
  };

  // 메시지 전송
  const handleSendClick = async () => {
    console.log('handleSendClick 호출됨!', text);
    if ((!selectedFile && text.trim().length === 0) || loading) return;
    if (text.length > 3000) {
      alert('글자수는 최대 3000자까지 입력 가능합니다.');
      return;
    }

    const currentText = text.trim();
    const currentParsedData = sessionParsedData || parsedData;

    // 사용자 메시지 추가
    const userMessage = {
      text: currentText,
      isUser: true,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    updateChatSession(userMessage, true); // 세션 업데이트 추가
    setText('');
    setLoading(true);

    // 로딩 메시지 추가
    const loadingMessage = {
      text: "처리 중입니다...",
      isUser: false,
      isLoading: true,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, loadingMessage]);

    try {
      let responseText;

      // 1단계: 변수명인지 확인
      if (checkVariableExists(currentText, currentParsedData)) {
        // 변수가 존재하는 경우 해당 값 반환
        const variableValue = getValueByVariableName(currentText, currentParsedData);
        responseText = variableValue !== null ? `${currentText}: ${variableValue}` : `변수 '${currentText}'의 값을 찾을 수 없습니다.`;
        console.log('변수 조회 결과:', responseText);
      } else {
        // 2단계: 변수가 아닌 경우 서버에 질문 전송
        console.log('변수가 아닌 질문이므로 서버에 전송:', currentText);
        if (chatId_VT) {
          console.log('채팅 API 호출:', { id: chatId_VT, message: currentText });
          const chatResponse = await sendChatMessage(chatId_VT, currentText);
          responseText = chatResponse?.answer || chatResponse?.response || chatResponse?.message || '응답을 받지 못했습니다.';
        } else {
          responseText = `채팅을 위해서는 먼저 APK 파일을 분석해야 합니다. 다음 변수들을 조회할 수 있습니다: vtId, vtScanId, vtMaliciousCount, fileName, fileSize, md5, sha256, llmReport 등`;
        }
      }

      // 파일 업로드 처리 (기존 로직 유지)
      if (selectedFile) {
        const result = await uploadAndAnalyzeFile(selectedFile);
        const newParsedData = parseAnalysisResponse(result);
        setSessionParsedData(newParsedData);
        setParsedData(newParsedData);
        setAnalysisResult(result);
        responseText = `파일 '${selectedFile.name}' 분석이 완료되었습니다. 분석 결과를 확인하려면 변수명을 입력하세요.`;
        setSelectedFile(null);
      }

      // AI 응답 메시지 추가
      const aiMessage = {
        text: responseText,
        isUser: false,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => {
        const filteredMessages = prev.filter(msg => !msg.isLoading);
        return [...filteredMessages, aiMessage];
      });

      updateChatSession(aiMessage, false); // AI 응답도 세션 업데이트

    } catch (error) {
      console.error('처리 실패:', error);
      setMessages(prev => {
        const filteredMessages = prev.filter(msg => !msg.isLoading);
        const errorMessage = {
          text: `처리 중 오류가 발생했습니다: ${error.message}`,
          isUser: false,
          timestamp: new Date().toISOString()
        };
        return [...filteredMessages, errorMessage];
      });
    } finally {
      setLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // 엔터키 전송
  const handleKeyPress = (e) => {
    console.log('handleKeyPress 호출됨!', e.key);
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendClick();
    }
  };

  // 채팅 선택 핸들러
  const handleSelectChat = (selectedChatId, sessionData) => {
    console.log('선택된 채팅 ID:', selectedChatId, sessionData);
    navigate(`/chat/${selectedChatId}`, { 
      state: { 
        chatSession: sessionData,
        loadFromStorage: true 
      } 
    });
    setShowChatList(false);
  };

  // 메시지 렌더링 (기존 코드 유지)
  const renderMessageContent = (message) => {
    if (message.isLoading) {
      return (
        <div className="d-flex align-items-center">
          <div className="spinner-border spinner-border-sm me-2" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          {message.text}
        </div>
      );
    }

    return (
      <div>
        {message.file && (
          <div className="d-flex align-items-center mb-2 text-muted">
            <FaFile className="me-2" />
            <small>{message.file}</small>
          </div>
        )}
        <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
          {message.text}
        </div>
      </div>
    );
  };

  return (
    <div className="chat-container d-flex flex-column vh-100">
      {/* Header - fixed 위치 */}
      <Header 
        title={headerTitle} // 이제 state로 관리되는 headerTitle 사용 
        onMenuClick={handleMenuClick}
        onProfileClick={handleProfileClick}
        onStartNewChat={handleStartNewChat}
        className="position-relative"
        /*
        style={{
          height: '18vh',
          background: 'linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(255,255,255,1) 40%, rgba(255,255,255,0.5) 75%, rgba(255,255,255,1) 100%)',
          backdropFilter: 'blur(5px)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.1)'
        }}
        */
      />
      
      {/* 채팅 리스트 사이드 패널 */}
      {showChatList && (
        <div className="position-fixed top-0 start-0 h-100 bg-white shadow-lg chat-list-panel" 
             style={{ 
               width: '350px', 
               zIndex: 1050,
               transform: showChatList ? 'translateX(0)' : 'translateX(-100%)',
               transition: 'transform 0.3s ease-in-out'
             }}>
          <ChatList 
            onSelectChat={handleSelectChat}
            onClose={handleCloseChatList}
            onNewChat={handleStartNewChat} // 이 줄 추가
          />
        </div>
      )}

      {/* 프로필 패널 사이드 패널 */}
      {showProfile && (
        <div className="position-fixed top-0 end-0 h-100 bg-white shadow-lg profile-panel" 
             style={{ 
               width: '350px', 
               zIndex: 1050,
               transform: showProfile ? 'translateX(0)' : 'translateX(100%)',
               transition: 'transform 0.3s ease-in-out'
             }}>
          <ProfilePanel onClose={handleCloseProfile} />
        </div>
      )}

      {/* 오버레이 */}
      {(showChatList || showProfile) && (
        <div 
          className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50"
          style={{ zIndex: 1040 }}
          onClick={() => {
            setShowChatList(false);
            setShowProfile(false);
          }}
        />
      )}
      
      {/* 메시지 영역 - 구조 단순화 */}
      <div className="flex-grow-1 overflow-auto d-flex justify-content-center"
        style={{ 
          paddingTop: '0vh',     // Header 높이
          marginBottom: '8vh',  // Footer 높이
      }}>
        {/* 단순화된 구조 */}
        <div className="w-100 h-100 d-flex flex-column">
          {/* 스크롤바 영역 - px 여백 없음 */}
          <div className="flex-grow-1 overflow-auto">
            {/* 채팅 내용 영역 - px 여백 적용 */}
            <div className="py-3 mx-3 mx-md-3 mx-lg-4 mx-xl-5">
              <div className="px-3 px-md-3 px-lg-4 px-xl-3">
                {messages.map((message, index) => (
                  <div key={index} className={`message-wrapper mb-3 ${message.isUser ? 'text-end' : 'text-start'}`}>
                    <div className={`message-bubble d-inline-block px-3 py-2 ${
                      message.isUser 
                        ? 'bg-primary text-white' 
                        : 'bg-light text-dark border'
                    }`} style={{ 
                      maxWidth: '90%',
                      borderRadius: message.isUser ? '20px 20px 5px 20px' : '20px 20px 20px 5px',
                      wordWrap: 'break-word',
                      lineHeight: '1.4'
                    }}>
                      {renderMessageContent(message)}
                      <div className={`message-time small mt-1 ${
                        message.isUser ? 'text-white-50' : 'text-muted'
                      }`} style={{ fontSize: '0.75rem' }}>
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div ref={messagesEndRef} />
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer 
        text={text}
        setText={setText}
        handleSendClick={handleSendClick}
        handleKeyPress={handleKeyPress}
        handleFileSelect={handleFileSelect}
        loading={loading}
      />
    </div>
  );

}


export default ChatPage;

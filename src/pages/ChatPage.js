// src/pages/ChatPage.js
import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import ChatList from '../components/chat/ChatList';
import ProfilePanel from '../components/layout/ProfilePanel';
import JsonViewer from '../components/common/JsonViewer/JsonViewer';
import TextFormatter from '../components/common/TextFormatter/TextFormatter';
import { uploadAndAnalyzeFile, sendChatMessage } from '../services/ApiService';
import { parseMalwareAnalysisResponse, formatAnalysisMessage } from '../utils/parsers/MalwareAnalysisParser';

function ChatPage() {
  const location = useLocation();
  const [messages, setMessages] = useState([]);

  const { chatId } = useParams();
  const navigate = useNavigate();
  const initialFile = location.state?.file || null;
  const initialMessage = location.state?.message || '';
  const loadFromStorage = location.state?.loadFromStorage || false;
  const existingChatSession = location.state?.chatSession || null;

  const [headerTitle, setHeaderTitle] = useState('파일 내 악성 코드 분석 서비스');
  const hasAnalyzedRef = useRef(false);
  const isMountedRef = useRef(true);
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

  const handleMenuClick = () => setShowChatList(true);
  const handleProfileClick = () => setShowProfile(true);
  const handleCloseChatList = () => setShowChatList(false);
  const handleCloseProfile = () => setShowProfile(false);

  const generateRandomChatId = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 12; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleStartNewChat = () => {
    const newChatId = generateRandomChatId();
    console.log('새 채팅 시작:', newChatId);
    navigate(`/chat/${newChatId}`);
  };

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

  const restoreChatSession = (sessionData) => {
    if (!sessionData) return;
    console.log('채팅 세션 복원 중:', sessionData);

    if (sessionData.messages && sessionData.messages.length > 0) {
      setMessages(sessionData.messages);
    }

    if (sessionData.analysisResult) {
      setAnalysisResult(sessionData.analysisResult);
      const parsed = parseAnalysisResponse(sessionData.analysisResult);
      setParsedData(parsed);
      setSessionParsedData(parsed);
    }

    if (sessionData.title) {
      console.log('복원된 제목:', sessionData.title);
      setHeaderTitle(sessionData.title);
    } else if (sessionData.fileName) {
      const generatedTitle = `${sessionData.fileName} 파일의 악성 코드 분석`;
      console.log('생성된 제목:', generatedTitle);
      setHeaderTitle(generatedTitle);
    }
    setLoading(false);
  };

  const updateChatSession = (newMessage, isUser = false) => {
    try {
      const sessions = JSON.parse(localStorage.getItem('chatSessions') || '[]');
      const sessionIndex = sessions.findIndex(session => session.chatId === chatId);

      if (sessionIndex >= 0) {
        sessions[sessionIndex].messages.push(newMessage);
        sessions[sessionIndex].messageCount = sessions[sessionIndex].messages.length;
        sessions[sessionIndex].lastUpdated = new Date().toISOString();

        if (headerTitle) {
          sessions[sessionIndex].title = headerTitle;
        }
        localStorage.setItem('chatSessions', JSON.stringify(sessions));
        console.log('채팅 세션 업데이트됨:', chatId);
      } else {
        const newSession = {
          id: chatId,
          chatId: chatId,
          title: headerTitle || `${initialFile?.name || 'Unknown'} 파일의 악성 코드 분석`,
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

  const [sessionParsedData, setSessionParsedData] = useState(() => {
    const saved = localStorage.getItem('chatSessionData');
    return saved ? JSON.parse(saved) : null;
  });

  const parseAnalysisResponse = (response) => {
    try {
      console.log('=== 확장된 파싱 시작 ===');
      console.log('원본 응답:', response);
      
      const reportVT = response?.reportfromVT || {};
      const reportLLM = response?.reportfromLLM || {};
      const extractedId = response?.extractedId || '';
      
      const vtChatId = reportVT?._id || null;
      console.log('추출된 채팅 ID (reportfromVT._id):', vtChatId);
      
      const vtData = reportVT?.data || {};
      const vtAttributes = vtData?.attributes || {};
      
      // lastAnalysisResults가 null일 수 있으므로 빈 객체로 처리
      const lastAnalysisResults = vtAttributes?.lastAnalysisResults || {};
      const lastAnalysisStats = vtAttributes?.lastAnalysisStats || {};
      
      // 파일 정보들
      const fileInfo = vtAttributes?.names || [];
      const fileSize = vtAttributes?.size || 0;
      const fileType = vtAttributes?.type_description || '';
      const md5Hash = vtAttributes?.md5 || vtData?.id_SHA256 || ''; // SHA256을 md5 대신 사용
      const sha1Hash = vtAttributes?.sha1 || '';
      const sha256Hash = vtAttributes?.sha256 || vtData?.id_SHA256 || '';
      
      // lastAnalysisResults가 null이 아닐 때만 엔진 분석
      const maliciousEngines = lastAnalysisResults 
        ? Object.entries(lastAnalysisResults)
            .filter(([engine, result]) => result.category === 'malicious')
            .map(([engine, result]) => ({ engine, result: result.result }))
        : [];
      
      const suspiciousEngines = lastAnalysisResults
        ? Object.entries(lastAnalysisResults)
            .filter(([engine, result]) => result.category === 'suspicious')
            .map(([engine, result]) => ({ engine, result: result.result }))
        : [];
      
      const totalEngines = lastAnalysisResults ? Object.keys(lastAnalysisResults).length : 0;
      
      const parsedResult = {
        vtChatId: vtChatId,
        vtId: reportVT?._id || '',
        vtScanId: vtData?.id_SHA256 || '', // SHA256을 scanId로 사용
        vtMaliciousCount: lastAnalysisStats?.malicious || 0,
        vtSuspiciousCount: lastAnalysisStats?.suspicious || 0,
        vtUndetectedCount: lastAnalysisStats?.undetected || 0,
        vtHarmlessCount: lastAnalysisStats?.harmless || 0,
        vtTimeoutCount: lastAnalysisStats?.timeout || 0,
        vtFailureCount: lastAnalysisStats?.failure || 0,
        vtTotalEngines: totalEngines,
        vtDetectionRate: `${lastAnalysisStats?.malicious || 0}/${totalEngines}`,
        fileName: fileInfo[0] || response?.fileName || 'Unknown File', // 파일명 추가
        fileSize: fileSize,
        fileType: fileType,
        md5: md5Hash,
        sha1: sha1Hash,
        sha256: sha256Hash,
        vtMaliciousEngines: maliciousEngines,
        vtSuspiciousEngines: suspiciousEngines,
        vtMaliciousEnginesList: maliciousEngines.map(e => e.engine).join(', '),
        vtSuspiciousEnginesList: suspiciousEngines.map(e => e.engine).join(', '),
        llmId: reportLLM?._id || '',
        llmReport: reportLLM?.report || '', // 이 부분이 핵심!
        extractedId: extractedId,
        analysisDate: new Date().toISOString(),
        rawResponse: response
      };
      
      if (vtChatId) {
        setChatId_VT(vtChatId);
      }
      
      localStorage.setItem('chatSessionData', JSON.stringify(parsedResult));
      console.log('=== 확장된 파싱 완료, 채팅 ID 설정 ===', vtChatId);
      console.log('저장된 변수들:', Object.keys(parsedResult));
      console.log('LLM 리포트:', parsedResult.llmReport); // 디버깅용
      
      return parsedResult;
    } catch (error) {
      console.error('파싱 오류:', error);
      return null;
    }
  };

  const checkVariableExists = (variableName, parsedData) => {
    if (!parsedData) return false;
    const availableVariables = [
      'vtChatId', 'vtId', 'vtScanId', 'vtMaliciousCount', 'vtSuspiciousCount', 'vtUndetectedCount', 'vtHarmlessCount', 'vtTimeoutCount', 'vtFailureCount', 'vtTotalEngines', 'vtDetectionRate', 'fileName', 'fileSize', 'fileType', 'md5', 'sha1', 'sha256', 'vtMaliciousEnginesList', 'vtSuspiciousEnginesList', 'llmId', 'llmReport', 'extractedId', 'analysisDate'
    ];
    return availableVariables.includes(variableName);
  };

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
    // 값이 null/undefined이면 빈 문자열 말고 undefined 반환
    return variableMap.hasOwnProperty(variableName) ? variableMap[variableName] ?? null : null;
  };

  // **수정된 chatId 변경 useEffect - MainPage에서 넘어온 데이터 처리 통합**
  useEffect(() => {
    const analyzeInitialFile = async () => {
      console.log('=== ChatPage 초기화 시작 ===');
      console.log('chatId:', chatId);
      console.log('location.state:', location.state);
      
      setHeaderTitle(null);
      setLoading(false);
      setText('');

      // 기존 세션 복원 처리
      if (loadFromStorage && existingChatSession && existingChatSession.chatId === chatId) {
        restoreChatSession(existingChatSession);
        return;
      }

      const storedSession = loadChatSessionFromStorage(chatId);
      if (storedSession) {
        restoreChatSession(storedSession);
        return;
      }

      // MainPage에서 넘어온 데이터 처리
      const { file, result, preGeneratedReport } = location.state || {};
      const message = location.state?.message;

      if (file && result) {
        console.log('=== MainPage에서 넘어온 데이터 처리 ===');
        console.log('파일:', file.name);
        console.log('결과:', result);
        console.log('미리 생성된 리포트:', preGeneratedReport);

        // 1. 사용자 메시지 생성
        const userMsg = {
          isUser: true,
          text: message?.trim() ? `${file.name}\n${message.trim()}` : `${file.name}`,
          file: file.name,
          timestamp: new Date().toISOString()
        };

        // 2. AI 응답 메시지 생성
        let aiResponseText = '';
        
        if (preGeneratedReport && preGeneratedReport.trim()) {
          // MainPage에서 미리 생성된 report 사용
          aiResponseText = preGeneratedReport;
          console.log('미리 생성된 리포트 사용');
        } else {
          // 기존 파싱 로직 사용
          try {
            const parsed = parseMalwareAnalysisResponse(result);
            console.log('parseMalwareAnalysisResponse 결과:', parsed);

            const internalParsed = parseAnalysisResponse(result);
            setParsedData(internalParsed);
            setSessionParsedData(internalParsed);
            setAnalysisResult(result);

            const llmReport = parsed?.llmAnalysis?.report || parsed?.llmReport || internalParsed?.llmReport;
            if (llmReport && llmReport.trim()) {
              aiResponseText = llmReport;
            } else {
              const formattedMsg = formatAnalysisMessage(parsed);
              if (formattedMsg && formattedMsg !== '분석 결과를 파싱할 수 없습니다.') {
                aiResponseText = formattedMsg;
              } else {
                aiResponseText = `파일 분석이 완료되었습니다.\n\n파싱 결과:\n${JSON.stringify(internalParsed, null, 2)}`;
              }
            }
          } catch (error) {
            console.error('파싱 오류:', error);
            aiResponseText = `파일 분석이 완료되었습니다.\n\n원본 결과:\n${JSON.stringify(result, null, 2)}`;
          }
        }

        // 빈 문자열 방지
        if (!aiResponseText || aiResponseText.trim() === '') {
          aiResponseText = '파일 분석이 완료되었습니다. 분석 결과를 확인하려면 질문해주세요.';
        }

        // 3. AI 메시지 생성
        const aiMsg = {
          isUser: false,
          text: aiResponseText,
          timestamp: new Date().toISOString()
        };

        console.log('=== 대화창에 메시지 설정 ===');
        console.log('사용자 메시지:', userMsg);
        console.log('AI 메시지:', aiMsg);

        // 4. 메시지 설정 (TestPage처럼 즉시 표시)
        setMessages([userMsg, aiMsg]);

        // 5. 헤더 제목 설정
        setHeaderTitle(`${file.name} 파일의 악성 코드 분석`);

        // 6. 분석 결과 파싱 및 저장
        if (!preGeneratedReport) {
          try {
            const internalParsed = parseAnalysisResponse(result);
            setParsedData(internalParsed);
            setSessionParsedData(internalParsed);
            setAnalysisResult(result);
          } catch (error) {
            console.error('분석 결과 파싱 실패:', error);
          }
        }

        return;
      }

      // 기존 파일 분석 로직 (MainPage에서 오지 않은 경우)
      if (hasAnalyzedRef.current || !initialFile || !isMountedRef.current) {
        console.log('분석 스킵:', { hasAnalyzed: hasAnalyzedRef.current, hasFile: !!initialFile, isMounted: isMountedRef.current });
        return;
      }

      hasAnalyzedRef.current = true;
      const skipAnalysis = location.state?.skipAnalysis;
      const existingResult = location.state?.result;

      if (initialFile) {
        const userMessageText = initialMessage ? `${initialFile.name}\n${initialMessage}` : `${initialFile.name}`;
        const userMsg = {
          text: userMessageText,
          isUser: true,
          file: initialFile.name,
          timestamp: new Date().toISOString()
        };

        if (existingResult) {
          console.log('=== 기존 결과로 AI 메시지 생성 ===');
          const parsed = parseAnalysisResponse(existingResult);
          setParsedData(parsed);
          setSessionParsedData(parsed);
          setAnalysisResult(existingResult);

          let aiResponseText = '';
          try {
            const llmReport = parsed?.llmReport || parsed?.llmAnalysis?.report;
            if (llmReport) {
              aiResponseText = llmReport;
            } else {
              const formattedMsg = formatAnalysisMessage(parsed);
              if (formattedMsg && formattedMsg !== '분석 결과를 파싱할 수 없습니다.') {
                aiResponseText = formattedMsg;
              } else {
                aiResponseText = `파일 분석이 완료되었습니다.\n\n파싱 결과:\n${JSON.stringify(parsed, null, 2)}`;
              }
            }
          } catch (error) {
            console.error('AI 메시지 생성 오류:', error);
            aiResponseText = `파일 분석이 완료되었습니다.\n\n원본 결과:\n${JSON.stringify(existingResult, null, 2)}`;
          }

          if (!aiResponseText || aiResponseText.trim() === '') {
            aiResponseText = '파일 분석이 완료되었습니다. 분석 결과를 확인하려면 질문해주세요.';
          }

          const aiMsg = {
            text: aiResponseText,
            isUser: false,
            timestamp: new Date().toISOString()
          };

          setMessages([userMsg, aiMsg]);
        } else {
          setMessages([
            userMsg,
            { text: "분석 중입니다...", isUser: false, isLoading: true, timestamp: new Date().toISOString() }
          ]);
          setLoading(true);
        }
      }

      console.log('ChatPage 초기화 (단일 실행):', { initialFile: initialFile?.name, skipAnalysis, hasExistingResult: !!existingResult });

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
          const parsed = parseAnalysisResponse(result);
          setParsedData(parsed);
          setSessionParsedData(parsed);

          const llmReport = parsed?.llmReport || '분석 리포트를 찾을 수 없습니다.';

          setMessages(prev => {
            const filteredMessages = prev.filter(msg => !msg.isLoading);
            const aiMessage = {
              text: llmReport,
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

      if (loadFromStorage && location.state) {
        window.history.replaceState({}, document.title);
      }
    };

    analyzeInitialFile();
    
    return () => {
      isMountedRef.current = false;
    };
  }, [chatId, location.state]); // location.state도 의존성에 추가

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleFileSelect = (file) => {
    setSelectedFile(file);
  };

  const handleSendClick = async () => {
    console.log('handleSendClick 호출됨!', text);
    if ((!selectedFile && text.trim().length === 0) || loading) return;
    if (text.length > 3000) {
      alert('글자수는 최대 3000자까지 입력 가능합니다.');
      return;
    }

    const currentText = text.trim();
    const currentParsedData = sessionParsedData || parsedData;

    const userMessage = {
      text: currentText,
      isUser: true,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMessage]);
    updateChatSession(userMessage, true);

    setText('');
    setLoading(true);

    const loadingMessage = {
      text: "처리 중입니다...",
      isUser: false,
      isLoading: true,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, loadingMessage]);

    try {
      let responseText;

      if (checkVariableExists(currentText, currentParsedData)) {
        const variableValue = getValueByVariableName(currentText, currentParsedData);
        if (variableValue != null && variableValue !== '') {
          responseText = `${currentText}: ${variableValue}`;
        } else {
          responseText = `${currentText}: 값이 존재하지 않습니다.`; // 안내 메시지 추가
        }
        console.log('responseText:', responseText);
      } else {
        responseText = `${currentText}: 올바른 변수명이 아닙니다.`; // 없을 경우 안내
        console.log('responseText:', responseText);
      }

      if (selectedFile) {
        const result = await uploadAndAnalyzeFile(selectedFile);
        const newParsedData = parseAnalysisResponse(result);
        setSessionParsedData(newParsedData);
        setParsedData(newParsedData);
        setAnalysisResult(result);
        responseText = `파일 '${selectedFile.name}' 분석이 완료되었습니다. 분석 결과를 확인하려면 변수명을 입력하세요.`;
        setSelectedFile(null);
      }

      const aiMessage = {
        text: responseText,
        isUser: false,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => {
        const filteredMessages = prev.filter(msg => !msg.isLoading);
        return [...filteredMessages, aiMessage];
      });
      updateChatSession(aiMessage, false);
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

  const handleKeyPress = (e) => {
    console.log('handleKeyPress 호출됨!', e.key);
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendClick();
    }
  };

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

  const renderMessageContent = (message) => {
    if (message.isLoading) {
      return (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <span>처리 중...</span>
        </div>
      );
    }

    // JSON 데이터 처리
    if (message.text && (message.text.includes('{') || message.text.includes('['))) {
      try {
        const jsonData = JSON.parse(message.text);
        return <JsonViewer data={jsonData} />;
      } catch (e) {
        // JSON 파싱 실패시 TextFormatter로 처리
        return <TextFormatter text={message.text} />;
      }
    }

    // 일반 텍스트는 TextFormatter로 처리
    return <TextFormatter text={message.text} />;
  };
  
  return (
    <div className="chat-container d-flex flex-column">
      {/* Header - fixed 위치 */}
      <Header 
        title={headerTitle} // state로 관리되는 headerTitle 사용 
        onMenuClick={handleMenuClick}
        onProfileClick={handleProfileClick}
        onStartNewChat={handleStartNewChat}
        className="position-fixed w-100"
        style={{
          height: '10vh',
          background: 'linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(255,255,255,1) 40%, rgba(255,255,255,0.5) 75%, rgba(255,255,255,1) 100%)',
          backdropFilter: 'blur(5px)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.1)'
        }}
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
            onNewChat={handleStartNewChat}
            currentChatId={chatId}
          />
        </div>
      )}

      {/* 프로필 패널 사이드 패널 */}
      {showProfile && (
        <div className="position-fixed top-0 end-0 h-100 bg-white shadow-lg profile-panel" 
          style={{
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
          paddingTop: '10vh',     // Header 높이
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

// src/pages/ChatPage.js
import React, { useState, useRef, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { FaFile, FaPaperPlane, FaPaperclip } from 'react-icons/fa';
import Header from '../components/Main/Header';
import Footer from '../components/Main/Footer';
import ChatList from '../components/Main/ChatList';
import ProfilePanel from '../components/Main/ProfilePanel';
import JsonViewer from '../components/JsonViewer/JsonViewer';
import TextFormatter from '../components/TextFormatter/TextFormatter';
import { fetchScanResultById, uploadAndAnalyzeFile } from '../services/ApiService';
import { parseMalwareAnalysisResponse, formatAnalysisMessage } from '../utils/MalwareAnalysisParser';

function ChatPage() {
  const { chatId } = useParams();
  const location = useLocation();
  const initialFile = location.state?.file || null;
  const initialMessage = location.state?.message || '';

  // Header title 생성 - 이 부분만 추가
  const headerTitle = initialFile ? `'${initialFile.name}' 파일의 악성 코드 분석` : null;
  
  // useRef로 분석 실행 여부 추적 (Strict Mode 대응)
  const hasAnalyzedRef = useRef(false);
  const isMountedRef = useRef(true);
  
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
  }

  const [messages, setMessages] = useState(initialMessages);
  const [text, setText] = useState('');
  const [showChatList, setShowChatList] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [parsedData, setParsedData] = useState(null);
  const [loading, setLoading] = useState(initialFile ? true : false);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  // 메뉴 및 프로필 핸들러들
  const handleMenuClick = () => setShowChatList(true);
  const handleProfileClick = () => setShowProfile(true);
  const handleCloseChatList = () => setShowChatList(false);
  const handleCloseProfile = () => setShowProfile(false);
  const handleSelectChat = (chatId) => setShowChatList(false);

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
      
      // localStorage에 저장하여 세션 간 유지
      localStorage.setItem('chatSessionData', JSON.stringify(parsedResult));
      
      console.log('=== 확장된 파싱 완료 ===');
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
      'vtId', 'vtScanId', 'vtMaliciousCount', 'vtSuspiciousCount', 
      'vtUndetectedCount', 'vtHarmlessCount', 'vtTimeoutCount', 
      'vtFailureCount', 'vtTotalEngines', 'vtDetectionRate',
      'fileName', 'fileSize', 'fileType', 'md5', 'sha1', 'sha256',
      'vtMaliciousEngines', 'vtSuspiciousEngines', 'vtMaliciousEnginesList',
      'vtSuspiciousEnginesList', 'llmId', 'llmReport', 'extractedId', 'analysisDate'
    ];
    
    return availableVariables.includes(variableName);
  };

  // 변수명으로 값 조회하는 함수 (기존 함수 확장)
  const getValueByVariableName = (variableName, parsedData) => {
    if (!parsedData) return null;
    
    const variableMap = {
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

  // 서버에 질문을 전송하는 함수 (예시 코드)
  const sendQuestionToServer = async (question, context) => {
    /*
    try {
      // 예시: 서버 API 엔드포인트로 질문 전송
      const response = await fetch('/api/chat/question', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('authToken')}` // 인증 토큰
        },
        body: JSON.stringify({
          question: question,
          context: context, // 현재 분석 결과를 컨텍스트로 전달
          sessionId: sessionStorage.getItem('sessionId'), // 세션 ID
          timestamp: new Date().toISOString()
        })
      });
      
      if (!response.ok) {
        throw new Error(`서버 응답 오류: ${response.status}`);
      }
      
      const result = await response.json();
      return result.answer || '서버에서 응답을 받지 못했습니다.';
      
    } catch (error) {
      console.error('서버 통신 오류:', error);
      throw new Error(`서버와의 통신 중 오류가 발생했습니다: ${error.message}`);
    }
    */
  };

  // 초기 파일 분석 실행 - useRef로 중복 방지
  useEffect(() => {
    const analyzeInitialFile = async () => {
        if (hasAnalyzedRef.current || !initialFile || !isMountedRef.current) {
            console.log('분석 스킵:', { 
                hasAnalyzed: hasAnalyzedRef.current, 
                hasFile: !!initialFile, 
                isMounted: isMountedRef.current 
            });
            return;
        }

        hasAnalyzedRef.current = true;
        const skipAnalysis = location.state?.skipAnalysis;
        const existingResult = location.state?.result;

        console.log('ChatPage 초기화 (단일 실행):', { 
            initialFile: initialFile?.name, 
            skipAnalysis, 
            hasExistingResult: !!existingResult 
        });

        try {
            let result;
            if (existingResult) {
                console.log('기존 결과 사용:', existingResult);
                result = existingResult;
            } else if (!skipAnalysis) {
                console.log('새로 분석 시작');
                result = await uploadAndAnalyzeFile(initialFile);
            } else {
                console.error('결과가 없는데 skipAnalysis가 true입니다.');
                throw new Error('분석 결과를 찾을 수 없습니다.');
            }

            if (!isMountedRef.current) return;

            console.log('분석 결과 처리 중:', result);

            // 새로운 파싱 함수 사용
            const parsed = parseAnalysisResponse(result);
            setParsedData(parsed);

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

            setAnalysisResult(result); // result 사용
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
    };

    analyzeInitialFile();

    return () => {
        isMountedRef.current = false;
    };
  }, []);

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
        responseText = variableValue !== null ? 
          `${currentText}: ${variableValue}` : 
          `변수 '${currentText}'의 값을 찾을 수 없습니다.`;
        
        console.log('변수 조회 결과:', responseText);
        
      } else {
        // 2단계: 변수가 아닌 경우 서버에 질문 전송
        console.log('변수가 아닌 질문이므로 서버에 전송:', currentText);
        
        try {
          responseText = await sendQuestionToServer(currentText, currentParsedData);
          console.log('서버 응답:', responseText);
          
        } catch (serverError) {
          console.error('서버 통신 실패:', serverError);
          responseText = `죄송합니다. 현재 서버와 연결할 수 없습니다. 다음 변수들을 조회할 수 있습니다: vtId, vtScanId, vtMaliciousCount, fileName, fileSize, md5, sha256, llmReport 등`;
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
      setMessages(prev => {
        const filteredMessages = prev.filter(msg => !msg.isLoading);
        const aiMessage = {
          text: responseText,
          isUser: false,
          timestamp: new Date().toISOString()
        };
        return [...filteredMessages, aiMessage];
      });
      
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

  // 메시지 렌더링
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

    // 사용자 메시지에 파일이 포함된 경우
    if (message.isUser && message.file) {
      return (
        <div>
          <div className="d-flex align-items-center mb-2 p-2 bg-light rounded">
            <FaFile className="me-2 text-primary" />
            <strong className="text-primary">{message.file}</strong>
          </div>
          {message.text.replace(message.file, '').trim() && (
            <div className="mt-2">{message.text.replace(message.file, '').trim()}</div>
          )}
        </div>
      );
    }

    // AI 응답에서 \n을 <br>로 변환하여 표시
    if (!message.isUser) {
        return <TextFormatter text={message.text} />;
    }

    if (message.jsonResult) {
      return (
        <div>
          <p className="mb-3">{message.text}</p>
          <JsonViewer data={message.jsonResult} />
        </div>
      );
    }

    return <div style={{ whiteSpace: 'pre-wrap' }}>{message.text}</div>;
  };

  // 로고 클릭
  const handleLogoClick = () => {
    window.location.href = 'http://localhost:3000/';
  };

  return (
    <div className="chat-container d-flex flex-column vh-100">
      {/* Header - fixed 위치 */}
      <Header 
        onMenuClick={handleMenuClick}
        onProfileClick={handleProfileClick}
        className="position-fixed top-0 w-100"
        style={{ zIndex: 1030 }}
        title={headerTitle} // ChatPage에서는 파일명을 포함한 title 설정
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
      <div className="flex-grow-1 overflow-auto d-flex justify-content-center" style={{ 
        marginTop: '80px',     // Header 높이
        marginBottom: '80px',  // Footer 높이
        paddingTop: '20px',    // 첫 번째 메시지 여백
        paddingBottom: '20px'  // 마지막 메시지 여백
      }}>
        {/* 단순화된 구조 */}
        <div className="w-100 h-100 d-flex flex-column">
          {/* 수정: 모바일 작은 여백, 데스크톱 큰 여백 */}
          <div className="flex-grow-1 overflow-auto px-3 px-md-3 px-lg-4 px-xl-3 py-3 mx-3 mx-md-3 mx-lg-4 mx-xl-5">
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
            <div ref={messagesEndRef} />
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

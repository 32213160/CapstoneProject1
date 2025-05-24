// src/pages/ChatPage.js
import React, { useState, useRef, useEffect } from 'react';
import { FaFile, FaPaperPlane, FaPaperclip } from 'react-icons/fa';
import { useParams, useLocation } from 'react-router-dom';
import Header from '../components/Main/Header';
import Footer from '../components/Main/Footer';
import ChatList from '../components/Main/ChatList';
import ProfilePanel from '../components/Main/ProfilePanel';
import JsonViewer from '../components/JsonViewer/JsonViewer';
import { fetchScanResultById, uploadAndAnalyzeFile } from '../services/ApiService';
import { parseMalwareAnalysisResponse, formatAnalysisMessage } from '../utils/MalwareAnalysisParser';

function ChatPage() {
  const { chatId } = useParams();
  const location = useLocation();
  const initialFile = location.state?.file || null;
  const initialMessage = location.state?.message || '';
  
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

  // 초기 파일 분석 실행 - useRef로 중복 방지
  useEffect(() => {
    const analyzeInitialFile = async () => {
      // useRef로 중복 실행 방지
      if (hasAnalyzedRef.current || !initialFile || !isMountedRef.current) {
        console.log('분석 스킵:', { 
          hasAnalyzed: hasAnalyzedRef.current, 
          hasFile: !!initialFile,
          isMounted: isMountedRef.current 
        });
        return;
      }

      // 분석 시작 표시
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
        
        // 파싱 함수 사용
        const parsedResult = parseMalwareAnalysisResponse(result);
        const userFriendlyMessage = formatAnalysisMessage(parsedResult);
        
        console.log('파싱된 결과:', parsedResult);

        // 로딩 메시지 제거하고 AI 메시지 추가 (한 번에 처리)
        setMessages(prev => {
          const filteredMessages = prev.filter(msg => !msg.isLoading);
          const aiMessage = {
            text: `네, 다음은 ${initialFile.name}의 악성 코드를 분석한 결과입니다:`,
            isUser: false,
            jsonResult: result,
            parsedResult: parsedResult,
            summary: userFriendlyMessage,
            timestamp: new Date().toISOString()
          };
          console.log('AI 메시지 추가 (단일):', aiMessage);
          return [...filteredMessages, aiMessage];
        });
        
        setAnalysisResult(parsedResult);
        
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
    
    // 클린업 함수
    return () => {
      isMountedRef.current = false;
    };
  }, []); // 빈 의존성 배열 유지

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

    let userMessageText = text;
    let fileToUpload = null;
    
    if (selectedFile) {
      fileToUpload = selectedFile;
      userMessageText = text.trim() ? `${selectedFile.name}\n${text}` : `${selectedFile.name}`;
    }

    const userMessage = {
      text: userMessageText,
      isUser: true,
      file: selectedFile?.name,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setText('');
    setSelectedFile(null);
    setLoading(true);

    const loadingMessage = {
      text: "분석 중입니다...",
      isUser: false,
      isLoading: true,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, loadingMessage]);

    try {
      let result;
      
      if (fileToUpload) {
        result = await uploadAndAnalyzeFile(fileToUpload);
      } else {
        result = { message: "텍스트 메시지에 대한 응답입니다." };
      }

      // 로딩 메시지 제거하고 AI 메시지 추가 (한 번에 처리)
      setMessages(prev => {
        const filteredMessages = prev.filter(msg => !msg.isLoading);
        const aiMessage = {
          text: fileToUpload 
            ? `네, 다음은 ${fileToUpload.name}의 악성 코드를 분석한 결과입니다:` 
            : `네, 다음은 요청하신 내용에 대한 응답입니다:`,
          isUser: false,
          jsonResult: result,
          timestamp: new Date().toISOString()
        };
        return [...filteredMessages, aiMessage];
      });
      
      setAnalysisResult(result);
      
    } catch (error) {
      console.error('처리 실패:', error);
      
      setMessages(prev => {
        const filteredMessages = prev.filter(msg => !msg.isLoading);
        const errorMessage = {
          text: `죄송합니다, 처리 중 오류가 발생했습니다: ${error.message}`,
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

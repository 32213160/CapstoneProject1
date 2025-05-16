// src/pages/ChatPage.js
import React, { useState, useRef, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
//import '../../components/UI/Main.css';
import './ChatPage.css';
import Header from '../../components/Main/Header';
import ChatList from '../../components/Main/ChatList';
import ProfilePanel from '../../components/Main/ProfilePanel';
import { fetchScanResultById, uploadAndAnalyzeFile } from '../../services/ApiService';
import JsonViewer from '../../components/JsonViewer/JsonViewer';
import FileUploadButton from '../../components/FileHandler/FileUploadButton';
import SendButton from '../../components/FileHandler/SendButton';

function ChatPage() {
  const { chatId } = useParams();
  const location = useLocation();
  const initialFile = location.state?.file || null;
  const initialMessage = location.state?.message || '';
  // 초기 메시지 설정
  const initialMessages = [];
  
  if (initialFile) {
    // 사용자 메시지 구성 (파일명과 메시지)
    const userMessageText = initialMessage ? `${initialFile.name}\n${initialMessage}` : `${initialFile.name}`;
    initialMessages.push({
      text: userMessageText,
      isUser: true,
      file: initialFile.name,
      timestamp: new Date().toISOString()
    });
    
    // 시스템이 응답 준비 중 메시지
    initialMessages.push({
      text: "분석 중입니다...",
      isUser: false,
      isLoading: true,
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
  
  // 메뉴 버튼 클릭 시 (추가된 함수)
  const handleMenuClick = () => {
    setShowChatList(true);
  };
  
  // 프로필 버튼 클릭 시 (추가된 함수)
  const handleProfileClick = () => {
    setShowProfile(true);
  };
  
  // 채팅 리스트 패널 닫기 (추가된 함수)
  const handleCloseChatList = () => {
    setShowChatList(false);
  };
  
  // 프로필 패널 닫기 (추가된 함수)
  const handleCloseProfile = () => {
    setShowProfile(false);
  };
  
  // 채팅 선택 핸들러 (추가된 함수)
  const handleSelectChat = (chatId) => {
    // chatId에 따라 채팅 불러오기 (여기선 생략)
    setShowChatList(false);
  };
  
  // 초기 파일 분석 실행
  useEffect(() => {
    const analyzeInitialFile = async () => {
      if (initialFile) {
        try {
          // location.state에서 이미 분석 결과가 있는지 확인
          const existingResult = location.state?.result;
          let result;
          
          if (existingResult) {
            // 이미 분석된 결과가 있으면 사용
            result = existingResult;
          } else {
            // 없으면 새로 분석
            result = await uploadAndAnalyzeFile(initialFile);
          }
          
          // 로딩 메시지 제거
          setMessages(prev => prev.filter(msg => !msg.isLoading));
          
          // 분석 결과 추가
          setAnalysisResult(result);
          
          const aiMessage = {
            text: `네, 다음은 ${initialFile.name}의 악성 코드를 분석한 결과입니다:`,
            isUser: false,
            jsonResult: result,
            timestamp: new Date().toISOString()
          };
          
          setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
          console.error('파일 분석 실패:', error);
          
          // 로딩 메시지 제거
          setMessages(prev => prev.filter(msg => !msg.isLoading));
          
          // 에러 메시지 추가
          const errorMessage = {
            text: `죄송합니다, 파일 분석 중 오류가 발생했습니다: ${error.message}`,
            isUser: false,
            timestamp: new Date().toISOString()
          };
          
          setMessages(prev => [...prev, errorMessage]);
        } finally {
          setLoading(false);
        }
      }
    };
    
    analyzeInitialFile();
  }, [initialFile, location.state]);
  
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
    if ((!selectedFile && text.trim().length === 0) || loading) return;
    
    let userMessageText = text;
    let fileToUpload = null;
    
    // 파일이 선택된 경우
    if (selectedFile) {
      fileToUpload = selectedFile;
      userMessageText = text.trim() ? `${selectedFile.name}\n${text}` : `${selectedFile.name}`;
    }
    
    // 사용자 메시지 추가
    const userMessage = {
      text: userMessageText,
      isUser: true,
      file: selectedFile?.name,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setText('');
    setSelectedFile(null);
    
    // 로딩 표시
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
      
      // 파일 업로드 및 분석
      if (fileToUpload) {
        result = await uploadAndAnalyzeFile(fileToUpload);
      } else {
        // 텍스트만 있는 경우 처리
        // 여기서는 간단한 응답으로 대체
        result = { message: "텍스트 메시지에 대한 응답입니다." };
      }
      
      // 로딩 메시지 제거
      setMessages(prev => prev.filter(msg => !msg.isLoading));
      
      // 분석 결과 추가
      setAnalysisResult(result);
      
      const aiMessage = {
        text: fileToUpload ? 
          `네, 다음은 ${fileToUpload.name}의 악성 코드를 분석한 결과입니다:` : 
          `네, 다음은 요청하신 내용에 대한 응답입니다:`,
        isUser: false,
        jsonResult: result,
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('처리 실패:', error);
      
      // 로딩 메시지 제거
      setMessages(prev => prev.filter(msg => !msg.isLoading));
      
      // 에러 메시지 추가
      const errorMessage = {
        text: `죄송합니다, 처리 중 오류가 발생했습니다: ${error.message}`,
        isUser: false,
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  // 엔터키 전송
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendClick();
    }
  };
  
  // 메시지 렌더링(코드블록, 파일, 일반 텍스트)
  const renderMessageContent = (message) => {
    // 로딩 중인 메시지
    if (message.isLoading) {
      return <div className="loading-message">분석 중입니다...</div>;
    }
    
    // JSON 결과가 있는 경우
    if (message.jsonResult) {
      return (
        <>
          <p>{message.text}</p>
          <JsonViewer data={message.jsonResult} />
        </>
      );
    }
    
    // 일반 텍스트 - 코드 블록 처리 로직 제거
    return <p>{message.text}</p>;
  };

  // 로고 클릭
  const handleLogoClick = () => {
    window.location.href = 'http://localhost:3000/';
  };
  
  return (
    <div className="chat-container">
      <Header 
        onMenuClick={handleMenuClick} 
        onProfileClick={handleProfileClick}
        onLogoClick={handleLogoClick}
      />
      
      {showChatList && (
        <ChatList 
          onClose={handleCloseChatList} 
          onSelectChat={handleSelectChat}
        />
      )}
      
      {showProfile && (
        <ProfilePanel onClose={handleCloseProfile} />
      )}
      
      <div className="messages-container">
        {messages.map((message, index) => (
          <div 
            key={index} 
            className={`message ${message.isUser ? 'user-message' : 'ai-message'}`}
          >
            <div className="message-content">
              {renderMessageContent(message)}
            </div>
            <div className="message-time">
              {new Date(message.timestamp).toLocaleTimeString()}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="input-container">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="메시지를 입력하세요..."
          disabled={loading}
        />
        <div className="button-container">
          <FileUploadButton 
            onFileSelect={handleFileSelect} 
            disabled={loading}
            ref={fileInputRef}
          />
          {selectedFile && (
            <div className="selected-file">
              {selectedFile.name}
            </div>
          )}
          <SendButton onClick={handleSendClick} disabled={loading || (!selectedFile && text.trim().length === 0)} />
        </div>
      </div>
    </div>
  );
}

export default ChatPage;

// src/pages/ChatPage.js
import React, { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/Main/Header';
import ChatList from '../components/Main/ChatList';
import ProfilePanel from '../components/Main/ProfilePanel';
import { fetchScanResultById } from '../services/ApiService';
import JsonViewer from '../components/JsonViewer';
import FileUpload, { uploadFileAndGetResponse } from '../components/FileHandler/FileUpload';
import '../components/Main/Main.css';

function ChatPage() {
  const { chatId } = useParams();
  const [messages, setMessages] = useState([
    { text: "이 APK 파일을 분석해줘!", isUser: true, file: "sample.apk" },
    { text: "네, 다음은 .apk 파일의 악성 코드를 분석한 결과입니다:\n\n``````\n이 코드는 공격자가 시스템에 원격으로 접근할 수 있도록 숨겨진 통로를 만듭니다.", isUser: false }
  ]);
  const [text, setText] = useState('');
  const [showChatList, setShowChatList] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  // 채팅 목록 예시 데이터
  const chatList = [
    { id: 1, title: "'sample.apk' 파일의 악성 코드 분석", date: "오늘" },
    { id: 2, title: "Aegis.apk 파일의 악성 코드...", date: "어제" },
    { id: 3, title: "DanS.apk 파일의 악성 코드...", date: "어제" },
    { id: 4, title: "Danjeong.apk 파일의 악성 코드...", date: "2 days ago" },
    { id: 5, title: "NEWSWEEK.apk 파일의 악성 코드...", date: "2 days ago" },
    { id: 6, title: "ex.apk 악성 코드 분석 및 설명", date: "2 days ago" },
  ];

  // 날짜별 그룹핑
  const groupedChats = chatList.reduce((acc, chat) => {
    acc[chat.date] = acc[chat.date] ? [...acc[chat.date], chat] : [chat];
    return acc;
  }, {});

  // 자동 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 채팅 목록에서 채팅 선택 - ID로 결과 가져오기
  const handleSelectChat = async (chatId) => {
    try {
      setLoading(true);
      const result = await fetchScanResultById(chatId);
      // 결과 유효성 검사
      if (!result || Object.keys(result).length === 0) {
        throw new Error('서버에 분석 결과가 없습니다');
      }
      setAnalysisResult(result);
      setMessages([
        { text: `${result.fileName || 'APK 파일'}을 분석해줘!`, isUser: true, file: result.fileName },
        { text: `네, 다음은 ${result.fileName || 'APK 파일'}의 분석 결과입니다:`, isUser: false, jsonResult: result }
      ]);
    } catch (error) {
      console.error('채팅 불러오기 실패:', error);
      setMessages(prev => [
        ...prev,
        { text: `❌ 오류: ${error.message}`, isUser: false, timestamp: new Date().toISOString() }
      ]);
    } finally {
      setLoading(false);
      setShowChatList(false);
    }
  };

  // 파일 선택 핸들러
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // 파일 업로드 버튼 클릭 핸들러
  const handleFileButtonClick = () => {
    fileInputRef.current.click();
  };

  // 파일 업로드 처리
  const handleFileUpload = async () => {
    if (!selectedFile) {
      return;
    }

    // 사용자 메시지 추가
    const userMessage = {
      text: `${selectedFile.name} 파일을 분석해줘!`,
      isUser: true,
      file: selectedFile.name,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMessage]);
    
    setLoading(true);
    
    try {
      // uploadFileAndGetResponse 함수 사용
      const result = await uploadFileAndGetResponse(selectedFile);
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      setAnalysisResult(result);
      
      // AI 응답 메시지 추가
      const aiMessage = {
        text: `네, 다음은 ${selectedFile.name}의 악성 코드를 분석한 결과입니다:`,
        isUser: false,
        jsonResult: result,
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('파일 업로드 실패:', error);
      
      // 에러 메시지 추가
      const errorMessage = {
        text: `죄송합니다, 파일 분석 중 오류가 발생했습니다: ${error.message}`,
        isUser: false,
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // 파일 업로드 시작 시 호출될 함수 (기존 FileUpload 컴포넌트용)
  const handleUploadStart = (file) => {
    setLoading(true);
    // 사용자 메시지 추가
    const userMessage = {
      text: "",
      isUser: true,
      file: file.name,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMessage]);
  };

  // 파일 업로드 완료 시 호출될 함수 (기존 FileUpload 컴포넌트용)
  const handleUploadComplete = (result, file, error) => {
    setLoading(false);
    if (error || !result) {
      setMessages(prev => [
        ...prev,
        { text: "죄송합니다, 파일 분석 중 오류가 발생했습니다.", isUser: false, timestamp: new Date().toISOString() }
      ]);
      return;
    }
    setAnalysisResult(result);
    // AI 응답 메시지 추가
    const aiMessage = {
      text: `네, 다음은 ${file.name}의 악성 코드를 분석한 결과입니다:`,
      isUser: false,
      jsonResult: result,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, aiMessage]);
  };

  // 메시지 전송
  const handleSendClick = async () => {
    if (text.trim().length === 0) return;
    if (text.length > 3000) {
      alert('글자수는 최대 3000자까지 입력 가능합니다.');
      return;
    }
    
    // 1. "ID: ..." 형식인지 확인
    const idPattern = /^ID:\s*([a-fA-F0-9]{24})$/;
    const match = text.trim().match(idPattern);
    if (match) {
      // 2. ID 추출
      const id = match[1];
      setMessages(prev => [
        ...prev,
        { text, isUser: true, timestamp: new Date().toISOString() }
      ]);
      setText('');
      try {
        setLoading(true);
        const result = await fetchScanResultById(id);
        setAnalysisResult(result);
        setMessages(prev => [
          ...prev,
          { text: `네, ID: ${id}의 분석 결과입니다:`, isUser: false, jsonResult: result, timestamp: new Date().toISOString() }
        ]);
      } catch (error) {
        setMessages(prev => [
          ...prev,
          { text: `죄송합니다, ID: ${id}에 대한 결과를 가져오는 중 오류가 발생했습니다.`, isUser: false, timestamp: new Date().toISOString() }
        ]);
      } finally {
        setLoading(false);
      }
      return;
    }

    // 기존 일반 메시지 처리
    const newUserMessage = {
      text: text,
      isUser: true,
      timestamp: new Date().toISOString()
    };
    setMessages([...messages, newUserMessage]);
    setText('');
    setTimeout(() => {
      const newResponse = {
        text: "네, 다음은 APK 파일의 악성 코드를 분석한 결과입니다:\n\n``````\n이 코드는 공격자가 시스템에 원격으로 접근할 수 있도록 숨겨진 통로를 만듭니다.",
        isUser: false,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, newResponse]);
    }, 1000);
  };

  // 엔터키 전송
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendClick();
    }
  };

  // 메뉴/프로필 패널 토글
  const handleMenuClick = () => setShowChatList(true);
  const handleProfileClick = () => setShowProfile(true);
  const handleCloseChatList = () => setShowChatList(false);
  const handleCloseProfile = () => setShowProfile(false);

  // 메시지 렌더링(파일, JSON 결과, 코드블록, 일반 텍스트)
  const renderMessageContent = (message) => {
    // 파일 메시지
    if (message.file) {
      return (
        <div className="file-message">
          <span className="file-icon">📁</span>
          <span className="file-name">{message.file}</span>
          {message.text && <div className="file-text">{message.text}</div>}
        </div>
      );
    }
    
    // JSON 결과가 있는 메시지
    if (message.jsonResult) {
      return (
        <>
          <div>{message.text}</div>
          <JsonViewer data={message.jsonResult} />
        </>
      );
    }
    
    // 일반 텍스트 메시지 (코드 블록 처리)
    const codeBlockRegex = /``````/g;
    let match;
    let lastIndex = 0;
    const parts = [];
    
    while ((match = codeBlockRegex.exec(message.text)) !== null) {
      // 코드 블록 이전 텍스트
      if (match.index > lastIndex) {
        parts.push(message.text.slice(lastIndex, match.index));
      }
      
      // 코드 블록
      parts.push(
        <pre className="code-block">
          <code>{match[1]}</code>
        </pre>
      );
      
      lastIndex = codeBlockRegex.lastIndex;
    }
    
    // 마지막 코드 블록 이후 텍스트
    if (lastIndex < message.text.length) {
      parts.push(message.text.slice(lastIndex));
    }
    
    return parts.length > 0 ? parts : message.text;
  };

  return (
    <div className="chat-page">
      <Header 
        onMenuClick={handleMenuClick} 
        onProfileClick={handleProfileClick}
      />
      
      <div className="chat-container">
        <div className="messages">
          {messages.map((message, index) => (
            <div 
              key={index} 
              className={`message ${message.isUser ? 'user-message' : 'ai-message'}`}
            >
              <div className="message-content">
                {renderMessageContent(message)}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        
        <div className="input-container">
          {/* 파일 업로드 입력 필드 (숨김) */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            style={{ display: 'none' }}
            accept=".apk"
          />
          
          {/* 파일 업로드 버튼 */}
          <button 
            className="upload-button" 
            onClick={handleFileButtonClick}
            disabled={loading}
          >
            📎
          </button>
          
          {/* 선택된 파일이 있으면 업로드 버튼 표시 */}
          {selectedFile && (
            <div className="selected-file-container">
              <span className="selected-file-name">{selectedFile.name}</span>
              <button 
                className="upload-submit-button" 
                onClick={handleFileUpload}
                disabled={loading}
              >
                {loading ? "업로드 중..." : "업로드"}
              </button>
            </div>
          )}
          
          {/* 기존 FileUpload 컴포넌트 (선택적으로 사용) */}
          {/* <FileUpload 
            onUploadComplete={handleUploadComplete}
            onUploadStart={handleUploadStart}
            buttonText="📎"
          /> */}
          
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="메시지를 입력하세요..."
            disabled={loading}
          />
          <button 
            onClick={handleSendClick} 
            disabled={loading || text.trim().length === 0}
          >
            전송
          </button>
        </div>
      </div>
      
      {showChatList && (
        <ChatList 
          chats={groupedChats} 
          onClose={handleCloseChatList}
          onSelectChat={handleSelectChat}
        />
      )}
      
      {showProfile && (
        <ProfilePanel onClose={handleCloseProfile} />
      )}
      
      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <div className="loading-text">분석 중...</div>
        </div>
      )}
    </div>
  );
}

export default ChatPage;

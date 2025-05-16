// Main.js
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../components/UI/Main.css';
import Header from '../../components/Main/Header';
import ChatList from '../../components/Main/ChatList';
import ProfilePanel from '../../components/Main/ProfilePanel';
import FileUpload from '../../components/FileHandler/FileUpload';
import { uploadAndAnalyzeFile } from '../../services/ApiService';

/*
// src/components/MainPage/Main.js

function Main() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [scanId, setScanId] = useState(null); // scanId 상태 추가
  const navigate = useNavigate();

  // 파일 업로드 완료 시 호출될 함수
  const handleUploadComplete = (result, file) => {
    if (result) {
      let scanKeyId = uploadAndAnalyzeFile(file);

      // ID 설정 및 페이지 이동
      setScanId(scanKeyId);
      console.log("사용할 스캔 ID:", scanKeyId);
      
      navigate(`/chat/${scanKeyId}`, {
        state: {
          file: file,
          message: text.trim(),
          result: result  // 전체 결과도 함께 전달
        }
      });
    }
  };

  // 파일 업로드 시작 시 호출될 함수
  const handleUploadStart = () => {
    setLoading(true);
  };

  // 메시지 전송
  const handleSendClick = () => {
    if (text.trim().length === 0) return;
    if (text.length > 3000) {
      alert('글자수는 최대 3000자까지 입력 가능합니다.');
      return;
    }

    // 서버에 채팅 생성 요청 후, 채팅 고유번호(chatId)로 이동
    // 아래는 예시: 실제로는 서버에서 chatId를 받아와야 함
    const chatId = Date.now(); // 임시로 timestamp 사용 (실제로는 서버 응답값)
    navigate(`/chat/${chatId}`);
  };

  // 엔터키 전송
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendClick();
    }
  };

  // 로고 클릭
  const handleLogoClick = () => {
    window.location.href = 'http://localhost:3000/';
  };

  return (
    <div className="main-container">
      <Header />
      <div className="main-content">
        <div className="upload-section">
          <h2>APK 파일을 업로드하여 악성 코드를 분석해보세요.</h2>
          <FileUpload 
            onUploadComplete={handleUploadComplete} 
            onUploadStart={handleUploadStart}
            buttonText="파일 선택"
          />
          
          <div className="message-input-container">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="분석 요청 메시지를 입력하세요 (선택사항)"
              maxLength={3000}
            />
          </div>
          
          {scanId && (
            <div className="scan-info">
              <span>스캔 ID: {scanId}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Main;

*/
function Main() {
  // 상태 관리
  const [text, setText] = useState('');
  const [messages, setMessages] = useState([
    { text: "이 APK 파일을 분석해줘!", isUser: true, file: "sample.apk" },
    { text: "네, 다음은 .apk 파일의 악성 코드를 분석한 결과입니다:\n\n``````\n이 코드는 공격자가 시스템에 원격으로 접근할 수 있도록 숨겨진 통로를 만듭니다.", isUser: false }
  ]);
  const [showChatList, setShowChatList] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  // 채팅 전송
  const handleSendClick = () => {
    if (text.trim().length === 0) return;
    if (text.length > 3000) {
      alert('글자수는 최대 3000자까지 입력 가능합니다.');
      return;
    }
    const newUserMessage = { text: text, isUser: true };
    setMessages([...messages, newUserMessage]);
    setText('');
    setTimeout(() => {
      const newResponse = {
        text: "네, 다음은 .apk 파일의 악성 코드를 분석한 결과입니다:\n\n``````\n이 코드는 공격자가 시스템에 원격으로 접근할 수 있도록 숨겨진 통로를 만듭니다.",
        isUser: false
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

  // 자동 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="chatContainer">
      <Header
        onMenuClick={handleMenuClick}
        onProfileClick={handleProfileClick}
      />

      {/* 채팅 리스트 패널 */}
      {showChatList && (
        <div className="chatListPanel">
          <button className="closeProfilePanel" onClick={handleCloseChatList} style={{ float: 'right' }}>×</button>
          <ChatList chats={chatList} onSelectChat={handleSelectChat} />
        </div>
      )}

      {/* 프로필 패널 */}
      {showProfile && (
        <div className="profilePanel">
          <ProfilePanel onClose={handleCloseProfile} />
        </div>
      )}

      {/* 채팅 메시지 영역 */}
      <div className="messagesContainer">
        <div className="messagesOverflow">
          {messages.map((message, idx) => (
            <div
              key={idx}
              className={message.isUser ? "userMessageWrapper" : "responseMessageWrapper"}
            >
              <div className={message.isUser ? "userMessageBubble" : "responseMessageBubble"}>
                {renderMessageContent(message)}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* 입력창 */}
      <div className="chatInputContainer">
        <button className="fileButton" onClick={handleFileButtonClick}>📎</button>
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
        <textarea
          className="chatTextField"
          placeholder="메시지를 입력하세요..."
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKeyPress}
          maxLength={3000}
        />
        <button className="sendButton" onClick={handleSendClick}>➤</button>
      </div>
    </div>
  );
}

export default Main;

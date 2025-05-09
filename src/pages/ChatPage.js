// src/pages/ChatPage.js
import React, { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/Main/Header';
import ChatList from '../components/Main/ChatList'; // ChatList 컴포넌트 import
import '../components/Main/Main.css';

function ChatPage() {
  const { chatId } = useParams();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [showChatList, setShowChatList] = useState(false); // ChatList 표시 여부 상태
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleFileButtonClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    // 파일 업로드 로직 (필요시 구현)
  };

  const handleSendClick = () => {
    if (text.trim().length === 0) return;
    if (text.length > 3000) {
      alert('글자수는 최대 3000자까지 입력 가능합니다.');
      return;
    }
    const newUserMessage = {
      text: text,
      isUser: true,
      timestamp: new Date().toISOString()
    };
    setMessages([...messages, newUserMessage]);
    setText('');

    // 샘플 응답 (실제로는 서버 호출)
    setTimeout(() => {
      const newResponse = {
        text: "이 APK 파일에서 악성 코드가 발견되었습니다. 'nc -lvp 4444 -e /bin/bash' 명령은 해커가 원격으로 시스템에 접근할 수 있는 백도어를 생성합니다. 이 코드는 공격자가 시스템에 원격으로 접근할 수 있도록 숨겨진 통로를 만듭니다.",
        isUser: false,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, newResponse]);
    }, 1000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendClick();
    }
  };

  // 메뉴 버튼 클릭 시 ChatList 열기
  const handleMenuClick = () => {
    setShowChatList(true);
  };

  // ChatList 닫기
  const handleCloseChatList = () => {
    setShowChatList(false);
  };

  // 예시용 채팅 목록 데이터 (실제 데이터로 교체 가능)
  const chatList = [
    // 임의의 날짜를 코드에 직접 입력해두었습니다. (나중에 서버 데이터로 교체)
    { id: 1, title: "'sample.apk' 파일의 악성 코드 분석", date: "2025-05-10" }, // 오늘 날짜 예시
    { id: 2, title: "Aegis.apk 파일의 악성 코드...", date: "2025-05-09" }, // 어제 날짜 예시
    { id: 3, title: "DanS.apk 파일의 악성 코드...", date: "2025-05-09" }, // 어제 날짜 예시
    { id: 4, title: "Danjeong.apk 파일의 악성 코드...", date: "2025-05-08" }, // 이틀 전 예시
    // TODO: 날짜는 나중에 서버 데이터로 대체
  ];

  return (
    <div className="chatContainer">
      {/* Header에 메뉴 클릭 핸들러 전달 */}
      <Header onMenuClick={handleMenuClick} title="'sample.apk' 파일의 악성 코드 분석" />

      {/* ChatList 패널: showChatList가 true일 때만 표시 */}
      {showChatList && (
        <div
          className="chatListPanel"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(245,247,250,0.97)',
            zIndex: 100,
            overflowY: 'auto',
          }}
        >
          <button
            className="closeProfilePanel"
            style={{ position: 'absolute', top: 20, right: 24, fontSize: 28, background: 'none', border: 'none', cursor: 'pointer' }}
            onClick={handleCloseChatList}
            aria-label="Close chat list"
          >
            ×
          </button>
          {/* ChatList 컴포넌트에 채팅 목록과 닫기 함수 전달 */}
          <ChatList chats={chatList} onSelectChat={handleCloseChatList} />
        </div>
      )}

      {/* 메시지 영역 */}
      <div className="messagesContainer">
        <div className="messagesOverflow">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={msg.isUser ? "userMessageWrapper" : "responseMessageWrapper"}
            >
              <div className={msg.isUser ? "userMessageBubble" : "responseMessageBubble"}>
                {msg.text}
                {msg.file && <div><small>파일: {msg.file}</small></div>}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* 입력창 */}
      <div className="chatInputContainer">
        <button className="fileButton" onClick={handleFileButtonClick} aria-label="Attach file">📎</button>
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
        <textarea
          className="chatTextField"
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKeyPress}
          maxLength={3000}
          placeholder="메시지를 입력하세요..."
          rows={1}
        />
        <button className="sendButton" onClick={handleSendClick} aria-label="Send message">➡️</button>
      </div>
    </div>
  );
}

export default ChatPage;

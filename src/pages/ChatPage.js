// src/pages/ChatPage.js
import React, { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/Main/Header';
import '../components/Main/Main.css';

function ChatPage() {
  const { chatId } = useParams();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
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
    // 파일 업로드 로직
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

  const handleMenuClick = () => {
    alert("메뉴 기능이 여기에 구현됩니다.");
  };

  return (
    <div className="chatContainer">
      <Header onMenuClick={handleMenuClick} />
      <div className="messagesContainer">
        <div className="messagesOverflow">
          <div className="fadeGradient"></div>
          {messages.map((message, index) => (
            <div
              key={index}
              className={message.isUser ? "userMessageWrapper" : "responseMessageWrapper"}
            >
              <div className={message.isUser ? "userMessageBubble" : "responseMessageBubble"}>
                {message.text}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>
      <div className="chatInputContainer">
        <button className="fileButton" onClick={handleFileButtonClick}>
          <i>📎</i>
        </button>
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyPress}
          maxLength={3000}
          placeholder="질문을 입력하세요..."
          className="chatTextField"
        />
        <button
          className="sendButton"
          onClick={handleSendClick}
          disabled={text.trim().length === 0}
        >
          <i>➤</i>
        </button>
      </div>
    </div>
  );
}

export default ChatPage;

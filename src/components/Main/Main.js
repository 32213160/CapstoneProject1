// Main.js
import React, { useState, useRef, useEffect } from 'react';
// SlidingPanel import 제거됨
import './components/Main/Main.css';
import Header from './components/Main/Header';
import ChatList from './components/Main/ChatList';
import ProfilePanel from './components/Main/ProfilePanel';

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

  // 채팅 목록에서 채팅 선택
  const handleSelectChat = (chatId) => {
    // chatId에 따라 채팅 불러오기 (여기선 생략)
    setShowChatList(false);
  };

  // 파일 첨부 버튼 클릭 시 숨겨진 파일 input 클릭
  const handleFileButtonClick = () => {
    fileInputRef.current.click();
  };

  // 파일 선택 후 메시지에 파일명 추가(예시)
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMessages([...messages, { text: "", isUser: true, file: file.name }]);
    }
  };

  // 메뉴 버튼 클릭 시
  const handleMenuClick = () => setShowChatList(true);

  // 프로필 버튼 클릭 시
  const handleProfileClick = () => setShowProfile(true);

  // 프로필 패널 닫기
  const handleCloseProfile = () => setShowProfile(false);

  // 채팅 리스트 패널 닫기
  const handleCloseChatList = () => setShowChatList(false);

  // 메시지 렌더링(코드블록, 파일, 일반 텍스트)
  const renderMessageContent = (message) => {
    // 파일 메시지
    if (message.file) {
      return (
        <div>
          <span role="img" aria-label="파일">📎</span> {message.file}
        </div>
      );
    }
    // 코드블록
    const regex = /``````/g;
    let lastIndex = 0;
    let match;
    const parts = [];
    while ((match = regex.exec(message.text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(message.text.slice(lastIndex, match.index));
      }
      parts.push(
        <pre key={match.index}>
          <code>{match[2]}</code>
        </pre>
      );
      lastIndex = regex.lastIndex;
    }
    if (lastIndex < message.text.length) {
      parts.push(message.text.slice(lastIndex));
    }
    return parts.map((part, idx) => <span key={idx}>{part}</span>);
  };

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

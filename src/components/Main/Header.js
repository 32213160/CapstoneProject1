// src/components/Main/Header.js
import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaBars, FaUserCircle } from 'react-icons/fa';

function Header({ onMenuClick, onProfileClick, title = "'sample.apk' 파일의 악성 코드 분석" }) {
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
    <nav className="navbar navbar-light fixed-top shadow-sm" style={{
      backgroundImage: 'linear-gradient(to bottom, rgba(255,255,255,1) 0%, rgba(255,255,255,0.9) 100%)',
      padding: '0.8rem 1rem',
      height: '65px',
      zIndex: 1030
    }}>
      <div className="container-fluid d-flex justify-content-between align-items-center">
        <button 
          className="btn btn-link text-dark border-0 p-1" 
          onClick={onMenuClick}
          style={{ fontSize: '1.2rem' }}
        >
          <FaBars />
        </button>
        <h5 className="m-0 text-center text-truncate fw-bold" style={{ flex: 1, maxWidth: '70%' }}>
          {title}
        </h5>
        <button 
          className="btn btn-link text-dark border-0 p-1" 
          onClick={onProfileClick}
          style={{ fontSize: '1.2rem' }}
        >
          <FaUserCircle />
        </button>
      </div>
    </nav>
  );
}

export default Header;

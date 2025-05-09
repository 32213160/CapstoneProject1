// src/pages/MainPage.js
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Main/Header';
import '../components/Main/Main.css';

function MainPage() {
  const [text, setText] = useState('');
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  // 파일 첨부 버튼 클릭 시 숨겨진 파일 input 클릭
  const handleFileButtonClick = () => {
    fileInputRef.current.click();
  };

  // 파일 선택 후 서버 업로드 예시 (생략 가능)
  const handleFileChange = async (e) => {
    // 파일 업로드 로직
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
    window.location.href = 'http://example.com';
  };

  return (
    <>
      <div className="headerContainer">
        <Header />
      </div>
      <div className="container">
        {/* 1열: 로고 */}
        <div className="column">
          <img
            src="logo512.png"
            alt="Logo"
            className="logo"
            onClick={handleLogoClick}
          />
        </div>
        {/* 2열: 파일첨부, 텍스트필드, 전송버튼 */}
        <div className="column">
          <div className="inputRow">
            <button className="fileButton" onClick={handleFileButtonClick}>
              <i>📎</i>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyPress}
              maxLength={3000}
              placeholder="메시지를 입력하세요"
              className="textField"
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
      </div>
    </>
  );
}

export default MainPage;

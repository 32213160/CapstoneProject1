// src/pages/MainPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/UI/Header';
import FileUpload from '../../components/FileHandler/FileUpload';
import '../../components/Main/Main.css';

function MainPage() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // 파일 업로드 완료 시 호출될 함수
  const handleUploadComplete = (result, file) => {
    if (result && result.id) {
      // 분석 결과가 있으면 해당 채팅 페이지로 이동
      navigate(`/chat/${result.id}`);
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
        <div className="welcome-section">
          <h1>APK 파일 분석 서비스</h1>
          <p>APK 파일을 업로드하여 악성 코드를 분석해보세요.</p>
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
            <FileUpload 
              onUploadStart={handleUploadStart}
              onUploadComplete={handleUploadComplete}
              buttonText="APK 파일 업로드"
            />
            
            <button 
              onClick={handleSendClick} 
              disabled={loading || text.trim().length === 0}
            >
              전송
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MainPage;

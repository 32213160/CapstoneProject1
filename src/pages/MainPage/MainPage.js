// src/pages/MainPage.js
import React, { useState, useRef, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './MainPage.css';

import { useNavigate } from 'react-router-dom';
import Header from '../../components/Main/Header';
import FileUpload from '../../components/FileHandler/FileUpload';
import { uploadAndAnalyzeFile } from '../../services/ApiService';

function MainPage() {
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
    
    // 메시지를 state로 전달하도록 수정
    navigate(`/chat/${chatId}`, {
      state: {
        message: text.trim()
      }
    });
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
    <div className="mainContainer">
      <Header />
      <div className="mainContent">
        <div className="welcome-container">
          <h2>APK 파일을 업로드하여 악성 코드를 분석해보세요.</h2>
        </div>

        <div className="inputContainer">
          <FileUpload
            className="fileUploadButton"
            onUploadComplete={handleUploadComplete} 
            onUploadStart={handleUploadStart}
            buttonText="파일 선택"
          />
          <textarea
            className="textInput"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="분석 요청 메시지를 입력하세요 (선택사항)"
            maxLength={3000}
          />

          <div className="sendButtonContainer">
            <button 
              className="sendButton"
              onClick={handleSendClick}
              disabled={text.trim().length === 0}
            >
              전송
            </button>
          </div>
        </div>
        
        {scanId && (
          <div className="scanInfo">
            <span>스캔 ID: {scanId}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default MainPage;

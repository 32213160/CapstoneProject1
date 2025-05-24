// src/pages/MainPage.js
import React, { useState, useRef, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Main/Header';
import FileUpload from '../../components/FileHandler/FileUpload';
import { uploadAndAnalyzeFile } from '../../services/ApiService';

function MainPage() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [scanId, setScanId] = useState(null);
  const navigate = useNavigate();

  // 파일 업로드 완료 시 호출될 함수
  const handleUploadComplete = (result, file) => {
    if (result) {
      let scanKeyId = uploadAndAnalyzeFile(file);
      setScanId(scanKeyId);
      console.log("사용할 스캔 ID:", scanKeyId);
      navigate(`/chat/${scanKeyId}`, {
        state: {
          file: file,
          message: text.trim(),
          result: result
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

    const chatId = Date.now();
    navigate(`/chat/${chatId}`, {
      state: { message: text.trim() }
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
    <div className="container-fluid vh-100 d-flex flex-column">
      <Header />
      
      {/* 메인 콘텐츠 영역 */}
      <div className="flex-grow-1 d-flex flex-column justify-content-center align-items-center px-3">
        
        {/* 환영 메시지 컨테이너 */}
        <div className="text-center mb-5">
          <div className="mb-4">
            <h2 className="display-6 fw-bold text-primary mb-3">
              APK 파일을 업로드하여 악성 코드를 분석해보세요.
            </h2>
            <p className="lead text-muted">
              안전하고 빠른 악성코드 분석 서비스를 제공합니다.
            </p>
          </div>
        </div>

        {/* 입력 컨테이너 */}
        <div className="w-100" style={{ maxWidth: '800px' }}>
          <div className="row g-2 align-items-center mb-3">
            {/* 파일 업로드 버튼 */}
            <div className="col-auto">
              <FileUpload
                onUploadComplete={handleUploadComplete}
                onUploadStart={handleUploadStart}
                className="btn btn-outline-primary d-flex align-items-center justify-content-center"
                style={{ width: '50px', height: '50px' }}
              />
            </div>
            
            {/* 텍스트 입력 */}
            <div className="col">
              <textarea
                className="form-control"
                placeholder="메시지를 입력하세요..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyPress={handleKeyPress}
                rows="2"
                maxLength={3000}
                style={{ resize: 'none' }}
              />
            </div>
          </div>

          {/* 전송 버튼 컨테이너 */}
          <div className="d-flex justify-content-center">
            <button
              className="btn btn-primary px-4 py-2"
              onClick={handleSendClick}
              disabled={loading || text.trim().length === 0}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  분석 중...
                </>
              ) : (
                '전송'
              )}
            </button>
          </div>

          {/* 글자 수 표시 */}
          <div className="text-end mt-2">
            <small className={`text-muted ${text.length > 2800 ? 'text-warning' : ''} ${text.length >= 3000 ? 'text-danger' : ''}`}>
              {text.length}/3000
            </small>
          </div>
        </div>

        {/* 추가 정보 섹션 */}
        <div className="mt-5 text-center">
          <div className="row g-4 justify-content-center">
            <div className="col-md-4">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <div className="text-primary mb-3">
                    <i className="fas fa-shield-alt fa-2x"></i>
                  </div>
                  <h5 className="card-title">안전한 분석</h5>
                  <p className="card-text text-muted">
                    격리된 환경에서 안전하게 APK 파일을 분석합니다.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="col-md-4">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <div className="text-primary mb-3">
                    <i className="fas fa-clock fa-2x"></i>
                  </div>
                  <h5 className="card-title">빠른 결과</h5>
                  <p className="card-text text-muted">
                    몇 분 내에 상세한 분석 결과를 제공합니다.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="col-md-4">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <div className="text-primary mb-3">
                    <i className="fas fa-chart-line fa-2x"></i>
                  </div>
                  <h5 className="card-title">상세 리포트</h5>
                  <p className="card-text text-muted">
                    포괄적인 보안 분석 리포트를 제공합니다.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MainPage;

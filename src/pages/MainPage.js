// src/pages/MainPage.js
import React, { useState, useRef, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useNavigate } from 'react-router-dom';
import { FaPaperPlane, FaPaperclip } from 'react-icons/fa';
import Header from '../components/Main/Header';
import ChatList from '../components/Main/ChatList';
import ProfilePanel from '../components/Main/ProfilePanel';
import FileUpload from '../components/FileHandler/FileUpload';
import { uploadAndAnalyzeFile } from '../services/ApiService';

function MainPage() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [scanId, setScanId] = useState(null);
  const [showChatList, setShowChatList] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  // 채팅 세션 저장 함수
  const saveChatSession = (sessionData) => {
    try {
      const existingSessions = JSON.parse(localStorage.getItem('chatSessions') || '[]');
      const sessionIndex = existingSessions.findIndex(session => session.id === sessionData.id);
      
      if (sessionIndex >= 0) {
        // 기존 세션 업데이트
        existingSessions[sessionIndex] = { ...existingSessions[sessionIndex], ...sessionData };
      } else {
        // 새 세션 추가
        existingSessions.unshift(sessionData);
      }
      
      // 최대 50개 세션만 유지
      if (existingSessions.length > 50) {
        existingSessions.splice(50);
      }
      
      localStorage.setItem('chatSessions', JSON.stringify(existingSessions));
      console.log('채팅 세션 저장됨:', sessionData.id);
    } catch (error) {
      console.error('채팅 세션 저장 실패:', error);
    }
  };

  // 파일 업로드 완료 시 호출될 함수
  const handleUploadComplete = async (result, file) => {
    console.log('handleUploadComplete 호출됨:', { result, file });
    
    if (!result) {
      console.error('업로드 결과가 없습니다.');
      alert('파일 업로드에 실패했습니다.');
      return;
    }

    try {
      // response에서 _id 추출 - reportfromVT._id를 우선 사용
      const responseId = result?.reportfromVT?._id || result?._id || Date.now().toString();
      console.log('추출된 _id:', responseId);
      
      setScanId(responseId);

      // 채팅 세션 데이터 생성 - 제목 형식 수정
      const chatSession = {
        id: responseId,
        chatId: responseId,
        title: `${file.name} 파일의 악성 코드 분석`, // 제목 형식 수정
        fileName: file.name,
        fileSize: file.size,
        analysisResult: result,
        messages: [
          {
            text: text.trim() ? `${file.name}\n${text.trim()}` : file.name,
            isUser: true,
            file: file.name,
            timestamp: new Date().toISOString()
          }
        ],
        messageCount: 1,
        lastUpdated: new Date().toISOString(),
        createdAt: new Date().toISOString()
      };

      // 로컬 저장소에 채팅 세션 저장
      saveChatSession(chatSession);

      const navigationState = {
        file: file,
        message: text.trim(),
        result: result,
        skipAnalysis: true,
        chatSession: chatSession
      };

      console.log('ChatPage로 이동 중...', navigationState);
      // chatId를 response의 _id로 설정
      navigate(`/chat/${responseId}`, { state: navigationState });
      
    } catch (error) {
      console.error('파일 업로드 실패:', error);
      alert('파일 업로드 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 파일 업로드 시작 시 호출될 함수
    const handleUploadStart = (file) => {
        console.log('파일 업로드 시작:', file.name); // 디버깅용
        setLoading(true);
    };

  // 파일 선택 버튼 클릭 핸들러
  const handleFileButtonClick = () => {
    fileInputRef.current.click();
  };

  // 파일 선택 핸들러
  const handleFileSelect = async (file) => {
    console.log('파일 선택됨:', file.name);
    
    try {
      setLoading(true);
      
      // 파일 크기 체크 (예: 100MB 제한)
      const maxSize = 500 * 1024 * 1024; // 500MB
      if (file.size > maxSize) {
        throw new Error('파일 크기가 너무 큽니다. 500MB 이하의 파일만 업로드 가능합니다.');
      }
      
      //// 파일 형식 체크
      //if (!file.name.toLowerCase().endsWith('.apk')) {
      //  throw new Error('APK 파일만 업로드 가능합니다.');
      //}
      
      const result = await uploadAndAnalyzeFile(file);
      console.log('업로드 결과:', result);
      
      // 업로드 완료 후 ChatPage로 이동
      handleUploadComplete(result, file);
    } catch (error) {
      console.error('파일 업로드 실패:', error);
      
      // 사용자에게 구체적인 에러 메시지 표시
      let userMessage = '파일 업로드 중 오류가 발생했습니다.';
      
      if (error.message.includes('서버에 연결할 수 없습니다')) {
        userMessage = '서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.';
      } else if (error.message.includes('파일 크기')) {
        userMessage = error.message;
      } else if (error.message.includes('APK 파일만')) {
        userMessage = error.message;
      } else if (error.message.includes('서버 오류')) {
        userMessage = '서버에서 파일 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
      }
      
      alert(userMessage);
    } finally {
      setLoading(false);
    }
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
      state: { 
        message: text.trim() // 텍스트만 있을 때도 확실히 전달
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

  // 로고 클릭 - 미사용
  const handleLogoClick = () => {
    window.location.href = 'http://localhost:3000/';
  };

  // 메뉴 버튼 클릭 핸들러
  const handleMenuClick = () => {
    setShowChatList(true);
    setShowProfile(false);
  };

  // 프로필 버튼 클릭 핸들러
  const handleProfileClick = () => {
    setShowProfile(true);
    setShowChatList(false);
  };

  // 채팅 리스트 닫기 핸들러
  const handleCloseChatList = () => {
    setShowChatList(false);
  };

  // 프로필 패널 닫기 핸들러
  const handleCloseProfile = () => {
    setShowProfile(false);
  };

  // 난수 chatID 생성 함수
  const generateRandomChatId = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 12; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  // 새 채팅 시작 핸들러 추가
  const handleStartNewChat = () => {
    const newChatId = generateRandomChatId();
    console.log('새 채팅 시작:', newChatId);
    navigate(`/chat/${newChatId}`);
  };

  // 채팅 선택 핸들러
  const handleSelectChat = (chatId, sessionData) => {
    console.log('선택된 채팅 ID:', chatId, sessionData);
    navigate(`/chat/${chatId}`, { 
      state: { 
        chatSession: sessionData,
        loadFromStorage: true 
      } 
    });
    setShowChatList(false);
  };

  // 외부 클릭 시 패널 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showChatList || showProfile) {
        const chatListElement = document.querySelector('.chat-list-panel');
        const profileElement = document.querySelector('.profile-panel');
        const headerElement = document.querySelector('.header');
        
        if (chatListElement && !chatListElement.contains(event.target) && 
            !headerElement?.contains(event.target)) {
          setShowChatList(false);
        }
        
        if (profileElement && !profileElement.contains(event.target) && 
            !headerElement?.contains(event.target)) {
          setShowProfile(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showChatList, showProfile]);

  return (
    <div className="container-fluid vh-100 d-flex flex-column position-relative">
      {/* Header */}
      <Header 
        onMenuClick={handleMenuClick}
        onProfileClick={handleProfileClick}
        onLogoClick={handleLogoClick}
        title={null} // MainPage에서는 title을 null로 설정
      />
      
      {/* 채팅 리스트 사이드 패널 */}
      {showChatList && (
        <div className="position-fixed top-0 start-0 h-100 bg-white shadow-lg chat-list-panel" 
          style={{ 
            width: '350px', 
            zIndex: 1050,
            transform: showChatList ? 'translateX(0)' : 'translateX(-100%)',
            transition: 'transform 0.3s ease-in-out'
        }}>
          <ChatList 
            onSelectChat={handleSelectChat}
            onClose={handleCloseChatList}
            onNewChat={handleStartNewChat} // 이 줄 추가
          />
        </div>
      )}

      {/* 프로필 패널 사이드 패널 */}
      {showProfile && (
        <div className="position-fixed top-0 end-0 h-100 bg-white shadow-lg profile-panel" 
             style={{ 
               width: '350px', 
               zIndex: 1050,
               transform: showProfile ? 'translateX(0)' : 'translateX(100%)',
               transition: 'transform 0.3s ease-in-out'
             }}>
          <ProfilePanel onClose={handleCloseProfile} />
        </div>
      )}

      {/* 오버레이 */}
      {(showChatList || showProfile) && (
        <div 
          className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50"
          style={{ zIndex: 1040 }}
          onClick={() => {
            setShowChatList(false);
            setShowProfile(false);
          }}
        />
      )}
      
      {/* 메인 콘텐츠 영역 */}
      <div className="flex-grow-1 d-flex flex-column justify-content-center align-items-center px-3">
        
        {/* 환영 메시지 컨테이너 */}
        <div className="text-center mb-5">
          <div className="mb-4">
            <h2 className="display-6 fw-bold text-primary mb-3">
              파일을 업로드하여 악성 코드를 분석해보세요.
            </h2>
          </div>
        </div>

        {/* 새로운 아이콘 버튼 형태의 입력 영역 */}
        <div className="w-100" style={{ maxWidth: '800px' }}>
          <div className="d-flex align-items-center bg-white rounded-pill shadow-sm p-2 mb-3" style={{border: '1px solid #dee2e6'}}>
            {/* 파일 선택 버튼 */}
            <button
              type="button"
              className="btn btn-outline-secondary rounded-circle me-2 d-flex align-items-center justify-content-center"
              onClick={handleFileButtonClick}
              disabled={loading}
              style={{
                width: '40px',
                height: '40px',
                border: 'none',
                backgroundColor: 'transparent'
              }}
              title="파일 선택"
            >
              <FaPaperclip size={16} />
            </button>

            {/* 텍스트 입력창 */}
            <textarea
              className="form-control border-0 flex-grow-1"
              placeholder="좌측 버튼을 눌러 APK 파일을 첨부하세요."
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyPress={handleKeyPress}
              rows="1"
              maxLength={3000}
              readOnly // 텍스트 입력 비활성화
              style={{ 
                resize: 'none',
                outline: 'none',
                boxShadow: 'none',
                minHeight: '38px',
                maxHeight: '120px',
                overflow: 'auto'
              }}
            />


            {/* 전송 버튼 */}
            <button
              type="button"
              className="btn btn-primary rounded-circle ms-2 d-flex align-items-center justify-content-center"
              onClick={handleSendClick}
              disabled={loading || text.trim().length === 0}
              style={{
                width: '40px',
                height: '40px'
              }}
              title="전송"
            >
              {loading ? (
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
              ) : (
                <FaPaperPlane size={14} />
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

        {/* 숨겨진 파일 입력 */}
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          accept=".apk"
          onChange={(e) => {
            const file = e.target.files[0];
            if (file) {
              handleFileSelect(file);
            }
          }}
        />

        {/* 기존 FileUpload 컴포넌트 - 숨김 처리하되 기능 연동 */}
        <div style={{ display: 'none' }} className="file-upload-component">
          <FileUpload
            onUploadComplete={handleUploadComplete}
            onUploadStart={handleUploadStart}
          />
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
                    격리된 환경에서 안전하게 파일을 분석합니다.
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
                  <h5 className="card-title">APK 특화 상세 분석</h5>
                  <p className="card-text text-muted">
                    APK 파일의 경우 상세 분석 결과를 제공합니다.
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

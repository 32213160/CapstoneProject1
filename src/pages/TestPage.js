// src/pages/TestPage.js
import React, { useState, useRef, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { FaFile, FaPaperPlane, FaPaperclip } from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';
import Header from '../components/layout/Header';
import ChatList from '../components/chat/ChatList';
import ProfilePanel from '../components/layout/ProfilePanel';

function TestPage() {
  const { chatId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  // 로컬 저장소에서 세션 복원
  const loadFromStorage = location.state?.loadFromStorage || false;
  const existingChatSession = location.state?.chatSession || null;

  const [messages, setMessages] = useState([]); // 빈 배열로 시작
  const [text, setText] = useState('');
  const [showChatList, setShowChatList] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  // 헤더 타이틀
  const headerTitle = `테스트 채팅방 ${chatId}`;

  // 메뉴 및 프로필 핸들러들
  const handleMenuClick = () => setShowChatList(true);
  const handleProfileClick = () => setShowProfile(true);
  const handleCloseChatList = () => setShowChatList(false);
  const handleCloseProfile = () => setShowProfile(false);

  // 난수 chatID 생성 함수
  const generateRandomChatId = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 12; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  // 새 채팅 시작 핸들러
  const handleStartNewChat = () => {
    const newChatId = generateRandomChatId();
    console.log('새 채팅 시작:', newChatId);
    navigate(`/test/${newChatId}`);
  };

  // 로컬 저장소에서 특정 chatId의 세션 불러오기
  const loadChatSessionFromStorage = (targetChatId) => {
    try {
      const sessions = JSON.parse(localStorage.getItem('chatSessions') || '[]');
      const session = sessions.find(s => s.chatId === targetChatId);
      return session;
    } catch (error) {
      console.error('채팅 세션 로드 실패:', error);
      return null;
    }
  };

  // 세션 복원 함수
  const restoreChatSession = (sessionData) => {
    if (!sessionData) return;
    
    console.log('테스트 채팅 세션 복원 중:', sessionData);
    
    // 메시지 복원
    if (sessionData.messages && sessionData.messages.length > 0) {
      setMessages(sessionData.messages);
    } else {
      // 세션은 있지만 메시지가 없는 경우 초기 메시지 설정
      const welcomeMessage = {
        text: "테스트 채팅방에 오신 것을 환영합니다! 메시지를 입력해보세요.",
        isUser: false,
        timestamp: new Date().toISOString()
      };
      setMessages([welcomeMessage]);
    }
    
    setLoading(false);
  };

  // 초기 메시지 설정 함수
  const setInitialMessages = () => {
    const welcomeMessage = {
      text: "테스트 채팅방에 오신 것을 환영합니다! 메시지를 입력해보세요.",
      isUser: false,
      timestamp: new Date().toISOString()
    };
    setMessages([welcomeMessage]);
  };

  // chatId 변경 시 메시지 초기화 및 세션 복원
  useEffect(() => {
    console.log('chatId 변경됨:', chatId, 'loadFromStorage:', loadFromStorage);
    
    // 로딩 상태 초기화
    setLoading(false);
    setText('');
    
    if (loadFromStorage && existingChatSession && existingChatSession.chatId === chatId) {
      // URL에서 전달받은 세션 데이터로 복원
      restoreChatSession(existingChatSession);
    } else {
      // 로컬 저장소에서 해당 chatId의 세션 찾기
      const storedSession = loadChatSessionFromStorage(chatId);
      
      if (storedSession) {
        // 저장된 세션이 있으면 복원
        restoreChatSession(storedSession);
      } else {
        // 새로운 채팅인 경우 초기 메시지 설정
        setInitialMessages();
      }
    }
    
    // location.state 초기화 (한 번만 사용)
    if (loadFromStorage && location.state) {
      window.history.replaceState({}, document.title);
    }
    
  }, [chatId]); // chatId만 의존성으로 설정

  // 자동 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 채팅 세션 업데이트 함수
  const updateChatSession = (newMessage) => {
    try {
      const sessions = JSON.parse(localStorage.getItem('chatSessions') || '[]');
      const sessionIndex = sessions.findIndex(session => session.chatId === chatId);
      
      if (sessionIndex >= 0) {
        sessions[sessionIndex].messages.push(newMessage);
        sessions[sessionIndex].messageCount = sessions[sessionIndex].messages.length;
        sessions[sessionIndex].lastUpdated = new Date().toISOString();
        
        localStorage.setItem('chatSessions', JSON.stringify(sessions));
        console.log('테스트 채팅 세션 업데이트됨:', chatId);
      } else {
        // 새 세션 생성
        const newSession = {
          id: chatId,
          chatId: chatId,
          fileName: null,
          fileSize: 0,
          analysisResult: null,
          messages: [newMessage],
          messageCount: 1,
          lastUpdated: new Date().toISOString(),
          createdAt: new Date().toISOString()
        };
        
        sessions.unshift(newSession);
        localStorage.setItem('chatSessions', JSON.stringify(sessions));
        console.log('새 테스트 채팅 세션 생성됨:', chatId);
      }
    } catch (error) {
      console.error('채팅 세션 업데이트 실패:', error);
    }
  };

  // 난수 기반 AI 응답 생성
  const generateRandomResponse = (userMessage) => {
    const responses = [
      "흥미로운 질문이네요! 🤔",
      "그에 대해 더 자세히 설명해주실 수 있나요?",
      "좋은 생각입니다! 👍",
      "음, 그것은 복잡한 문제군요.",
      "제가 도움을 드릴 수 있는 다른 방법이 있을까요?",
      "정말 재미있는 관점이네요!",
      "더 많은 정보가 필요할 것 같습니다.",
      "그것에 대해 생각해볼게요... 🤖",
      "훌륭한 아이디어입니다!",
      "조금 더 구체적으로 말씀해주시겠어요?"
    ];
    
    // 사용자 메시지에 따른 특별 응답
    if (userMessage.includes('안녕') || userMessage.includes('hello')) {
      return "안녕하세요! 반갑습니다! 😊";
    }
    if (userMessage.includes('테스트')) {
      return "네, 이것은 테스트 환경입니다. 모든 기능이 정상 작동하고 있어요!";
    }
    if (userMessage.includes('파일')) {
      return "파일 업로드는 테스트 환경에서 지원하지 않지만, 채팅 기능은 완벽하게 작동합니다!";
    }
    if (userMessage.includes('새 채팅') || userMessage.includes('새로운')) {
      return "새 채팅을 시작하려면 왼쪽 메뉴의 '새 채팅' 버튼을 클릭하세요! ✨";
    }
    
    // 랜덤 응답 선택
    const randomIndex = Math.floor(Math.random() * responses.length);
    return responses[randomIndex];
  };

  // 파일 선택 핸들러
  const handleFileSelect = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      
      // 파일 선택 메시지 추가
      const fileMessage = {
        text: `파일이 선택되었습니다: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`,
        isUser: true,
        file: file.name,
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, fileMessage]);
      updateChatSession(fileMessage);
      
      // AI 응답
      setTimeout(() => {
        const aiResponse = {
          text: "테스트 환경에서는 파일 분석을 수행하지 않지만, 파일이 성공적으로 선택되었습니다! 📁",
          isUser: false,
          timestamp: new Date().toISOString()
        };
        
        setMessages(prev => [...prev, aiResponse]);
        updateChatSession(aiResponse);
      }, 1000);
      
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // 메시지 전송
  const handleSendClick = async () => {
    if (text.trim().length === 0 || loading) return;
    if (text.length > 3000) {
      alert('글자수는 최대 3000자까지 입력 가능합니다.');
      return;
    }

    const currentText = text.trim();
    
    // 사용자 메시지 추가
    const userMessage = {
      text: currentText,
      isUser: true,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    updateChatSession(userMessage);
    setText('');
    setLoading(true);

    // 로딩 메시지 추가
    const loadingMessage = {
      text: "생각 중입니다...",
      isUser: false,
      isLoading: true,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, loadingMessage]);

    // 1-3초 후 랜덤 응답
    const responseDelay = Math.random() * 2000 + 1000; // 1-3초
    
    setTimeout(() => {
      const responseText = generateRandomResponse(currentText);
      
      const aiMessage = {
        text: responseText,
        isUser: false,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => {
        const filteredMessages = prev.filter(msg => !msg.isLoading);
        return [...filteredMessages, aiMessage];
      });

      updateChatSession(aiMessage);
      setLoading(false);
    }, responseDelay);
  };

  // 엔터키 전송
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendClick();
    }
  };

  // 채팅 선택 핸들러
  const handleSelectChat = (selectedChatId, sessionData) => {
    console.log('선택된 테스트 채팅 ID:', selectedChatId, sessionData);
    navigate(`/test/${selectedChatId}`, { 
      state: { 
        chatSession: sessionData,
        loadFromStorage: true 
      } 
    });
    setShowChatList(false);
  };

  // 메시지 렌더링
  const renderMessageContent = (message) => {
    if (message.isLoading) {
      return (
        <div className="d-flex align-items-center">
          <div className="spinner-border spinner-border-sm me-2" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          {message.text}
        </div>
      );
    }

    return (
      <div>
        {message.file && (
          <div className="d-flex align-items-center mb-2 text-muted">
            <FaFile className="me-2" />
            <small>{message.file}</small>
          </div>
        )}
        <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
          {message.text}
        </div>
      </div>
    );
  };

  return (
    <div className="d-flex flex-column vh-100">
      {/* 헤더 */}
      <Header 
        onMenuClick={handleMenuClick}
        onProfileClick={handleProfileClick}
        title={headerTitle}
      />

      {/* 메인 컨텐츠 */}
      <div className="flex-grow-1 d-flex flex-column position-relative">
        {/* 채팅 메시지 영역 */}
        <div className="flex-grow-1 overflow-auto p-3" style={{ paddingBottom: '100px' }}>
          {messages.map((message, index) => (
            <div key={index} className={`mb-3 d-flex ${message.isUser ? 'justify-content-end' : 'justify-content-start'}`}>
              <div 
                className={`p-3 rounded-3 ${
                  message.isUser 
                    ? 'bg-primary text-white' 
                    : message.isLoading 
                      ? 'bg-light border' 
                      : 'bg-light'
                }`}
                style={{ maxWidth: '70%' }}
              >
                {renderMessageContent(message)}
                <div className="mt-1">
                  <small className={`${message.isUser ? 'text-white-50' : 'text-muted'}`}>
                    {new Date(message.timestamp).toLocaleTimeString('ko-KR', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </small>
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* 입력 영역 */}
        <div className="position-fixed bottom-0 start-0 end-0 bg-white border-top p-3">
          <div className="container-fluid">
            <div className="row align-items-center">
              <div className="col">
                <div className="input-group">
                  <button 
                    className="btn btn-outline-secondary" 
                    type="button"
                    onClick={handleFileSelect}
                    disabled={loading}
                  >
                    <FaPaperclip />
                  </button>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="메시지를 입력하세요..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={loading}
                  />
                  <button 
                    className="btn btn-primary" 
                    type="button"
                    onClick={handleSendClick}
                    disabled={loading || text.trim().length === 0}
                  >
                    <FaPaperPlane />
                  </button>
                </div>
                <div className="mt-2 d-flex justify-content-between align-items-center">
                  <small className="text-muted">
                    테스트 모드 - 서버 업로드 없이 로컬 저장소만 사용
                  </small>
                  <small className="text-muted">
                    채팅 ID: {chatId}
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 숨겨진 파일 입력 */}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileChange}
        accept=".apk,.txt,.pdf,*"
      />

      {/* 채팅 리스트 */}
      {showChatList && (
        <ChatList 
          onSelectChat={handleSelectChat}
          onClose={handleCloseChatList}
          onNewChat={handleStartNewChat}
        />
      )}

      {/* 프로필 패널 */}
      {showProfile && (
        <ProfilePanel onClose={handleCloseProfile} />
      )}
    </div>
  );
}

export default TestPage;

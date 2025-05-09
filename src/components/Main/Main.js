// Main.js
import React, { useState, useRef, useEffect } from 'react';
import SlidingPanel from 'react-sliding-side-panel';
import 'react-sliding-side-panel/lib/index.css';
import './components/Main/Main.css';
import Header from './components/Main/Header';
import ChatList from './components/Main/ChatList';
import ProfilePanel from './components/Main/ProfilePanel';

function Main() {
  // 상태 관리
  const [text, setText] = useState('');
  const [messages, setMessages] = useState([]);
  const [showChatList, setShowChatList] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  // 메시지 변경 시 자동 스크롤
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 최신 메시지로 스크롤하는 함수
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // 로고 클릭 시 example.com으로 이동
  const handleLogoClick = () => {
    window.location.href = 'http://example.com';
  };

  // 파일 첨부 버튼 클릭 시 숨겨진 파일 input 클릭
  const handleFileButtonClick = () => {
    fileInputRef.current.click();
  };

  // 파일 선택 후 서버 업로드 예시 (API 엔드포인트는 실제 사용에 맞게 수정)
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('file', file);
      try {
        const response = await fetch('YOUR_UPLOAD_API_ENDPOINT', {
          method: 'POST',
          body: formData,
        });
        const result = await response.json();
        console.log('파일 업로드 성공:', result);
      } catch (error) {
        console.error('파일 업로드 에러:', error);
      }
    }
  };

  // 전송 버튼 클릭 시 텍스트 필드의 내용 서버 전송 예시
  const handleSendClick = async () => {
    if (text.trim().length === 0) return;
    
    if (text.length > 3000) {
      alert('글자수는 최대 3000자까지 입력 가능합니다.');
      return;
    }

    // 사용자 메시지 추가
    const newUserMessage = {
      text: text,
      isUser: true,
      timestamp: new Date().toISOString()
    };
    
    setMessages([...messages, newUserMessage]);
    setText(''); // 입력 지우기
    
    // 채팅 인터페이스로 전환
    if (!showChatInterface) {
      setShowChatInterface(true);
    }
    
    // 샘플 응답 생성 (실제로는 서버나 LLM API 호출)
    setTimeout(() => {
      const newResponse = {
        text: "이 APK 파일에서 악성 코드가 발견되었습니다. 'nc -lvp 4444 -e /bin/bash' 명령은 해커가 원격으로 시스템에 접근할 수 있는 백도어를 생성합니다. 이 코드는 공격자가 시스템에 원격으로 접근할 수 있도록 숨겨진 통로를 만듭니다.",
        isUser: false,
        timestamp: new Date().toISOString()
      };
      
      setMessages(prevMessages => [...prevMessages, newResponse]);
    }, 1000);
    
    try {
      const response = await fetch('YOUR_TEXT_SEND_API_ENDPOINT', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });
      const result = await response.json();
      console.log('메시지 전송 성공:', result);
    } catch (error) {
      console.error('메시지 전송 에러:', error);
    }
  };

  // 메뉴 버튼 클릭 처리
  const handleMenuClick = () => {
    alert("메뉴 기능이 여기에 구현됩니다.");
  };

  // 엔터 키로 메시지 전송
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendClick();
    }
  };

  return (
    <>
      <div className="headerContainer">
        <Header />
        {/* 헤더 컴포넌트 추가 */}
      </div>

      {/* 메인 컨테이너 */}
      <div className={!showChatInterface ? "container" : "chatContainer"}>
        {!showChatInterface ? (
          // 초기 화면 (Main)
          <>
            {/* 1열: 로고 */}
            <div className="column">
              <img
                src="logo512.png"
                alt="Logo"
                className="logo"
                onClick={handleLogoClick}
              />
            </div>
            {/* 2열: 파일첨부, 텍스트필드, 전송버튼 (가로 배치) */}
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
          </>
        ) : (
          // 채팅 인터페이스 화면
          <>
            {/* 헤더 섹션 */}

            {/* 채팅 헤더 */}
            <div className="chatHeader">
              <div className="leftSection">
                <button className="menuButton" onClick={handleMenuClick}>
                  <i>≡</i>
                </button>
                <h1 className="title">'sample.apk' 파일의 악성 코드 분석</h1>
              </div>
              <div className="rightSection">
                <div className="userProfilePicture"></div>
              </div>
            </div>

            {/* 메시지 컨테이너 */}
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
            
            {/* 하단 입력 영역 */}
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
          </>
        )}
      </div>
    </>
  );
}

export default Main;

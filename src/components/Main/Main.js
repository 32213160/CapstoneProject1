import React, { useState, useRef, useEffect } from 'react';

function Main() {
  // 상태 관리
  const [text, setText] = useState('');
  const fileInputRef = useRef(null);
  const [showChatInterface, setShowChatInterface] = useState(false);
  const [messages, setMessages] = useState([]);
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
    <div style={!showChatInterface ? styles.container : styles.chatContainer}>
      {!showChatInterface ? (
        // 초기 화면 (Main)
        <>
          {/* 1열: 로고 */}
          <div style={styles.column}>
            <img
              src="logo512.png"
              alt="Logo"
              style={styles.logo}
              onClick={handleLogoClick}
            />
          </div>
          {/* 2열: 파일첨부, 텍스트필드, 전송버튼 (가로 배치) */}
          <div style={styles.column}>
            <div style={styles.inputRow}>
              <button style={styles.fileButton} onClick={handleFileButtonClick}>
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
                style={styles.textField}
              />
              <button 
                style={styles.sendButton} 
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
          <div style={styles.chatHeader}>
            <div style={styles.leftSection}>
              <button style={styles.menuButton} onClick={handleMenuClick}>
                <i>≡</i>
              </button>
              <h1 style={styles.title}>'sample.apk' 파일의 악성 코드 분석</h1>
            </div>
            <div style={styles.rightSection}>
              <div style={styles.userProfilePicture}></div>
            </div>
          </div>

          {/* 메시지 컨테이너 */}
          <div style={styles.messagesContainer}>
            <div style={styles.messagesOverflow}>
              <div style={styles.fadeGradient}></div>
              {messages.map((message, index) => (
                <div 
                  key={index} 
                  style={message.isUser ? styles.userMessageWrapper : styles.responseMessageWrapper}
                >
                  <div style={message.isUser ? styles.userMessageBubble : styles.responseMessageBubble}>
                    {message.text}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>
          
          {/* 하단 입력 영역 */}
          <div style={styles.chatInputContainer}>
            <button style={styles.fileButton} onClick={handleFileButtonClick}>
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
              style={styles.chatTextField}
            />
            <button 
              style={styles.sendButton} 
              onClick={handleSendClick}
              disabled={text.trim().length === 0}
            >
              <i>➤</i>
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// 통합된 스타일
const styles = {
  // 초기 Main 화면 스타일
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
  },
  column: {
    marginBottom: '20px',
    display: 'flex',
    justifyContent: 'center',
    width: '100%',
  },
  logo: {
    width: '150px',
    cursor: 'pointer',
  },
  inputRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: '10px',
  },
  textField: {
    padding: '8px',
    width: '300px',
    borderRadius: '4px',
    border: '1px solid #ccc',
  },
  
  // 채팅 인터페이스 스타일
  chatContainer: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    width: '100%',
    backgroundColor: '#f0f4f8',
    fontFamily: 'Arial, sans-serif',
  },
  chatHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px',
    backgroundColor: '#ffffff',
    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
    zIndex: 10,
  },
  leftSection: {
    display: 'flex',
    alignItems: 'center',
  },
  menuButton: {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    marginRight: '15px',
  },
  title: {
    fontSize: '18px',
    margin: 0,
    fontWeight: 600,
  },
  rightSection: {
    display: 'flex',
    alignItems: 'center',
  },
  userProfilePicture: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: '#e0e0e0',
    backgroundSize: 'cover',
  },
  messagesContainer: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  messagesOverflow: {
    height: '100%',
    overflowY: 'auto',
    padding: '20px',
    paddingTop: '60px',
  },
  fadeGradient: {
    position: 'absolute',
    top: 0,
    width: '100%',
    height: '60px',
    background: 'linear-gradient(rgba(240, 244, 248, 1), rgba(240, 244, 248, 0))',
    pointerEvents: 'none',
    zIndex: 2,
  },
  userMessageWrapper: {
    display: 'flex',
    marginBottom: '15px',
    maxWidth: '70%',
    justifyContent: 'flex-end',
    marginLeft: 'auto',
  },
  responseMessageWrapper: {
    display: 'flex',
    marginBottom: '15px',
    maxWidth: '70%',
    justifyContent: 'flex-start',
    marginRight: 'auto',
  },
  userMessageBubble: {
    padding: '12px 18px',
    borderRadius: '18px',
    borderBottomRightRadius: '4px',
    fontSize: '16px',
    lineHeight: 1.4,
    wordWrap: 'break-word',
    backgroundColor: '#2b68e9',
    color: 'white',
  },
  responseMessageBubble: {
    padding: '12px 18px',
    borderRadius: '18px',
    borderBottomLeftRadius: '4px',
    fontSize: '16px',
    lineHeight: 1.4,
    wordWrap: 'break-word',
    backgroundColor: '#e0e0e0',
    color: 'black',
  },
  chatInputContainer: {
    display: 'flex',
    alignItems: 'center',
    padding: '15px',
    backgroundColor: '#ffffff',
    boxShadow: '0 -2px 5px rgba(0, 0, 0, 0.1)',
  },
  fileButton: {
    background: 'none',
    border: 'none',
    fontSize: '20px',
    cursor: 'pointer',
    marginRight: '10px',
  },
  chatTextField: {
    flex: 1,
    height: '40px',
    minHeight: '40px',
    maxHeight: '120px',
    border: '1px solid #e0e0e0',
    borderRadius: '20px',
    padding: '10px 15px',
    fontSize: '16px',
    resize: 'none',
    outline: 'none',
  },
  sendButton: {
    background: 'none',
    border: 'none',
    fontSize: '20px',
    cursor: 'pointer',
    marginLeft: '10px',
    color: '#2b68e9',
  },
};

export default Main;

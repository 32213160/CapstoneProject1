// src/components/Main/Footer.js
//import React, { useRef } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaPaperPlane } from 'react-icons/fa';
//import { FaPaperPlane, FaPaperclip } from 'react-icons/fa';

function Footer({ 
  text, 
  setText, 
  handleSendClick, 
  handleKeyPress, 
  //handleFileSelect, 
  loading,
  onSendMessage,
  sessionId
}) {
  //const fileInputRef = useRef(null);

  // 파일 선택 핸들러
  /*const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };*/

  const handleFooterSend = async (e) => {
    if (e) e.preventDefault();
    if (!text.trim() || loading) return;
    
    try {
      console.log('📤 Footer에서 메시지 전송:', { sessionId, text });
      
      // ✅ handleSendMessage 호출
      await onSendMessage(sessionId, text);
      
      setText('');  // 입력창 비우기
    } catch (error) {
      console.error('❌ 메시지 전송 실패:', error);
    }
  };

  const handleFooterKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleFooterSend();
    }
  };
  return (
    <div className="footer-container fixed-bottom px-2 px-lg-3">
      <div className="container-fluid px-3 py-4 px-md-3 px-lg-4 px-xl-5">
        <div className="d-flex align-items-center">
          {/* 왼쪽: 파일 첨부 버튼 - 불필요한 여백 제거 */}
          {/*
          // 파일 첨부 버튼 비활성화
          //  추후 ChatPage 양식에서 빈 화면을 만들어 바로 파일 전송 및
          //  response를 이용해 URL이 실시간으로 변경되도록 바꾸기
          //  이때 footer의 file icon 활성화, 채팅 시에는 비활성화
          <button 
            className="btn btn-link text-dark border-0 p-2 me-2" 
              onClick={handleFileButtonClick}
              disabled={loading}
          >
            <FaPaperclip size={20} />
          </button>
          
          <input 
            type="file" 
            ref={fileInputRef} 
            className="d-none" 
            onChange={handleFileChange} 
            accept=".apk,.jar,.zip,.exe,.dll,.pdf"
          />
          */}
          
          {/* 중앙: 텍스트 입력 영역 - 양쪽 마진 제거 */}
          <div className="flex-grow-1 px-3">
            <textarea
              className="form-control border-0 shadow px-4"
              placeholder="질문을 입력하세요."
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyPress={handleFooterKeyPress}
              disabled={loading}
              rows="1"
              style={{
                resize: 'none',
                borderRadius: '20px',
                padding: '10px 15px'
              }}
            />
          </div>
          
          {/* 오른쪽: 전송 버튼 - 배경 없는 파란색 아이콘 */}
          <button 
            className="btn btn-link text-primary border-0 p-2 ms-2"
            onClick={handleFooterKeyPress}
            disabled={loading || !text.trim()}
          >
            {loading ? (
              <div 
                className="spinner-border spinner-border-sm text-light" 
                role="status"
              >
                <span className="visually-hidden">Loading...</span>
              </div>
            ) : (
              <FaPaperPlane size={20} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Footer;

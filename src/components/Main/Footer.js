// src/components/Main/Footer.js
import React, { useRef } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaPaperPlane, FaPaperclip } from 'react-icons/fa';

function Footer({ 
  text, 
  setText, 
  handleSendClick, 
  handleKeyPress, 
  handleFileSelect, 
  loading 
}) {
  const fileInputRef = useRef(null);

  // 파일 첨부 버튼 클릭 시 숨겨진 파일 input 클릭
  const handleFileButtonClick = () => {
    fileInputRef.current.click();
  };

  // 파일 선택 핸들러
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  return (
    <div className="footer-container fixed-bottom shadow-lg">
      <div className="container-fluid px-3 px-md-3 px-lg-4 px-xl-5 py-3" style={{
        backgroundImage: 'linear-gradient(to top, rgba(255,255,255,1) 90%, rgba(255,255,255,0.9) 100%)',
      }}>
        <div className="d-flex align-items-center">
          {/* 왼쪽: 파일 첨부 버튼 - 불필요한 여백 제거 */}
          <button 
            className="btn btn-link text-dark border-0 p-2 me-2" 
            // 파일 첨부 버튼 비활성화
            /*
            onClick={handleFileButtonClick}
            disabled={loading}
            */
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
          
          {/* 중앙: 텍스트 입력 영역 - 양쪽 마진 제거 */}
          <div className="flex-grow-1">
            <textarea
              className="form-control border-0 shadow-sm"
              placeholder="질문을 입력하세요..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyPress={handleKeyPress}
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
            onClick={handleSendClick}
            disabled={loading}
          >
            <FaPaperPlane size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default Footer;

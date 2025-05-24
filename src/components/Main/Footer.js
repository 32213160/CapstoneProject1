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
      <div className="container-fluid py-3" style={{
        backgroundImage: 'linear-gradient(to top, rgba(255,255,255,1) 90%, rgba(255,255,255,0.9) 100%)',
      }}>
        <div className="d-flex align-items-center">
          <button 
            className="btn btn-link text-dark border-0 p-2" 
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
          
          <div className="flex-grow-1 mx-2">
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
          
          <button 
            className="btn btn-primary rounded-circle p-2 d-flex justify-content-center align-items-center"
            onClick={handleSendClick}
            disabled={loading}
            style={{
              width: '40px',
              height: '40px'
            }}
          >
            <FaPaperPlane size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default Footer;

// src/components/chat/ChatInput.js
import React, { useRef } from 'react';
import FileUploadButton from '../file/FileHandler/FileUploadButton';

function ChatInput({ 
  text, 
  setText, 
  loading, 
  selectedFile, 
  onFileSelect, 
  onSendClick, 
  onKeyPress 
}) {
  const fileInputRef = useRef(null);

  const handleFileChange = (file) => {
    onFileSelect(file);
  };

  const handleSend = () => {
    if ((!selectedFile && text.trim().length === 0) || loading) return;
    
    if (text.length > 3000) {
      alert('글자수는 최대 3000자까지 입력 가능합니다.');
      return;
    }
    
    onSendClick();
  };

  return (
    <div className="chat-input-container" style={{ 
      padding: '20px', 
      borderTop: '1px solid #e0e0e0',
      backgroundColor: '#fafafa' 
    }}>
      {selectedFile && (
        <div style={{ 
          marginBottom: '10px', 
          padding: '10px', 
          backgroundColor: '#e3f2fd', 
          borderRadius: '5px' 
        }}>
          <span>선택된 파일: {selectedFile.name}</span>
          <button 
            onClick={() => onFileSelect(null)}
            style={{ marginLeft: '10px', color: 'red', background: 'none', border: 'none' }}
          >
            ✕
          </button>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <FileUploadButton 
          onFileSelect={handleFileChange}
          disabled={loading}
        />
        
        <textarea
          ref={fileInputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyPress={onKeyPress}
          placeholder={loading ? "처리 중입니다..." : "메시지를 입력하세요..."}
          disabled={loading}
          rows={1}
          style={{
            flex: 1,
            padding: '12px',
            border: '1px solid #ddd',
            borderRadius: '20px',
            fontSize: '14px',
            resize: 'none',
            outline: 'none',
            backgroundColor: loading ? '#f5f5f5' : 'white'
          }}
        />
        
        <button
          onClick={handleSend}
          disabled={(!selectedFile && text.trim().length === 0) || loading}
          style={{
            padding: '12px 20px',
            backgroundColor: loading || (!selectedFile && text.trim().length === 0) 
              ? '#cccccc' 
              : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '20px',
            cursor: loading || (!selectedFile && text.trim().length === 0) 
              ? 'not-allowed' 
              : 'pointer',
            fontSize: '14px',
            fontWeight: 'bold'
          }}
        >
          {loading ? '전송 중...' : '전송'}
        </button>
      </div>
    </div>
  );
}

export default ChatInput;

// src/components/FileHandler/FileUploadButton.js
import React, { useRef, useState } from 'react';

function FileUploadButton({ onFileSelect }) {
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);

  // 파일 첨부 버튼 클릭 시 숨겨진 파일 input 클릭
  const handleFileButtonClick = () => {
    fileInputRef.current.click();
  };

  // 파일 선택 처리
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setSelectedFile(file);
    if (onFileSelect) {
      onFileSelect(file);
    }
  };

  return (
    <div className="file-upload-container">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".apk"
        style={{ display: 'none' }}
      />
      <button 
        className="upload-button" 
        onClick={handleFileButtonClick}
      >
        파일 선택
      </button>
      {selectedFile && (
        <div className="selected-file">
          <span className="file-name">{selectedFile.name}</span>
        </div>
      )}
    </div>
  );
}

export default FileUploadButton;

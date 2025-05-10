// src/components/FileUpload/FileUpload.js
import React, { useState, useRef } from 'react';
import { uploadAndAnalyzeFile as uploadFileForScan } from '../../services/ApiService';

function FileUpload({ onUploadComplete }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('파일을 선택해주세요.');
      return;
    }

    try {
      setUploading(true);
      const result = await uploadFileForScan(file);
      setUploading(false);
      setFile(null);
      // 파일 입력 초기화
      if (fileInputRef.current) fileInputRef.current.value = '';
      
      // 결과를 상위 컴포넌트로 전달
      if (onUploadComplete) onUploadComplete(result);
    } catch (err) {
      setError('파일 업로드 중 오류가 발생했습니다.');
      setUploading(false);
    }
  };

  return (
    <div className="fileUploadContainer">
      <h3>APK 파일 분석</h3>
      <div className="uploadControls">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".apk"
          disabled={uploading}
        />
        <button 
          className="uploadButton" 
          onClick={handleUpload}
          disabled={!file || uploading}
        >
          {uploading ? '분석 중...' : '파일 분석'}
        </button>
      </div>
      {error && <div className="error">{error}</div>}
      {file && <div className="selectedFile">선택된 파일: {file.name}</div>}
    </div>
  );
}

export default FileUpload;

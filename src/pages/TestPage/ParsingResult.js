// src/components/ParsingResult.js
import React, { useState } from 'react';
import FileUpload from '../../components/FileHandler/FileUpload';

function ParsingResult() {
  const [selectedFileName, setSelectedFileName] = useState('');
  const [result, setResult] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  // 파일 업로드 시작 시 호출될 함수
  const handleUploadStart = (file) => {
    setSelectedFileName(file.name);
    setResult(null);
    setError('');
    setUploading(true);
  };

  // 파일 업로드 완료 시 호출될 함수
  const handleUploadComplete = (result, file, error) => {
    setUploading(false);
    
    if (error || !result) {
      setError('파일 업로드 중 오류가 발생했습니다.\n' + (error?.message || ''));
      return;
    }
    
    setResult(result);
  };

  return (
    <div className="parsing-result-container">
      <h2>APK 파일 분석</h2>
      
      <div className="upload-section">
        <FileUpload 
          onUploadStart={handleUploadStart}
          onUploadComplete={handleUploadComplete}
          buttonText="APK 파일 선택"
        />
        
        {selectedFileName && (
          <div className="file-info">
            <p>선택된 파일: {selectedFileName}</p>
          </div>
        )}
        
        {uploading && <p>파일 업로드 및 분석 중...</p>}
        
        {error && (
          <div className="error-message">
            <p>{error}</p>
          </div>
        )}
      </div>
      
      {result && (
        <div className="result-display">
          <h3>분석 결과</h3>
          <pre className="json-result">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

export default ParsingResult;

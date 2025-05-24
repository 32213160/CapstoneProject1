import React, { useState } from 'react';

function TestPage() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);

  // 파일 선택 핸들러
  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    setResponse(null);
    setError(null);
  };

  // 파일 업로드 핸들러
  const handleUpload = () => {
    if (!selectedFile) {
      setError("파일을 선택해주세요.");
      return;
    }
    setIsLoading(true);
    setError(null);
    
    const formdata = new FormData();
    formdata.append("file", selectedFile);
    
    const requestOptions = {
      method: "POST",
      body: formdata,
      redirect: "follow"
    };
    
    // 상대 경로 사용 (프록시 설정 시)
    fetch("/upload", requestOptions)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.text();
      })
      .then((result) => {
        try {
          const jsonResult = JSON.parse(result);
          console.log("파일 ID:", jsonResult._id);
          setResponse(JSON.stringify(jsonResult, null, 2));
        } catch (e) {
          setResponse(result);
        }
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error:", error);
        setError("파일 업로드 중 오류가 발생했습니다.");
        setIsLoading(false);
      });
  };

  return (
    <div className="file-upload-container">
      <h1>파일 업로드</h1>
      
      <div className="upload-section">
        <input 
          type="file" 
          onChange={handleFileChange} 
          className="file-input"
        />
        
        <button 
          onClick={handleUpload} 
          disabled={isLoading} 
          className="upload-button"
        >
          {isLoading ? "업로드 중..." : "업로드"}
        </button>
      </div>
      
      {selectedFile && (
        <div className="file-info">
          <h3>선택된 파일:</h3>
          <p>파일명: {selectedFile.name}</p>
          <p>파일 크기: {(selectedFile.size / 1024).toFixed(2)} KB</p>
          <p>파일 타입: {selectedFile.type || "알 수 없음"}</p>
        </div>
      )}
      
      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}
      
      {response && (
        <div className="response-container">
          <h3>서버 응답:</h3>
          <pre>{response}</pre>
        </div>
      )}
    </div>
  );
}

export default TestPage;

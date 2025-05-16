// src/components/FileHandler/FileUpload.js
import React, { useRef, useState } from 'react';
import { uploadAndAnalyzeFile } from '../../services/ApiService';

function FileUpload({ onUploadComplete, onUploadStart, buttonText }) {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  
  // 파일 첨부 버튼 클릭 시 숨겨진 파일 input 클릭
  const handleFileButtonClick = () => {
    fileInputRef.current.click();
  };

  // 파일 선택 후 업로드 및 분석
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      setError(null);
      setUploading(true);
      
      // 업로드 시작을 알림
      if (onUploadStart) {
        onUploadStart(file);
      }
      
      // 파일 업로드 및 분석
      const result = await uploadAndAnalyzeFile(file);
      
      // 업로드 완료 콜백 실행
      if (onUploadComplete) {
        onUploadComplete(result, file);
      }
      
    } catch (error) {
      console.error('파일 분석 실패:', error);
      setError('파일 업로드 중 오류가 발생했습니다.');
      
      // 에러 발생 시에도 콜백 호출
      if (onUploadComplete) {
        onUploadComplete(null, file, error);
      }
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // TestPage에서 가져온 파일 업로드 함수
  const uploadFile = async (file) => {
    if (!file) {
      return { error: "파일을 선택해주세요." };
    }
    
    try {
      const formdata = new FormData();
      formdata.append("file", file);
      
      const requestOptions = {
        method: "POST",
        body: formdata,
        redirect: "follow"
      };
      
      const response = await fetch("/upload", requestOptions);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const result = await response.text();
      
      try {
        // JSON 형태로 파싱 시도
        const jsonResult = JSON.parse(result);
        console.log("파일 ID:", jsonResult._id);
        return jsonResult;
      } catch (e) {
        // 텍스트 형태로 반환
        return { result };
      }
    } catch (error) {
      console.error("Error:", error);
      return { error: "파일 업로드 중 오류가 발생했습니다." };
    }
  };

  // ChatPage에서 사용할 파일 업로드 함수
  const handleUploadForChat = async (file) => {
    setUploading(true);
    setError(null);
    
    const result = await uploadFile(file);
    
    setUploading(false);
    
    if (result.error) {
      setError(result.error);
      return null;
    }
    
    return result;
  };

  return (
    <div className="file-upload">
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        style={{ display: 'none' }} 
        accept=".apk"
      />
      <button 
        onClick={handleFileButtonClick} 
        disabled={uploading}
        className="upload-button"
      >
        {buttonText || (uploading ? '업로드 중...' : '파일 업로드')}
      </button>
      {error && <div className="error-message">{error}</div>}
    </div>
  );
}

// 외부에서 직접 사용할 수 있도록 파일 업로드 함수 export
export const uploadFileAndGetResponse = async (file) => {
  if (!file) {
    return { error: "파일을 선택해주세요." };
  }
  
  try {
    const formdata = new FormData();
    formdata.append("file", file);
    
    const requestOptions = {
      method: "POST",
      body: formdata,
      redirect: "follow"
    };
    
    const response = await fetch("http://54.180.122.103:8080/upload", requestOptions);
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const result = await response.text();
    
    try {
      // JSON 형태로 파싱 시도
      const jsonResult = JSON.parse(result);
      console.log("파일 ID:", jsonResult._id);
      return jsonResult;
    } catch (e) {
      // 텍스트 형태로 반환
      return { result };
    }
  } catch (error) {
    console.error("Error:", error);
    return { error: "파일 업로드 중 오류가 발생했습니다." };
  }
};

export default FileUpload;

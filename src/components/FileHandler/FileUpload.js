// src/components/FileHandler/FileUpload.js
import React, { useRef, useState } from 'react';
import { uploadAndAnalyzeFile } from '../../services/ApiService';

function FileUpload({ onUploadComplete, onUploadStart, buttonText }) {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [scanId, setScanId] = useState(null); // 스캔 ID를 저장할 상태 변수 추가

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
      setScanId(null); // 새 업로드 시작 시 ID 초기화

      // 업로드 시작을 알림
      if (onUploadStart) {
        onUploadStart(file);
      }

      // 파일 업로드 및 분석
      const result = await uploadAndAnalyzeFile(file);
      
      // 응답에서 scanId 추출
      if (result && result._id) {
        setScanId(result._id);
        console.log("스캔 ID:", result._id);
      }

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

  // 파일 업로드 함수
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
        // JSON 형태로 파싱
        const jsonResponse = JSON.parse(result);
        
        // _id 값 추출 및 저장
        const scanId = jsonResponse._id;
        setScanId(scanId);
        console.log("스캔 ID:", scanId);
        
        // 전체 응답 반환
        return {
          ...jsonResponse,
          scanId: scanId // 명확한 이름으로 추가
        };
      } catch (e) {
        console.error("JSON 파싱 오류:", e);
        // 텍스트 형태로 반환
        return { result, error: "JSON 파싱 오류" };
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
    setScanId(null);
    
    const result = await uploadFile(file);
    
    setUploading(false);
    
    if (result.error) {
      setError(result.error);
      return null;
    }
    
    return result;
  };

  return (
    <div className="fileUploadContainer">
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
        disabled={uploading}
      >
        {uploading ? '업로드 중...' : buttonText || '파일 선택'}
      </button>
      
      {error && <div className="error-message">{error}</div>}
      
      {scanId && (
        <div className="scan-info">
          <span className="scan-id-label">스캔 ID:</span>
          <span className="scan-id-value">{scanId}</span>
        </div>
      )}
    </div>
  );
}

export default FileUpload;

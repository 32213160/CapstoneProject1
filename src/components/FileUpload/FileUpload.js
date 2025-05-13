// FileUpload.js
import React, { useRef, useState } from 'react';

function FileUpload({ onUploadComplete }) {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleUpload = async () => {
    if (!fileInputRef.current || !fileInputRef.current.files[0]) {
      setError('파일을 선택해주세요.');
      return;
    }
    setError(null);
    setUploading(true);

    // Postman 코드 그대로
    const formdata = new FormData();
    formdata.append("file", fileInputRef.current.files[0], fileInputRef.current.files[0].name);

    const requestOptions = {
      method: "POST",
      body: formdata,
      redirect: "follow"
    };

    try {
      const response = await fetch("http://54.180.122.103:8080/upload", requestOptions);
      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`서버 오류 (${response.status}): ${errText}`);
      }
      const result = await response.json();
      setUploading(false);
      if (onUploadComplete) onUploadComplete(result);
      fileInputRef.current.value = '';
    } catch (err) {
      setError('파일 업로드 중 오류가 발생했습니다.');
      setUploading(false);
    }
  };

  return (
    <div>
      <input
        type="file"
        ref={fileInputRef}
        accept=".apk"
      />
      <button onClick={handleUpload} disabled={uploading}>
        {uploading ? '업로드 중...' : '업로드'}
      </button>
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </div>
  );
}

export default FileUpload;

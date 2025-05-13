// src/components/ParsingResult.js
import React, { useRef, useState } from 'react';

function ParsingResult() {
  const fileInputRef = useRef(null);
  const [selectedFileName, setSelectedFileName] = useState('');
  const [result, setResult] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  // 파일 선택 시 파일명 표시
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFileName(e.target.files[0].name);
      setResult(null);
      setError('');
    }
  };

  // 업로드 버튼 클릭 시 Postman 코드 그대로 실행
  const handleUpload = async () => {
    if (!fileInputRef.current || !fileInputRef.current.files[0]) {
      setError('업로드할 파일을 선택하세요.');
      return;
    }
    setUploading(true);
    setError('');
    setResult(null);

    // Postman 코드 그대로
    const formdata = new FormData();
    formdata.append(
      "file",
      fileInputRef.current.files[0],
      fileInputRef.current.files[0].name // 실제 파일명 사용
    );

    const requestOptions = {
      method: "POST",
      body: formdata,
      redirect: "follow"
    };

    try {
      const response = await fetch("http://54.180.122.103:8080/upload", requestOptions);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`서버 오류 (${response.status}): ${errorText}`);
      }
      const json = await response.json();
      setResult(json);
    } catch (err) {
      setError('파일 업로드 중 오류가 발생했습니다.\n' + err.message);
    } finally {
      setUploading(false);
      // 파일 input 초기화
      if (fileInputRef.current) fileInputRef.current.value = '';
      setSelectedFileName('');
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: 30 }}>
      <h2>APK 파일 업로드 및 분석 결과</h2>
      <input
        type="file"
        ref={fileInputRef}
        accept=".apk"
        onChange={handleFileChange}
        style={{ marginBottom: 10 }}
      />
      <button onClick={handleUpload} disabled={uploading} style={{ marginLeft: 10 }}>
        {uploading ? '업로드 중...' : '업로드'}
      </button>
      {selectedFileName && (
        <div style={{ marginTop: 10, color: '#333' }}>
          선택된 파일: <b>{selectedFileName}</b>
        </div>
      )}
      {error && (
        <div style={{ color: 'red', marginTop: 15, whiteSpace: 'pre-line' }}>
          {error}
        </div>
      )}
      {result && (
        <div style={{ marginTop: 20 }}>
          <h4>서버 응답(JSON):</h4>
          <pre style={{
            background: '#f4f4f4',
            padding: 15,
            borderRadius: 6,
            maxHeight: 400,
            overflow: 'auto'
          }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

export default ParsingResult;

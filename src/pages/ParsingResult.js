import React, { useRef, useState } from 'react';

function ParsingResult() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [alert, setAlert] = useState({ message: '', type: '' });
  const [result, setResult] = useState(null);
  const fileInputRef = useRef();

  // 파일 선택/드래그 처리
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
      setResult(null);
      setAlert({ message: '', type: '' });
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setSelectedFile(e.dataTransfer.files[0]);
      setResult(null);
      setAlert({ message: '', type: '' });
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  // 업로드 함수
  const handleUpload = () => {
    if (!selectedFile) {
      showAlert('업로드할 파일을 선택하세요.', 'danger');
      return;
    }

    setUploading(true);
    setProgress(0);
    setResult(null);
    setAlert({ message: '', type: '' });

    const formData = new FormData();
    formData.append('file', selectedFile);

    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener('progress', function (e) {
      if (e.lengthComputable) {
        setProgress(Math.round((e.loaded / e.total) * 100));
      }
    });

    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        setUploading(false);
        setProgress(0);

        if (xhr.status === 200) {
          let response;
          try {
            response = JSON.parse(xhr.responseText);
          } catch (e) {
            showAlert('서버 응답 파싱 오류', 'danger');
            return;
          }
          showAlert('업로드 성공!', 'success');
          setResult(response);
          addFileToList(selectedFile.name);
          setSelectedFile(null);
        } else {
          let errorMsg = '파일 업로드 중 오류가 발생했습니다.';
          try {
            const response = JSON.parse(xhr.responseText);
            if (response.message) {
              errorMsg = response.message;
            }
          } catch (e) {
            // ignore parsing error
          }
          showAlert('Error: ' + errorMsg, 'danger');
        }
      }
    };

    // 절대경로로 요청 (CORS 허용 필요)
    xhr.open('POST', 'http://54.180.122.103:8080/upload', true);
    xhr.send(formData);
  };

  // 알림 표시
  const showAlert = (message, type) => {
    setAlert({ message, type });
    setTimeout(() => setAlert({ message: '', type: '' }), 3000);
  };

  // 업로드된 파일 목록에 추가
  const addFileToList = (fileName) => {
    setUploadedFiles((prev) => [
      ...prev,
      { name: fileName, timestamp: new Date().toLocaleString() },
    ]);
  };

  return (
    <div style={{
      maxWidth: 800,
      margin: '40px auto',
      padding: 24,
      background: '#fff',
      borderRadius: 8,
      boxShadow: '0 2px 10px rgba(0,0,0,0.08)'
    }}>
      <h1 style={{ textAlign: 'center', color: '#333' }}>파일 업로더</h1>

      <div
        className="upload-area"
        style={{
          border: '2px dashed #ccc',
          borderRadius: 5,
          padding: 50,
          textAlign: 'center',
          margin: '20px 0',
          cursor: 'pointer',
          transition: 'background-color 0.3s',
          background: '#f5f5f5'
        }}
        onClick={() => fileInputRef.current.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <div style={{ fontSize: 48, color: '#4a90e2', marginBottom: 10 }}>📁</div>
        <p>파일을 여기에 드래그하거나 클릭하여 선택하세요</p>
        <input
          type="file"
          id="file-input"
          style={{ display: 'none' }}
          ref={fileInputRef}
          onChange={handleFileChange}
        />
        {selectedFile && (
          <div style={{ marginTop: 10, color: '#333' }}>
            <strong>선택된 파일:</strong> {selectedFile.name}
          </div>
        )}
      </div>

      {/* 진행률 바 */}
      <div
        className="progress-container"
        style={{
          width: '100%',
          marginTop: 20,
          display: uploading ? 'block' : 'none'
        }}
      >
        <div
          className="progress-bar"
          style={{
            height: 20,
            backgroundColor: '#4a90e2',
            width: `${progress}%`,
            borderRadius: 5,
            textAlign: 'center',
            color: 'white',
            lineHeight: '20px',
            transition: 'width 0.3s'
          }}
        >
          {progress}%
        </div>
      </div>

      {/* 알림 */}
      {alert.message && (
        <div
          className={`alert alert-${alert.type}`}
          style={{
            backgroundColor: alert.type === 'success' ? '#d4edda' : '#f8d7da',
            color: alert.type === 'success' ? '#155724' : '#721c24',
            padding: 15,
            marginBottom: 20,
            borderRadius: 5
          }}
        >
          {alert.message}
        </div>
      )}

      <button
        onClick={handleUpload}
        disabled={uploading || !selectedFile}
        style={{
          width: '100%',
          padding: '12px 0',
          background: '#4a90e2',
          color: '#fff',
          border: 'none',
          borderRadius: 5,
          fontSize: 18,
          cursor: uploading ? 'not-allowed' : 'pointer',
          marginBottom: 16
        }}
      >
        {uploading ? '업로드 중...' : '업로드'}
      </button>

      {/* 업로드된 파일 목록 */}
      <div className="uploaded-files" style={{ marginTop: 20 }}>
        <h3>업로드된 파일:</h3>
        <div id="file-list">
          {uploadedFiles.map((file, idx) => (
            <div
              key={idx}
              className="file-item"
              style={{
                backgroundColor: '#f9f9f9',
                borderRadius: 5,
                padding: 10,
                marginBottom: 10,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <span className="file-name" style={{ wordBreak: 'break-all' }}>
                {file.name}
              </span>
              <small style={{ marginLeft: 10, color: '#666' }}>
                {file.timestamp}
              </small>
            </div>
          ))}
        </div>
      </div>

      {/* 파싱 결과(JSON) */}
      {result && (
        <div style={{
          background: '#f4f4f4',
          borderRadius: 8,
          padding: 20,
          marginTop: 20,
          overflowX: 'auto'
        }}>
          <h3>파싱 결과 (JSON)</h3>
          <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

export default ParsingResult;

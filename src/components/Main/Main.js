import React, { useState, useRef } from 'react';

function Main() {
  const [text, setText] = useState('');
  const fileInputRef = useRef(null);

  // 로고 클릭 시 example.com으로 이동
  const handleLogoClick = () => {
    window.location.href = 'http://example.com';
  };

  // 파일 첨부 버튼 클릭 시 숨겨진 파일 input 클릭
  const handleFileButtonClick = () => {
    fileInputRef.current.click();
  };

  // 파일 선택 후 서버 업로드 예시 (API 엔드포인트는 실제 사용에 맞게 수정)
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('file', file);
      try {
        const response = await fetch('YOUR_UPLOAD_API_ENDPOINT', {
          method: 'POST',
          body: formData,
        });
        const result = await response.json();
        console.log('파일 업로드 성공:', result);
      } catch (error) {
        console.error('파일 업로드 에러:', error);
      }
    }
  };

  // 전송 버튼 클릭 시 텍스트 필드의 내용 서버 전송 예시
  const handleSendClick = async () => {
    if (text.length > 3000) {
      alert('글자수는 최대 3000자까지 입력 가능합니다.');
      return;
    }
    try {
      const response = await fetch('YOUR_TEXT_SEND_API_ENDPOINT', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });
      const result = await response.json();
      console.log('메시지 전송 성공:', result);
    } catch (error) {
      console.error('메시지 전송 에러:', error);
    }
  };

  return (
    <div style={styles.container}>
      {/* 1열: 로고 */}
      <div style={styles.column}>
        <img
          src="logo512.png"
          alt="Logo"
          style={styles.logo}
          onClick={handleLogoClick}
        />
      </div>
      {/* 2열: 파일첨부, 텍스트필드, 전송버튼 (가로 배치) */}
      <div style={styles.column}>
        <div style={styles.inputRow}>
          <button onClick={handleFileButtonClick}>파일 첨부</button>
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={3000}
            placeholder="메시지를 입력하세요"
            style={styles.textField}
          />
          <button onClick={handleSendClick}>전송</button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center', // 전체 수평 중앙 정렬
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
  },
  column: {
    marginBottom: '20px',
    display: 'flex',
    justifyContent: 'center',
    width: '100%',
  },
  logo: {
    width: '150px',
    cursor: 'pointer',
  },
  inputRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: '10px',
  },
  textField: {
    padding: '8px',
    width: '300px',
    borderRadius: '4px',
    border: '1px solid #ccc',
  },
};

export default Main;

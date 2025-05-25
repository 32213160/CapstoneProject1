// src/components/TextFormatter/TextFormatter.js
import React from 'react';

/**
 * 텍스트 포맷터 컴포넌트
 * 
 * 이 컴포넌트는 텍스트 내의 \n 문자를 실제 줄바꿈으로 변환합니다.
 * 
 * 사용법:
 * <TextFormatter text="첫 번째 줄\n두 번째 줄\n세 번째 줄" />
 * 
 * 작동 원리:
 * 1. 입력받은 텍스트를 \n 기준으로 분할합니다
 * 2. 각 줄을 <React.Fragment>로 감싸고 <br/> 태그를 추가합니다
 * 3. 마지막 줄에는 <br/> 태그를 추가하지 않습니다
 */
function TextFormatter({ text }) {
  if (!text) return null;
  
  // 텍스트를 \n 기준으로 분할
  const lines = text.split('\n');
  
  return (
    <div style={{ whiteSpace: 'pre-wrap' }}>
      {lines.map((line, index) => (
        <React.Fragment key={index}>
          {line}
          {/* 마지막 줄이 아닌 경우에만 <br/> 추가 */}
          {index < lines.length - 1 && <br />}
        </React.Fragment>
      ))}
    </div>
  );
}

export default TextFormatter;

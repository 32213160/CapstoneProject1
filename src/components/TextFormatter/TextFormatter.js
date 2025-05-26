// src/components/TextFormatter/TextFormatter.js

import React from 'react';

/**
 * 텍스트 포맷터 컴포넌트
 * 
 * 이 컴포넌트는 텍스트 내의 \n 문자를 실제 줄바꿈으로 변환하고,
 * **텍스트** 형태를 bold 처리합니다.
 * 
 * 사용법:
 * <TextFormatter text="일반 텍스트\n**굵은 텍스트**\n다음 줄" />
 * 
 * 작동 원리:
 * 1. 입력받은 텍스트를 \n 기준으로 분할합니다
 * 2. 각 줄에서 **텍스트** 패턴을 찾아 <strong> 태그로 변환합니다
 * 3. 각 줄을 <div>로 감싸고 <br> 태그를 추가합니다
 * 4. 마지막 줄에는 <br> 태그를 추가하지 않습니다
 */

function TextFormatter({ text }) {
  if (!text) return null;

  // **텍스트** 패턴을 bold로 변환하는 함수
  const formatBoldText = (line) => {
    // **로 감싸진 텍스트를 찾는 정규식
    const boldPattern = /\*\*(.*?)\*\*/g;
    
    // 텍스트를 분할하여 bold 부분과 일반 부분을 구분
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = boldPattern.exec(line)) !== null) {
      // bold 태그 앞의 일반 텍스트 추가
      if (match.index > lastIndex) {
        parts.push(line.substring(lastIndex, match.index));
      }
      
      // bold 텍스트 추가
      parts.push(<strong key={`bold-${match.index}`}>{match[1]}</strong>);
      
      lastIndex = match.index + match[0].length;
    }
    
    // 마지막 일반 텍스트 추가
    if (lastIndex < line.length) {
      parts.push(line.substring(lastIndex));
    }
    
    return parts.length > 0 ? parts : [line];
  };

  // 텍스트를 \n 기준으로 분할
  const lines = text.split('\n');

  return (
    <div>
      {lines.map((line, index) => (
        <div key={index}>
          {formatBoldText(line)}
          {/* 마지막 줄이 아닌 경우에만 <br> 추가 */}
          {index < lines.length - 1 && <br />}
        </div>
      ))}
    </div>
  );
}

export default TextFormatter;

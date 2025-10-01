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
 * 
 * 확장된 기능:
 * - **굵은 텍스트** → <strong> 태그로 변환
 * - *기울임 텍스트* → <em> 태그로 변환
 * - `코드 텍스트` → <code> 태그로 변환 (인라인 코드)
 * - [0], [1], [2] 등 → 번호가 있는 섹션 헤더로 스타일링
 * - - 리스트 항목 → <ul><li> 태그로 변환 (순서 없는 목록)
 * - 1. 리스트 항목 → <ol><li> 태그로 변환 (순서 있는 목록)
 * - > 인용문 → <blockquote> 태그로 변환
 * - # 제목 → <h1>, ## 제목 → <h2> 등 헤딩 태그로 변환
 */

function TextFormatter({ text }) {
  if (!text) return null;

  /**
   * 인라인 스타일 포맷팅 함수
   * **굵은 텍스트**, *기울임*, `코드` 등을 처리합니다
   */
  const formatInlineStyles = (line) => {
    const parts = [];
    let currentText = line;
    let key = 0;

    // **굵은 텍스트** 패턴 처리
    const boldPattern = /\*\*(.*?)\*\*/g;
    let match;
    let lastIndex = 0;

    while ((match = boldPattern.exec(currentText)) !== null) {
      // bold 태그 앞의 텍스트 추가
      if (match.index > lastIndex) {
        const beforeText = currentText.substring(lastIndex, match.index);
        parts.push(...processRemainingInlineStyles(beforeText, key));
        key += 100;
      }
      
      // bold 텍스트 추가
      parts.push(<strong key={`bold-${key++}`}>{match[1]}</strong>);
      lastIndex = match.index + match[0].length;
    }
    
    // 마지막 텍스트 처리
    if (lastIndex < currentText.length) {
      const remainingText = currentText.substring(lastIndex);
      parts.push(...processRemainingInlineStyles(remainingText, key));
    }
    
    return parts.length > 0 ? parts : [line];
  };

  /**
   * 나머지 인라인 스타일 처리 함수
   * *기울임*, `코드` 등을 처리합니다
   */
  const processRemainingInlineStyles = (text, baseKey) => {
    const parts = [];
    let currentText = text;
    let key = baseKey;

    // *기울임* 패턴 처리 (단, **는 제외)
    const italicPattern = /(?<!\*)\*([^*]+)\*(?!\*)/g;
    let match;
    let lastIndex = 0;

    while ((match = italicPattern.exec(currentText)) !== null) {
      if (match.index > lastIndex) {
        const beforeText = currentText.substring(lastIndex, match.index);
        parts.push(...processCodeAndPlainText(beforeText, key));
        key += 50;
      }
      
      parts.push(<em key={`italic-${key++}`}>{match[1]}</em>);
      lastIndex = match.index + match[0].length;
    }
    
    if (lastIndex < currentText.length) {
      const remainingText = currentText.substring(lastIndex);
      parts.push(...processCodeAndPlainText(remainingText, key));
    }
    
    return parts.length > 0 ? parts : [text];
  };

  /**
   * `코드` 패턴과 일반 텍스트 처리 함수
   */
  const processCodeAndPlainText = (text, baseKey) => {
    const parts = [];
    const codePattern = /`([^`]+)`/g;
    let match;
    let lastIndex = 0;
    let key = baseKey;

    while ((match = codePattern.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
      
      parts.push(
        <code 
          key={`code-${key++}`}
          style={{
            backgroundColor: '#f4f4f4',
            padding: '2px 4px',
            borderRadius: '3px',
            fontFamily: 'Monaco, Consolas, "Courier New", monospace',
            fontSize: '0.9em'
          }}
        >
          {match[1]}
        </code>
      );
      lastIndex = match.index + match[0].length;
    }
    
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }
    
    return parts.length > 0 ? parts : [text];
  };

  /**
   * 블록 레벨 요소 처리 함수
   * 헤딩, 리스트, 인용문, 섹션 헤더 등을 처리합니다
   */
  const processBlockElement = (line, index) => {
    const trimmedLine = line.trim();

    // [숫자] 패턴 → 섹션 헤더로 처리
    const sectionPattern = /^\[(\d+)\]\s*(.*)$/;
    const sectionMatch = trimmedLine.match(sectionPattern);
    if (sectionMatch) {
      return (
        <div 
          key={index}
          style={{
            backgroundColor: '#e3f2fd',
            padding: '8px 12px',
            borderLeft: '4px solid #2196f3',
            margin: '8px 0',
            borderRadius: '4px'
          }}
        >
          <strong style={{ color: '#1976d2' }}>
            [{sectionMatch[1]}] {sectionMatch[2]}
          </strong>
        </div>
      );
    }

    // # 헤딩 패턴 처리
    const headingPattern = /^(#{1,6})\s+(.*)$/;
    const headingMatch = trimmedLine.match(headingPattern);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const HeadingTag = `h${level}`;
      return React.createElement(
        HeadingTag,
        { 
          key: index,
          style: { 
            marginTop: level <= 2 ? '16px' : '12px',
            marginBottom: '8px',
            color: '#333'
          }
        },
        formatInlineStyles(headingMatch[2])
      );
    }

    // > 인용문 패턴 처리
    if (trimmedLine.startsWith('> ')) {
      return (
        <blockquote 
          key={index}
          style={{
            borderLeft: '4px solid #ddd',
            paddingLeft: '16px',
            margin: '8px 0',
            fontStyle: 'italic',
            color: '#666'
          }}
        >
          {formatInlineStyles(trimmedLine.substring(2))}
        </blockquote>
      );
    }

    // - 순서 없는 리스트 패턴 처리
    if (trimmedLine.startsWith('- ')) {
      return (
        <ul key={index} style={{ margin: '4px 0', paddingLeft: '20px' }}>
          <li>{formatInlineStyles(trimmedLine.substring(2))}</li>
        </ul>
      );
    }

    // 숫자. 순서 있는 리스트 패턴 처리
    const orderedListPattern = /^(\d+)\.\s+(.*)$/;
    const orderedMatch = trimmedLine.match(orderedListPattern);
    if (orderedMatch) {
      return (
        <ol key={index} style={{ margin: '4px 0', paddingLeft: '20px' }}>
          <li>{formatInlineStyles(orderedMatch[2])}</li>
        </ol>
      );
    }

    // 일반 텍스트 처리
    return (
      <div key={index}>
        {formatInlineStyles(line)}
      </div>
    );
  };

  // 텍스트를 \n 기준으로 분할
  const lines = text.split('\n');

  return (
    <div>
      {lines.map((line, index) => {
        // 빈 줄 처리
        if (line.trim() === '') {
          return <div key={index} style={{ height: '8px' }} />;
        }

        // 블록 레벨 요소 처리
        const blockElement = processBlockElement(line, index);
        
        // 마지막 줄이 아닌 경우에만 여백 추가
        return (
          <React.Fragment key={index}>
            {blockElement}
            {index < lines.length - 1 && line.trim() !== '' && (
              <div style={{ height: '4px' }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

export default TextFormatter;

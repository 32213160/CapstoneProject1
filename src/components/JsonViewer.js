// src/components/JsonViewer.js
import React from 'react';

function JsonViewer({ data, title }) {
  if (!data) return <div className="jsonViewer empty">데이터가 없습니다</div>;
  
  // 결과가 문자열인 경우(JSON 문자열) 파싱
  const parsedData = typeof data === 'string' ? JSON.parse(data) : data;
  
  // 코드 블록 스타일 (기존 CSS와 일관성 유지)
  const codeBlockStyle = {
    background: '#f0f0f0',
    padding: '12px 16px',
    borderRadius: '8px',
    fontFamily: 'monospace',
    overflowX: 'auto',
    fontSize: '14px',
    maxHeight: '400px',
    overflowY: 'auto'
  };
  
  return (
    <div className="jsonViewer">
      {title && <h3 className="jsonTitle">{title}</h3>}
      
      <div style={codeBlockStyle}>
        <pre>{JSON.stringify(parsedData, null, 2)}</pre>
      </div>
    </div>
  );
}

export default JsonViewer;

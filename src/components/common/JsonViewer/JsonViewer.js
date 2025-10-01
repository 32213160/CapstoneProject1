// src/components/JsonViewer/JsonViewer.js
import React from 'react';

// 빈 객체, 빈 배열, null 값을 모두 제거하는 개선된 함수
function cleanObject(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  
  // 배열인 경우
  if (Array.isArray(obj)) {
    // engines 배열이면 null result 필터링
    if (obj.length > 0 && obj[0] && 'result' in obj[0]) {
      const filtered = obj.filter(item => item && item.result !== null);
      return filtered.length > 0 ? filtered.map(cleanObject) : undefined;
    }
    // 일반 배열인 경우
    const newArr = obj.map(cleanObject).filter(item => 
      item !== undefined && 
      item !== null && 
      (typeof item !== 'object' || Object.keys(item).length > 0)
    );
    return newArr.length > 0 ? newArr : undefined;
  }
  
  // 객체인 경우
  const newObj = {};
  let isEmpty = true;
  
  for (const key in obj) {
    // Date 객체는 보존
    if (obj[key] instanceof Date) {
      newObj[key] = obj[key];
      isEmpty = false;
      continue;
    }
    
    // engines 배열은 특별 처리
    if (key === 'engines' && Array.isArray(obj[key])) {
      const filtered = obj[key].filter(engine => engine && engine.result !== null);
      if (filtered.length > 0) {
        newObj[key] = filtered;
        isEmpty = false;
      }
      continue;
    }
    
    // 재귀적으로 정리
    const cleanedValue = cleanObject(obj[key]);
    
    // undefined, null이 아니고, 빈 객체/배열이 아닌 경우만 포함
    if (cleanedValue !== undefined && 
        cleanedValue !== null && 
        (typeof cleanedValue !== 'object' || Object.keys(cleanedValue).length > 0)) {
      newObj[key] = cleanedValue;
      isEmpty = false;
    }
  }
  
  return isEmpty ? undefined : newObj;
}

function JsonViewer({ data, title }) {
  if (!data) return null;
  
  let parsedData;
  try {
    // 문자열인 경우에만 파싱 시도, 객체는 그대로 사용
    parsedData = typeof data === 'string' ? JSON.parse(data) : data;
    
    // null 값과 빈 객체/배열을 제거
    parsedData = cleanObject(parsedData);
    
    // 정리 후 undefined가 되면 빈 객체 반환
    if (parsedData === undefined) {
      parsedData = { message: "필터링 후 표시할 데이터가 없습니다." };
    }
    
  } catch (err) {
    console.error('JSON 파싱 오류:', err);
    // 오류 발생 시 원본 데이터를 그대로 표시하는 UI 반환
    return (
      <div className="json-error">
        <h4>JSON 데이터 파싱 중 오류가 발생했습니다</h4>
        <p>오류 메시지: {err.message}</p>
        <div>
          <h5>원본 데이터:</h5>
          <pre style={{ whiteSpace: 'pre-wrap', overflowWrap: 'break-word' }}>
            {typeof data === 'string' ? data : JSON.stringify(data, null, 2)}
          </pre>
        </div>
      </div>
    );
  }
  
  // 성공적으로 파싱된 경우 JSON 데이터 표시
  return (
    <div className="json-viewer">
      {title && <h3>{title}</h3>}
      <pre style={{ whiteSpace: 'pre-wrap', overflowWrap: 'break-word' }}>
        {JSON.stringify(parsedData, null, 2)}
      </pre>
    </div>
  );
}

export default JsonViewer;

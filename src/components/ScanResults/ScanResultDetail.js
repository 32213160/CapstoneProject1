// src/components/ScanResultDetail.js
import React, { useState, useEffect } from 'react';
import { fetchScanResultById } from '../../services/ApiService';
import JsonViewer from '../JsonViewer';

function ScanResultDetail({ resultId }) {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!resultId) return;
    
    async function loadResult() {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchScanResultById(resultId);
        setResult(data);
      } catch (err) {
        setError('결과를 가져오는데 실패했습니다');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    
    loadResult();
  }, [resultId]);

  if (!resultId) return <div className="placeholder">분석 결과를 선택해주세요</div>;
  if (loading) return <div className="loading">로딩 중...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!result) return null;

  // 코드가 포함된 경우 특별 처리
  const renderMaliciousCode = () => {
    if (!result.code) return null;
    
    return (
      <div className="codeSection">
        <h4>탐지된 악성 코드</h4>
        <pre className="codeBlock">
          <code>{result.code}</code>
        </pre>
      </div>
    );
  };

  return (
    <div className="scanResultDetail">
      <h3>{result.fileName || 'APK 파일 분석 결과'}</h3>
      
      {renderMaliciousCode()}
      
      <div className="analysisResult">
        <JsonViewer data={result} title="전체 분석 결과" />
      </div>
    </div>
  );
}

export default ScanResultDetail;

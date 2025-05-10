// src/components/ScanResults/ScanResultsList.js
import React, { useState, useEffect } from 'react';
import { fetchAllScanResults } from '../../services/ApiService';

function ScanResultsList({ onSelectResult }) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadResults = async () => {
      try {
        setLoading(true);
        const data = await fetchAllScanResults();
        setResults(data);
        setLoading(false);
      } catch (err) {
        setError('스캔 결과를 불러오는 중 오류가 발생했습니다.');
        setLoading(false);
      }
    };

    loadResults();
  }, []);

  if (loading) return <div className="loading">로딩 중...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="scanResultsList">
      <h2>스캔 결과 목록</h2>
      {results.length === 0 ? (
        <p>스캔 결과가 없습니다.</p>
      ) : (
        <ul>
          {results.map((result) => (
            <li 
              key={result._id} 
              className="scanResultItem"
              onClick={() => onSelectResult(result._id)}
            >
              <div className="resultTitle">{result.fileName || result.name || `스캔 결과 #${result._id}`}</div>
              <div className="resultDate">{new Date(result.scanDate || result.timestamp).toLocaleString()}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ScanResultsList;

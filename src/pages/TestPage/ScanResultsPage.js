import React, { useState, useEffect } from "react";

const ScanResultsPage = () => {
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [detectedResults, setDetectedResults] = useState([]);

  useEffect(() => {
    fetch("/json/scanresults", { method: "GET", redirect: "follow" })
      .then((response) => response.json())
      .then((jsonArray) => { // 응답이 배열임
        setResult(jsonArray);
  
        // 모든 배열 요소에서 결과 추출
        const allResults = jsonArray.flatMap(item => {
          const laResults = item?.data?.attributes?.lastAnalysisResults || {};
          return Object.entries(laResults)
            .filter(([engine, val]) => val?.result)
            .map(([engine, val]) => ({
              engine,
              result: val.result,
              scanId: item._id // 필요시 추가 데이터 포함
            }));
        });
  
        setDetectedResults(allResults);
      })
      .catch(error => setError(error.toString()));
  }, []);  

  return (
    <div>
      <h2>Scan Results</h2>
      {error && <div style={{ color: "red" }}>Error: {error}</div>}
      {result ? (
        <div>
          <h3>진단된 엔진 및 결과 (result가 null이 아닌 경우만):</h3>
          {detectedResults.length > 0 ? (
            <ul>
              {detectedResults.map((item, idx) => (
                <li key={idx}>
                  <b>{item.engine}</b>: {item.result}
                </li>
              ))}
            </ul>
          ) : (
            <div>진단 결과가 없습니다.</div>
          )}

          <h4>원본 JSON (테스트용)</h4>
          <pre>
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      ) : (
        <div>Loading...</div>
      )}
    </div>
  );
};

export default ScanResultsPage;

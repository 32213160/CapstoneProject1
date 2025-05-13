// ScanResultsPage.js
import React, { useState, useEffect } from "react";

const ScanResultsPage = () => {
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const formdata = new FormData();

    const requestOptions = {
      method: "GET",
      //body: formdata,
      redirect: "follow"
    };

    fetch("/json/scanresults", requestOptions)
      .then((response) => response.text())
      .then((result) => {
        try {
          setResult(JSON.parse(result));
        } catch (e) {
          setResult(result);
        }
      })
      .catch((error) => setError(error.toString()));
  }, []);

  return (
    <div>
      <h2>Scan Results</h2>
      {error && <div style={{ color: "red" }}>Error: {error}</div>}
      {result ? (
        <pre>
          {typeof result === "object"
            ? JSON.stringify(result, null, 2)
            : result}
        </pre>
      ) : (
        <div>Loading...</div>
      )}
    </div>
  );
};


export default ScanResultsPage;

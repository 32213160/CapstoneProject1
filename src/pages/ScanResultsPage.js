// src/pages/ScanResultsPage.js
import React, { useState } from 'react';
import Header from '../components/Main/Header';
import ScanResultsList from '../components/ScanResults/ScanResultsList';
import ScanResultDetail from '../components/ScanResults/ScanResultDetail';
import FileUpload from '../components/FileUpload/FileUpload';
import '../components/Main/Main.css';

function ScanResultsPage() {
  const [selectedResultId, setSelectedResultId] = useState(null);
  const [uploadedResult, setUploadedResult] = useState(null);
  const [showUploadResult, setShowUploadResult] = useState(false);

  const handleSelectResult = (id) => {
    setSelectedResultId(id);
    setShowUploadResult(false);
  };

  const handleUploadComplete = (result) => {
    setUploadedResult(result);
    setShowUploadResult(true);
  };

  return (
    <div className="chatContainer">
      <Header 
        title="APK 악성코드 분석 결과" 
        onMenuClick={() => {}} 
        onProfileClick={() => {}}
      />
      
      <div className="scanResultsContainer">
        <div className="leftPanel">
          <FileUpload onUploadComplete={handleUploadComplete} />
          <div className="resultsList">
            <ScanResultsList onSelectResult={handleSelectResult} />
          </div>
        </div>
        
        <div className="rightPanel">
          {showUploadResult && uploadedResult ? (
            <div className="uploadResultContainer">
              <h3>업로드 파일 분석 결과</h3>
              <pre className="jsonData">{JSON.stringify(uploadedResult, null, 2)}</pre>
            </div>
          ) : (
            <ScanResultDetail resultId={selectedResultId} />
          )}
        </div>
      </div>
    </div>
  );
}

export default ScanResultsPage;

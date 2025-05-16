// src/App.js
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import MainPage from './pages/MainPage/MainPage';
import ChatPage from './pages/ChatPage/ChatPage';
import ScanResultsPage from './pages/TestPage/ScanResultsPage';
import ParsingResult from './pages/TestPage/ParsingResult';
import TestPage from './pages/TestPage/TestPage';

function App() {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);

  if (error) return <div>에러: {error}</div>;

  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/chat/:chatId" element={<ChatPage />} />
        <Route path="/scanresults" element={<ScanResultsPage />} />
        <Route path="/parsingresult" element={<ParsingResult />} />
        <Route path="/test" element={<TestPage />} />
      </Routes>
    </Router>
  );
}

export default App;

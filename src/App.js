// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainPage from './pages/MainPage';
import ChatPage from './pages/ChatPage';
import ScanResultsPage from './pages/ScanResultsPage';
import ParsingResult from './pages/ParsingResult';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/chat/:chatId" element={<ChatPage />} />
        <Route path="/scanresults" element={<ScanResultsPage />} />
        <Route path="/parsingresult" element={<ParsingResult />} />
      </Routes>
    </Router>
  );
}

export default App;

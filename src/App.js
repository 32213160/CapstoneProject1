// src/App.js
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainPage from './pages/MainPage';
import ChatPage from './pages/ChatPage';
import TestPage from './pages/TestPage';

function App() {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);

  if (error) return <div>에러: {error}</div>;

  // 개발 환경에서만 StrictMode 비활성화
  const isDevelopment = process.env.NODE_ENV === 'development';

  const AppContent = (
    <Router>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/chat/:chatId" element={<ChatPage />} />
        <Route path="/test" element={<TestPage />} />
      </Routes>
    </Router>
  );

  // 개발 모드에서는 StrictMode 없이, 프로덕션에서는 StrictMode 적용
  return isDevelopment ? AppContent : <React.StrictMode>{AppContent}</React.StrictMode>;
}

export default App;

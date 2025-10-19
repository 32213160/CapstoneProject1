// src/App.js
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainPage from './pages/MainPage';
import ChatPage from './pages/ChatPage';
import TestPage from './pages/TestPage';
import { AuthProvider } from './components/auth/AuthContext';

function App() {
  const [error] = useState(null);

  if (error) return <div>에러: {error}</div>;

  // 개발 환경에서만 StrictMode 비활성화
  const isDevelopment = process.env.NODE_ENV === 'development';

  const AppContent = (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/chat/:chatId" element={<ChatPage />} />
          <Route path="/test" element={<TestPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );

  // 개발 모드에서는 StrictMode 없이, 프로덕션에서는 StrictMode 적용
  return isDevelopment ? AppContent : <React.StrictMode>{AppContent}</React.StrictMode>;
}

export default App;

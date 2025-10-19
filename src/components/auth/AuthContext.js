// src/auth/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';

// 컨텍스트 생성
const AuthContext = createContext();

// Provider 컴포넌트
export const AuthProvider = ({ children }) => {
  const BASE_URL = ''; // TestPage.js와 동일하게 상대 경로 사용
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    username: null,
    loading: true
  });

  // 앱 초기 렌더링 시 인증 상태 확인
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/auth/status`, {
          method: 'GET',
          credentials: 'include'  // JSESSIONID 쿠키 포함
        });
        if (response.ok) {
          const data = await response.json();
          setAuthState({
            isAuthenticated: data.authenticated,
            username: data.username,
            loading: false
          });
        } else {
          setAuthState({ isAuthenticated: false, username: null, loading: false });
        }
      } catch (error) {
        console.error('인증 상태 확인 실패:', error);
        setAuthState({ isAuthenticated: false, username: null, loading: false });
      }
    };

    checkAuth();
  }, []);

  // 로그인 시 로컬 상태 업데이트
  const login = (username) => {
    setAuthState({ isAuthenticated: true, username, loading: false });
  };

  // 로그아웃 시 로컬 상태 업데이트
  const logoutLocal = () => {
    setAuthState({ isAuthenticated: false, username: null, loading: false });
  };

  return (
    <AuthContext.Provider value={{ ...authState, login, logoutLocal }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook으로 간편 사용
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

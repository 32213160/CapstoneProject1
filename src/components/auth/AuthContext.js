// src/auth/AuthContext.js

import React, { createContext, useContext, useState, useEffect } from 'react';

// 컨텍스트 생성
const AuthContext = createContext();

// Provider 컴포넌트
export const AuthProvider = ({ children }) => {
  const BASE_URL = ''; // TestPage.js와 동일하게 상대 경로 사용 (proxy 사용)
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    username: null,
    loading: true
  });

  // 인증 상태 확인 함수 (재사용 가능)
  const checkAuthStatus = async () => {
    try {
      console.log('[디버깅] AuthContext: 인증 상태 확인 시작');
      const response = await fetch(`${BASE_URL}/api/auth/status`, {
        method: 'GET',
        credentials: 'include' // JSESSIONID 쿠키 포함
      });

      console.log('[디버깅] AuthContext: 응답 상태 코드:', response.status);

      // 401이나 403도 정상 응답으로 처리 (로그인 안된 상태)
      if (response.status === 200 || response.status === 401 || response.status === 403) {
        const data = await response.json();
        console.log('[디버깅] AuthContext: 서버 응답 데이터:', data);
        
        setAuthState({
          isAuthenticated: data.authenticated === true,
          username: data.username || null,
          loading: false
        });
        
        console.log('[디버깅] AuthContext: 최종 인증 상태:', data.authenticated === true);
        return data.authenticated === true;
      } else {
        console.warn('[디버깅] AuthContext: 예상치 못한 상태 코드:', response.status);
        setAuthState({ isAuthenticated: false, username: null, loading: false });
        return false;
      }
    } catch (error) {
      console.error('[디버깅] AuthContext: 인증 상태 확인 실패:', error);
      setAuthState({ isAuthenticated: false, username: null, loading: false });
      return false;
    }
  };

  // 앱 초기 렌더링 시 인증 상태 확인
  useEffect(() => {
    console.log('[디버깅] AuthContext: useEffect 실행 - 초기 인증 상태 확인');
    checkAuthStatus();
  }, []);

  // 로그인 시 로컬 상태 업데이트
  const login = (username) => {
    console.log('[디버깅] AuthContext: 로그인 함수 호출, username:', username);
    setAuthState({ isAuthenticated: true, username, loading: false });
  };

  // 로그아웃 시 로컬 상태 업데이트
  const logoutLocal = () => {
    console.log('[디버깅] AuthContext: 로그아웃 함수 호출');
    setAuthState({ isAuthenticated: false, username: null, loading: false });
  };

  // 수동으로 인증 상태 새로고침 (로그인/로그아웃 후 사용)
  const refreshAuthStatus = async () => {
    console.log('[디버깅] AuthContext: 인증 상태 새로고침 요청');
    return await checkAuthStatus();
  };

  return (
    <AuthContext.Provider 
      value={{ 
        ...authState, 
        login, 
        logout: logoutLocal,
        refreshAuthStatus,
        checkAuthStatus
      }}
    >
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

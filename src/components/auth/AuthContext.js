// src/auth/AuthContext.js

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// 컨텍스트 생성
const AuthContext = createContext();

// Provider 컴포넌트
export const AuthProvider = ({ children }) => {
  // TestPage.js와 동일하게 설정
  const BASE_URL = process.env.NODE_ENV === 'development'
    ? 'https://torytestsv.kro.kr'  // 로컬 개발: 백엔드 직접 호출
    : 'https://torytestsv.kro.kr';  // 배포: 백엔드 직접 호출

  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    username: null,
    loading: true
  });

  // 인증 상태 확인 함수 (재사용 가능) - useCallback으로 메모이제이션
  const checkAuthStatus = useCallback(async () => {
    try {
      console.log('[디버깅] AuthContext: 인증 상태 확인 시작');
      console.log('[디버깅] AuthContext: BASE_URL:', BASE_URL);
      console.log('[디버깅] AuthContext: NODE_ENV:', process.env.NODE_ENV);

      const response = await fetch(`${BASE_URL}/api/auth/status`, {
        method: 'GET',
        credentials: 'include', // JSESSIONID 쿠키 포함
        headers: {
          'Accept': 'application/json'
        }
      });

      console.log('[디버깅] AuthContext: 응답 상태 코드:', response.status);

      // 응답이 HTML인지 확인
      const contentType = response.headers.get('content-type');
      console.log('[디버깅] AuthContext: Content-Type:', contentType);

      if (contentType && contentType.includes('text/html')) {
        console.error('[디버깅] AuthContext: HTML 응답 수신 - API 라우팅 실패');
        setAuthState({ isAuthenticated: false, username: null, loading: false });
        return false;
      }

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
      
      // CORS 에러 감지 및 안내
      if (error.message && error.message.includes('Failed to fetch')) {
        console.error('[중요] CORS 에러 가능성: 백엔드 팀에 다음 CORS 설정을 요청하세요');
        console.error('허용 도메인:', window.location.origin);
        console.error('필요 설정: allowCredentials: true, allowedOrigins: ' + window.location.origin);
      }
      
      setAuthState({ isAuthenticated: false, username: null, loading: false });
      return false;
    }
  }, [BASE_URL]); // BASE_URL을 의존성에 추가

  // 앱 초기 렌더링 시 인증 상태 확인
  useEffect(() => {
    console.log('[디버깅] AuthContext: useEffect 실행 - 초기 인증 상태 확인');
    checkAuthStatus();
  }, [checkAuthStatus]); // checkAuthStatus를 의존성에 추가 (useCallback으로 메모이제이션되어 안전)

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
    <AuthContext.Provider value={{
      ...authState,
      login,
      logout: logoutLocal,
      refreshAuthStatus,
      checkAuthStatus
    }}>
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

// src/components/auth/LogoutButton.js
import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaSignOutAlt, FaSpinner } from 'react-icons/fa';

function LogoutButton({ onLogout }) {
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    if (loading) return;

    const confirmed = window.confirm('로그아웃 하시겠습니까?');
    if (!confirmed) return;

    setLoading(true);

    try {
      // 로그아웃 처리 시뮬레이션 (실제로는 API 호출)
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // localStorage에서 인증 관련 정보 제거
      localStorage.removeItem('userToken');
      localStorage.removeItem('userInfo');
      
      // 선택적으로 다른 사용자 관련 데이터도 정리
      // localStorage.removeItem('userPreferences');
      
      if (onLogout) {
        onLogout();
      }
      
    } catch (error) {
      console.error('로그아웃 중 오류 발생:', error);
      alert('로그아웃 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="logout-section" style={{ padding: '8px 0' }}>
      <button
        onClick={handleLogout}
        disabled={loading}
        className="btn btn-outline-danger w-100"
        style={{ 
          padding: '12px',
          fontWeight: 600,
          borderColor: '#e53e3e',
          color: '#e53e3e',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px'
        }}
      >
        {loading ? (
          <>
            <FaSpinner className="fa-spin" />
            로그아웃 중...
          </>
        ) : (
          <>
            <FaSignOutAlt />
            로그아웃
          </>
        )}
      </button>
      
      <div className="text-center mt-2">
        <small className="text-muted" style={{ fontSize: '12px' }}>
          안전하게 로그아웃됩니다
        </small>
      </div>
    </div>
  );
}

export default LogoutButton;

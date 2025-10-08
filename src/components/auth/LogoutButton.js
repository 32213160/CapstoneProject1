// src/components/auth/LogoutButton.js

import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaSignOutAlt, FaSpinner } from 'react-icons/fa';
import { logout } from '../../services/ApiService';

function LogoutButton({ onLogout }) {
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    if (loading) return;

    const confirmed = window.confirm('로그아웃 하시겠습니까?');
    if (!confirmed) return;

    setLoading(true);
    try {
      await logout();
      // 로컬스토리지에 저장했던 인증 정보 삭제
      localStorage.removeItem('sessionId');
      localStorage.removeItem('userInfo');
      // 필요한 경우 추가 사용자 정보 삭제
      if (onLogout) onLogout();
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

// src/components/layout/Header.js

import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaBars, FaUserCircle, FaPlus } from 'react-icons/fa';

function Header({ title = null, onMenuClick, onProfileClick, onLogoClick, onStartNewChat, className, style }) {
  return (
    <header
      className={`d-flex justify-content-between align-items-center p-3 border-bottom bg-white sticky-top ${className || ''}`}
      style={{
        height: '80px',
        background: 'linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(255,255,255,1) 40%, rgba(255,255,255,0.5) 75%, rgba(255,255,255,1) 100%)',
        backdropFilter: 'blur(5px)',
        borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
        ...style
      }}
    >
      {/* 왼쪽: 메뉴 버튼 */}
      <div
        className="d-flex align-items-center justify-content-center"
        style={{ minWidth: '40px', height: '100%' }}
      >
        <button
          className="btn btn-link text-dark p-0 d-flex align-items-center justify-content-center"
          onClick={onMenuClick}
          style={{ fontSize: '1.5rem', lineHeight: 1, height: '100%' }}
        >
          <FaBars />
        </button>
      </div>

      {/* 중앙: 제목 */}
      <div className="flex-grow-1 text-center mx-2">
        <h1
          className="h5 mb-0 text-truncate"
          onClick={onLogoClick}
          style={{ cursor: 'pointer', lineHeight: '1.2' }}
        >
          {title || '파일 내 악성 코드 분석 서비스'}
        </h1>
      </div>

      {/* 새 채팅 버튼 */}
      <div
        className="d-flex align-items-center justify-content-center gap-3 px-3"
        style={{ height: '100%' }}
      >
        {onStartNewChat && (
          <button
            className="btn btn-sm btn-outline-primary d-flex align-items-center gap-2"
            onClick={onStartNewChat}
            style={{ borderRadius: '20px', padding: '6px 16px' }}
          >
            <FaPlus style={{ fontSize: '14px', lineHeight: 1 }} />
            <span style={{ lineHeight: 1 }}>새 채팅</span>
          </button>
        )}
      </div>

      {/* 오른쪽: 프로필 버튼 */}
      <div
        className="d-flex align-items-center justify-content-center"
        style={{ minWidth: '40px', height: '100%' }}
      >
        <button
          className="btn btn-link text-dark p-0 d-flex align-items-center justify-content-center"
          onClick={onProfileClick}
          style={{ fontSize: '1.5rem', lineHeight: 1, height: '100%' }}
        >
          <FaUserCircle />
        </button>
      </div>
    </header>
  );
}

export default Header;

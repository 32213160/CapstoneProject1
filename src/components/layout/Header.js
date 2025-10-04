// src/components/layout/Header.js

import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaBars, FaUserCircle } from 'react-icons/fa';

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
      {/* Header 내용 */}

      {/* 왼쪽: 메뉴 버튼 - 고정 너비 */}
      <div className="d-flex align-items-center" style={{ minWidth: '40px' }}>
        <button 
          className="btn btn-link text-dark p-0"
          onClick={onMenuClick}
          style={{ fontSize: '1.5rem' }}
        >
          <FaBars />
        </button>
      </div>

      {/* 중앙: 제목 - 유연한 너비, 양쪽 마진 제거 */}
      <div className="flex-grow-1 text-center mx-2">
        <h1 
          className="h5 mb-0 text-truncate" 
          onClick={onLogoClick}
          style={{ cursor: 'pointer' }}
        >
          {title || '파일 내 악성 코드 분석 서비스'}
        </h1>
      </div>

      {/* 오른쪽: 프로필 버튼 - 고정 너비 */}
      <div className="d-flex align-items-center" style={{ minWidth: '40px' }}>
        <button 
          className="btn btn-link text-dark p-0"
          onClick={onProfileClick}
          style={{ fontSize: '1.5rem' }}
        >
          <FaUserCircle />
        </button>
      </div>
    </header>
  );
}

export default Header;

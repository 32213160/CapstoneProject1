// src/components/Main/Header.js
import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaBars, FaUserCircle } from 'react-icons/fa';

function Header({ onMenuClick, onProfileClick, onLogoClick, title = null }) {
  
  return (
    <header 
      className="header d-flex align-items-center justify-content-between px-3 px-md-3 px-lg-4 px-xl-5 py-3 position-fixed w-100 top-0"
      style={{ 
        zIndex: 1030,
        height: '80px',
        background: `linear-gradient(
          to bottom, 
          rgba(255, 255, 255, 1) 0%,
          rgba(255, 255, 255, 0.7) 50%,
          rgba(255, 255, 255, 0) 100%
        )`,
        borderBottom: 'none'
      }}
    >

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
          {title || 'APK 분석 서비스'}
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

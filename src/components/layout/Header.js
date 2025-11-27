// src/components/layout/Header.js

import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaBars, FaUserCircle, FaPlus } from 'react-icons/fa';

function Header({ title = null, onMenuClick, onProfileClick, onLogoClick, onStartNewChat, className, style }) {
  return (
    <header
      className={`d-flex justify-content-between align-items-center p-3 sticky-top ${className || ''}`}
    >
      {/* 왼쪽: 메뉴 버튼 */}
      <div
        className="d-flex p-3 align-items-center justify-content-center"
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
        className="d-flex p-3 align-items-center justify-content-center"
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

// Header.js
import React from 'react';
import { FaBars, FaUserCircle } from 'react-icons/fa';

function Header({ onMenuClick, onProfileClick, title = "'sample.apk' 파일의 악성 코드 분석" }) {
  return (
    <header className="headerContainer">
      <div className="chatHeader">
        <div className="leftSection">
          <button className="menuButton" onClick={onMenuClick} aria-label="메뉴 열기">
            <FaBars size={24} />
          </button>
          <h1 className="title">{title}</h1>
        </div>
        <div className="rightSection">
          <button className="profileButton" onClick={onProfileClick} aria-label="프로필/설정 열기">
            <FaUserCircle size={40} />
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;

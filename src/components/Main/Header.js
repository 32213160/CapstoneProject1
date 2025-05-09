// src/components/Main/Header.js
import React from 'react';
import { FaBars, FaUserCircle } from 'react-icons/fa';

function Header({ onMenuClick, onProfileClick, title = "'sample.apk' 파일의 악성 코드 분석" }) {
  return (
    <div className="headerContainer">
      <div className="chatHeader">
        <div className="leftSection">
          <button className="menuButton" onClick={onMenuClick}>
            <FaBars />
          </button>
          <span className="title">{title}</span>
        </div>
        <div className="rightSection">
          <button className="profileButton" onClick={onProfileClick}>
            <FaUserCircle />
          </button>
        </div>
      </div>
    </div>
  );
}

export default Header;

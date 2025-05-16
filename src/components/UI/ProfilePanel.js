// src/components/Main/ProfilePanel.js
import React from 'react';
import { FaTimes } from 'react-icons/fa';

function ProfilePanel({ onClose }) {
  return (
    <div>
      <div className="profilePanelHeader">
        <span>내 프로필</span>
        <button className="closeProfilePanel" onClick={onClose}>
          <FaTimes />
        </button>
      </div>
      <div className="profileImageBig" />
      <div className="profileName">홍길동</div>
      <button className="profileOptionBtn">설정</button>
      <button className="profileOptionBtn">로그아웃</button>
    </div>
  );
}

export default ProfilePanel;

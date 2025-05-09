// ProfilePanel.js
import React from 'react';

function ProfilePanel({ onClose }) {
  return (
    <div className="profilePanel">
      <div className="profilePanelHeader">
        <span>마이페이지</span>
        <button className="closeProfilePanel" onClick={onClose}>×</button>
      </div>
      <div className="profilePanelContent">
        <div className="profileImageBig">
          {/* 프로필 이미지 or 기본 아이콘 */}
        </div>
        <div className="profileName">이서현</div>
        <button className="profileOptionBtn">설정</button>
        <button className="profileOptionBtn">로그아웃</button>
      </div>
    </div>
  );
}

export default ProfilePanel;

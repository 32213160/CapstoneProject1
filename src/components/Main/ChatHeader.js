import React from 'react';

function ChatHeader({ onMenuClick }) {
  return (
    <div className="chatHeader">
      <div className="leftSection">
        <button className="menuButton" onClick={onMenuClick}>
          <i>≡</i>
        </button>
        <h1 className="title">'sample.apk' 파일의 악성 코드 분석</h1>
      </div>
      <div className="rightSection">
        <div className="userProfilePicture"></div>
      </div>
    </div>
  );
}

export default ChatHeader;

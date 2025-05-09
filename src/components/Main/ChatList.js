// ChatList.js
import React from 'react';

function ChatList({ chats, onSelectChat }) {
  return (
    <div className="chatListPanel">
      <div className="chatListTitle">오늘</div>
      {chats.map((chat, idx) => (
        <div
          key={chat.id}
          className="chatListItem"
          onClick={() => onSelectChat(chat.id)}
        >
          {chat.title}
        </div>
      ))}
      {/* 예시: 날짜별 분리 */}
      <div className="chatListTitle">어제</div>
      {/* ... */}
    </div>
  );
}

export default ChatList;

// src/components/Main/ChatList.js

import React from 'react';

function ChatList({ chats, onSelectChat }) {
  // 날짜별로 채팅을 그룹화
  const groupedChats = chats.reduce((acc, chat) => {
    // 임의의 날짜 포맷 사용: "2025-05-10" 등
    // 실제로는 chat.date를 서버에서 받은 날짜로 사용
    const date = chat.date; 
    if (!acc[date]) acc[date] = [];
    acc[date].push(chat);
    return acc;
  }, {});

  return (
    <div>
      <h2 className="chatListTitle">채팅 목록</h2>
      {/* 날짜별로 그룹화된 채팅 렌더링 */}
      {Object.entries(groupedChats).map(([date, chatsForDate]) => (
        <div key={date} style={{ marginBottom: '20px' }}>
          <div style={{ fontWeight: 'bold', margin: '12px 0 6px 8px', color: '#7a7a7a' }}>
            {date} {/* ← 임의의 날짜, 예: "2025-05-10" */}
            {/* TODO: 나중에 날짜 포맷을 서버 데이터에 맞게 수정 */}
          </div>
          <ul style={{ padding: 0, margin: 0 }}>
            {chatsForDate.map(chat => (
              <li
                key={chat.id}
                className="chatListItem"
                onClick={() => onSelectChat(chat.id)}
                style={{ cursor: 'pointer', padding: '10px', borderBottom: '1px solid #ddd', listStyle: 'none' }}
              >
                <strong>{chat.title}</strong>
                <br />
                <small>{chat.date}</small>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export default ChatList;

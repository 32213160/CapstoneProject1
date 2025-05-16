// src/components/Main/ChatList.js
import React from 'react';
import '../UI/ChatList.css';

function ChatList({ chats = [], onSelectChat, onClose }) {
  // 채팅 목록 예시 데이터
  const chatList = [
    { id: 1, title: "sample.apk 파일의 악성 코드 분석", date: "오늘" },
    { id: 2, title: "Aegis.apk 파일의 악성 코드...", date: "어제" },
    { id: 3, title: "DanS.apk 파일의 악성 코드...", date: "어제" },
    { id: 4, title: "Danjeong.apk 파일의 악성 코드...", date: "2 days ago" },
    { id: 5, title: "NEWSWEEK.apk 파일의 악성 코드...", date: "2 days ago" },
    { id: 6, title: "example.apk 악성 코드 분석 및 설명", date: "2 days ago" },
  ];

  // 실제 chats가 있으면 사용, 없으면 예시 데이터 사용
  const chatsToUse = chats && chats.length > 0 ? chats : chatList;
  
  // 날짜별로 채팅을 그룹화
  const groupedChats = chatsToUse.reduce((acc, chat) => {
    // 임의의 날짜 포맷 사용: "2025-05-10" 등
    // 실제로는 chat.date를 서버에서 받은 날짜로 사용
    const date = chat.date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(chat);
    return acc;
  }, {});

  return (
    <div className="chat-list-panel">
      <div className="chat-list-header">
        <h2>채팅 목록</h2>
        <button className="close-button" onClick={onClose}>×</button>
      </div>
      <div className="chat-list-content">
        {Object.entries(groupedChats).map(([date, chats]) => (
          <div key={date} className="chat-group">
            <div className="chat-date">{date}</div>
            {chats.map(chat => (
              <div 
                key={chat.id} 
                className="chat-item"
                onClick={() => onSelectChat(chat.id)}
              >
                <div className="chat-title">{chat.title}</div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default ChatList;

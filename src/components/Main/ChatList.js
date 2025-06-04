// src/components/Main/ChatList.js
import React, { useState, useEffect } from 'react';
import { ListGroup, Button, Badge } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaTimes, FaFile, FaComment } from 'react-icons/fa';

function ChatList({ onSelectChat, onClose }) {
  const [chatSessions, setChatSessions] = useState([]);

  // 로컬 저장소에서 채팅 세션 불러오기
  useEffect(() => {
    loadChatSessions();
  }, []);

  const loadChatSessions = () => {
    try {
      const sessions = JSON.parse(localStorage.getItem('chatSessions') || '[]');
      // 날짜순으로 정렬 (최신순)
      const sortedSessions = sessions.sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated));
      setChatSessions(sortedSessions);
    } catch (error) {
      console.error('채팅 세션 로드 실패:', error);
      setChatSessions([]);
    }
  };

  // 날짜별로 그룹화
  const groupSessionsByDate = (sessions) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const groups = {
      '오늘': [],
      '어제': [],
      '이전': []
    };

    sessions.forEach(session => {
      const sessionDate = new Date(session.lastUpdated);
      const sessionDateStr = sessionDate.toDateString();
      
      if (sessionDateStr === today.toDateString()) {
        groups['오늘'].push(session);
      } else if (sessionDateStr === yesterday.toDateString()) {
        groups['어제'].push(session);
      } else {
        groups['이전'].push(session);
      }
    });

    return groups;
  };

  // 채팅 세션 선택 핸들러
  const handleSelectChat = (session) => {
    console.log('선택된 채팅 세션:', session);
    onSelectChat(session.chatId, session);
    onClose();
  };

  // 채팅 세션 삭제
  const handleDeleteSession = (e, sessionId) => {
    e.stopPropagation();
    if (window.confirm('이 채팅을 삭제하시겠습니까?')) {
      const updatedSessions = chatSessions.filter(session => session.id !== sessionId);
      localStorage.setItem('chatSessions', JSON.stringify(updatedSessions));
      setChatSessions(updatedSessions);
    }
  };

  // 제목 생성 (파일명 또는 첫 번째 메시지)
  const generateTitle = (session) => {
    // 저장된 title이 있으면 사용
    if (session.title) {
      return session.title;
    }
    
    // fileName이 있으면 APK 파일 분석 형식으로 생성
    if (session.fileName) {
      return `${session.fileName} 파일의 악성 코드 분석`;
    }
    
    // 그 외의 경우 첫 번째 메시지 사용
    if (session.messages && session.messages.length > 0) {
      const firstUserMessage = session.messages.find(msg => msg.isUser);
      if (firstUserMessage) {
        return firstUserMessage.text.length > 30 
          ? firstUserMessage.text.substring(0, 30) + '...' 
          : firstUserMessage.text;
      }
    }
    
    return '새 채팅';
  };

  // 시간 포맷팅
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ko-KR', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  const groupedSessions = groupSessionsByDate(chatSessions);

  return (
    <div 
      className="position-fixed top-0 start-0 h-100 bg-light shadow-lg"
      style={{ 
        width: '300px', 
        zIndex: 1000, 
        overflowY: 'auto',
        transform: 'translateX(0)',
        transition: 'transform 0.3s ease'
      }}
    >
      {/* 헤더 */}
      <div className="d-flex justify-content-between align-items-center p-3 bg-primary text-white">
        <h5 className="mb-0 fw-bold">채팅 기록</h5>
        <Button 
          variant="link" 
          className="text-white p-0 border-0"
          onClick={onClose}
          style={{ fontSize: '20px' }}
        >
          <FaTimes />
        </Button>
      </div>

      {/* 채팅 목록 */}
      <div className="p-2">
        {chatSessions.length === 0 ? (
          <div className="text-center text-muted p-4">
            <FaComment size={48} className="mb-3 opacity-50" />
            <p>저장된 채팅이 없습니다.</p>
          </div>
        ) : (
          Object.entries(groupedSessions).map(([dateGroup, sessions]) => {
            if (sessions.length === 0) return null;
            
            return (
              <div key={dateGroup} className="mb-3">
                {/* 날짜 그룹 헤더 */}
                <div className="bg-secondary bg-opacity-10 px-3 py-2 rounded">
                  <small className="fw-bold text-muted">{dateGroup}</small>
                </div>
                
                {/* 채팅 세션 목록 */}
                <ListGroup variant="flush">
                  {sessions.map((session) => (
                    <ListGroup.Item
                      key={session.id}
                      action
                      onClick={() => handleSelectChat(session)}
                      className="d-flex justify-content-between align-items-start py-3 border-0 border-bottom"
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="flex-grow-1 me-2">
                        <div className="d-flex align-items-center mb-1">
                          {session.fileName && (
                            <FaFile className="text-primary me-2" size={14} />
                          )}
                          <h6 className="mb-0 text-truncate" style={{ fontSize: '14px' }}>
                            {generateTitle(session)}
                          </h6>
                        </div>
                        <div className="d-flex justify-content-between align-items-center">
                          <small className="text-muted">
                            {formatTime(session.lastUpdated)}
                          </small>
                          {session.messageCount > 0 && (
                            <Badge bg="secondary" pill>
                              {session.messageCount}
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={(e) => handleDeleteSession(e, session.id)}
                        className="ms-2 border-0"
                        style={{ fontSize: '12px' }}
                      >
                        <FaTimes />
                      </Button>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default ChatList;

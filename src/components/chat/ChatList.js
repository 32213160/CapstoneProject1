// src/components/chat/ChatList.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ListGroup, Button, Badge } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaTimes, FaFile, FaComment } from 'react-icons/fa';
import ChatService from '../../services/ChatService';
import { useAuth } from '../auth/AuthContext';

function ChatList({ onSelectChat, onClose, currentChatId }) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [chatSessions, setChatSessions] = useState([]);
  const [deletingSessionId, setDeletingSessionId] = useState(null);

  // 로컬 저장소에서 채팅 세션 불러오기
  useEffect(() => {
    if (isAuthenticated) {
      // 로그인 시: 서버에서 세션 조회
      ChatService.fetchUserChatSessions()
        .then(sessions => setChatSessions(sessions))
        .catch(() => setChatSessions([]));
    } else {
      // 비로그인 시: 로컬스토리지에서 세션 조회
      const local = JSON.parse(localStorage.getItem('chatSessions') || '[]');
      setChatSessions(local);
    }
  }, [isAuthenticated]); // 로그인 상태 변경 시 다시 실행

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

  // 세션 목록 다시 불러오기
  const reloadChatSessions = async () => {
    if (isAuthenticated) {
      // 로그인 시: 서버에서 세션 조회
      try {
        const sessions = await ChatService.fetchUserChatSessions();
        setChatSessions(sessions);
      } catch (error) {
        console.log('[폴백] 서버에서 세션 목록을 가져올 수 없어 로컬스토리지를 사용합니다.');
        const local = JSON.parse(localStorage.getItem('chatSessions') || '[]');
        setChatSessions(local);
      }
    } else {
      // 비로그인 시: 로컬스토리지에서 세션 조회
      const local = JSON.parse(localStorage.getItem('chatSessions') || '[]');
      setChatSessions(local);
    }
  };

  // 채팅 세션 삭제
  const handleDeleteSession = async (e, sessionId) => {
    e.stopPropagation();
    
    if (deletingSessionId) return; // 중복 클릭 방지
    
    if (!window.confirm('이 채팅을 삭제하시겠습니까?')) {
      return;
    }

    setDeletingSessionId(sessionId);

    try {
      if (isAuthenticated) {
        // 로그인 상태: 서버에 DELETE 요청
        const BASE_URL = 'https://torytestsv.kro.kr';
        const response = await fetch(`${BASE_URL}/api/chats-of-user/session/${sessionId}`, {
          method: 'DELETE',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`서버 응답 오류: ${response.status}`);
        }

        console.log('[성공] 서버에서 세션 삭제 완료:', sessionId);

        // 현재 세션이면 홈으로 이동
        if (sessionId === currentChatId) {
          navigate('/');
          onClose();
        }

        // 세션 목록 다시 불러오기
        await reloadChatSessions();
      } else {
        // 비로그인 상태: 로컬스토리지에서 삭제
        console.log('[로컬스토리지] 비로그인 상태로 로컬에서 세션 삭제:', sessionId);
        const updatedSessions = chatSessions.filter(session => session.id !== sessionId);
        localStorage.setItem('chatSessions', JSON.stringify(updatedSessions));
        setChatSessions(updatedSessions);

        // 현재 세션이면 홈으로 이동
        if (sessionId === currentChatId) {
          navigate('/');
          onClose();
        }
      }
    } catch (error) {
      console.error('[오류] 세션 삭제 실패:', error);
      
      // 재시도 확인
      const retry = window.confirm(
        '세션 삭제에 실패했습니다.\n다시 시도하시겠습니까?'
      );
      
      if (retry) {
        setDeletingSessionId(null);
        handleDeleteSession(e, sessionId);
      }
    } finally {
      setDeletingSessionId(null);
    }
  };

  // 제목 생성 (파일명 또는 첫 번째 메시지)
  const generateTitle = (session, maxLength = 25) => {
    let title = '';

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

    // 모든 제목에 글자수 제한 적용
    return title.length > maxLength
      ? title.substring(0, maxLength) + '...'
      : title;
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
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1050
      }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded shadow-lg"
        style={{
          width: '90%',
          maxWidth: '500px',
          maxHeight: '80vh',
          display: 'flex',
          flexDirection: 'column'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
          <h5 className="mb-0">채팅 목록</h5>
          <Button
            variant="link"
            onClick={onClose}
            className="text-dark p-0"
            style={{ fontSize: '1.5rem' }}
          >
            <FaTimes />
          </Button>
        </div>

        {/* 본문 */}
        <div style={{ overflowY: 'auto', flex: 1 }} className="p-3">
          {chatSessions.length === 0 ? (
            <p className="text-center text-muted">저장된 채팅이 없습니다.</p>
          ) : (
            Object.entries(groupedSessions).map(([group, sessions]) =>
              sessions.length > 0 ? (
                <div key={group} className="mb-3">
                  <h6 className="text-muted mb-2">{group}</h6>
                  <ListGroup>
                    {sessions.map((session) => (
                      <ListGroup.Item
                        key={session.id || session.chatId}
                        action
                        onClick={() => handleSelectChat(session)}
                        className="d-flex justify-content-between align-items-center"
                        style={{
                          cursor: 'pointer',
                          backgroundColor:
                            session.chatId === currentChatId ? '#e3f2fd' : 'white'
                        }}
                      >
                        <div className="d-flex align-items-center" style={{ flex: 1 }}>
                          {session.fileName ? (
                            <FaFile className="me-2 text-primary" />
                          ) : (
                            <FaComment className="me-2 text-secondary" />
                          )}
                          <div style={{ flex: 1 }}>
                            <div className="fw-bold text-truncate">
                              {generateTitle(session)}
                            </div>
                            <small className="text-muted">
                              {formatTime(session.lastUpdated)}
                            </small>
                          </div>
                        </div>
                        <div className="d-flex align-items-center">
                          {session.messageCount > 0 && (
                            <Badge bg="secondary" className="me-2">
                              {session.messageCount}
                            </Badge>
                          )}
                          <Button
                            variant="link"
                            size="sm"
                            className="text-danger p-0"
                            onClick={(e) => handleDeleteSession(e, session.id || session.chatId)}
                            disabled={deletingSessionId === (session.id || session.chatId)}
                          >
                            <FaTimes />
                          </Button>
                        </div>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                </div>
              ) : null
            )
          )}
        </div>
      </div>
    </div>
  );
}

export default ChatList;

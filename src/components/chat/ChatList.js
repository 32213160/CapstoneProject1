// src/components/chat/ChatList.js
import React, { useState, useEffect } from 'react';
import { ListGroup, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaTimes, FaFile, FaComment } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
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
        .catch(error => {
          console.error('[ChatList] 서버에서 세션 조회 실패, 로컬스토리지로 폴백:', error);
          const local = JSON.parse(localStorage.getItem('chatSessions') || '[]');
          setChatSessions(local);
        });
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

  // 서버에서 세션 목록 다시 불러오기
  const reloadChatSessions = async () => {
    if (isAuthenticated) {
      try {
        console.log('[ChatList] 서버에서 세션 목록 다시 불러오기...');
        const sessions = await ChatService.fetchUserChatSessions();
        setChatSessions(sessions);
        console.log('[ChatList] 세션 목록 업데이트 완료:', sessions.length);
      } catch (error) {
        console.error('[ChatList] 서버에서 세션 조회 실패, 로컬스토리지로 폴백:', error);
        const local = JSON.parse(localStorage.getItem('chatSessions') || '[]');
        setChatSessions(local);
      }
    } else {
      const local = JSON.parse(localStorage.getItem('chatSessions') || '[]');
      setChatSessions(local);
    }
  };

  // 채팅 세션 삭제
  const handleDeleteSession = async (e, sessionId) => {
    e.stopPropagation();

    if (!window.confirm('이 채팅을 삭제하시겠습니까?')) {
      return;
    }

    setDeletingSessionId(sessionId);

    try {
      if (isAuthenticated) {
        // 로그인 상태: 서버 API 호출
        console.log('[ChatList] 서버에서 세션 삭제 요청:', sessionId);
        
        const BASE_URL = 'https://torytestsv.kro.kr';
        const response = await fetch(`${BASE_URL}/api/chats-of-user/session/${sessionId}`, {
          method: 'DELETE',
          credentials: 'include',
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('[ChatList] 서버 삭제 오류:', errorText);
          throw new Error(`서버 삭제 실패 (상태 코드: ${response.status})`);
        }

        console.log('[ChatList] 서버에서 세션 삭제 완료:', sessionId);
      } else {
        // 비로그인 상태: 로컬스토리지에서 삭제
        console.log('[ChatList] 로컬스토리지에서 세션 삭제:', sessionId);
        const updatedSessions = chatSessions.filter(session => session.id !== sessionId && session.chatId !== sessionId);
        localStorage.setItem('chatSessions', JSON.stringify(updatedSessions));
        setChatSessions(updatedSessions);
      }

      // 삭제 후 목록 업데이트
      if (isAuthenticated) {
        // 로그인 상태: 서버에서 다시 조회
        await reloadChatSessions();
      }

      // 현재 세션이 삭제된 경우 홈으로 이동
      if (currentChatId === sessionId) {
        console.log('[ChatList] 현재 세션 삭제됨 - 홈으로 이동');
        onClose();
        navigate('/');
      }
    } catch (error) {
      console.error('[ChatList] 세션 삭제 중 오류 발생:', error);
      
      // 사용자에게 오류 메시지 표시
      const retryConfirm = window.confirm(
        `세션 삭제에 실패했습니다: ${error.message}\n\n다시 시도하시겠습니까?`
      );

      if (retryConfirm) {
        // 사용자가 재시도 선택 시 재귀적으로 호출
        setDeletingSessionId(null);
        handleDeleteSession(e, sessionId);
      } else {
        setDeletingSessionId(null);
      }
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
    return title.length > maxLength ? title.substring(0, maxLength) + '...' : title;
  };

  // 시간 포맷팅
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  const groupedSessions = groupSessionsByDate(chatSessions);

  return (
    <div className="chat-list-container" style={{ maxHeight: '600px', overflowY: 'auto' }}>
      {Object.keys(groupedSessions).map(dateGroup => {
        const sessions = groupedSessions[dateGroup];
        if (sessions.length === 0) return null;

        return (
          <div key={dateGroup} className="mb-3">
            <h6 className="text-muted ps-3 mb-2" style={{ fontSize: '0.85rem' }}>
              {dateGroup}
            </h6>
            <ListGroup variant="flush">
              {sessions.map(session => (
                <ListGroup.Item
                  key={session.id || session.chatId}
                  className="d-flex justify-content-between align-items-center p-3"
                  style={{
                    backgroundColor: currentChatId === session.chatId ? '#f8f9fa' : 'transparent',
                    borderLeft: currentChatId === session.chatId ? '4px solid #007bff' : 'none',
                    cursor: 'pointer'
                  }}
                  onClick={() => handleSelectChat(session)}
                >
                  <div className="flex-grow-1 min-width-0">
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <FaFile size={14} className="text-secondary" />
                      <span className="fw-500" style={{ fontSize: '0.95rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {generateTitle(session)}
                      </span>
                    </div>
                    <div className="d-flex align-items-center gap-2" style={{ fontSize: '0.8rem' }}>
                      <FaComment size={12} className="text-muted" />
                      <span className="text-muted">{session.messageCount || 0}개 메시지</span>
                      <span className="text-muted ms-2">{formatTime(session.lastUpdated)}</span>
                    </div>
                  </div>
                  <Button
                    variant="link"
                    size="sm"
                    className="p-0 text-danger ms-2"
                    onClick={(e) => handleDeleteSession(e, session.id || session.chatId)}
                    disabled={deletingSessionId === (session.id || session.chatId)}
                    style={{ cursor: deletingSessionId === (session.id || session.chatId) ? 'not-allowed' : 'pointer' }}
                  >
                    <FaTimes size={16} />
                  </Button>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </div>
        );
      })}

      {chatSessions.length === 0 && (
        <div className="text-center text-muted py-5">
          저장된 채팅이 없습니다.
        </div>
      )}
    </div>
  );
}

export default ChatList;
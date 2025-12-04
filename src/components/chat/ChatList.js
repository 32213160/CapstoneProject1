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
        
        console.log(`[DEBUG] DELETE 요청 시작: ${BASE_URL}/api/chats-of-user/session/${sessionId}`);

        const response = await fetch(
          `${BASE_URL}/api/chats-of-user/session/${sessionId}`,
          {
            method: 'DELETE',
            credentials: 'include',
            // ⚠️ CORS 프리플라이트 회피: 기본 헤더만 사용
            headers: {
              'Accept': 'application/json',
            },
          }
        );

        console.log(`[DEBUG] 응답 상태: ${response.status}`);

        if (!response.ok) {
          throw new Error(
            `서버 응답 오류: ${response.status} ${response.statusText}`
          );
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
        const updatedSessions = chatSessions.filter(
          (session) => session.id !== sessionId
        );
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

    // 저장된 title이 있으면 사용하되 maxLength로 제한
    if (session.title) {
      title = session.title;
      return title.length > maxLength ? title.substring(0, maxLength) + '...' : title;
    }

    // fileName이 있으면 APK 파일 분석 형식으로 생성
    if (session.fileName) {
      return title.length > maxLength ? title.substring(0, maxLength) + '...' : title;
    }

    // 그 외의 경우 첫 번째 메시지 사용
    if (session.messages && session.messages.length > 0) {
      const firstUserMessage = session.messages.find(msg => msg.isUser);
      if (firstUserMessage) {
        return firstUserMessage.text.length > maxLength
          ? firstUserMessage.text.substring(0, maxLength) + '...'
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

  // 현재 세션인지 확인
  const isCurrentSession = (sessionId) => {
    return currentChatId === sessionId || 
          currentChatId === `session_${sessionId}` ||
          sessionId === currentChatId;
  };

  const groupedSessions = groupSessionsByDate(chatSessions);


  /* ====================  UI  ==================== */
  return (
    <div
      className="chat-list-container position-fixed top-0 start-0 h-100 bg-light shadow-lg"
      style={{
        width: '350px', 
        zIndex: 1000, 
        overflowY: 'auto',
        transform: 'translateX(0)',
        transition: 'transform 0.3s ease'
      }}
    >
      {/* 헤더 영역 */}
      <div className="chat-list-header d-flex justify-content-between align-items-center p-4 bg-primary text-white">
        <h5 className="mb-0 fw-bold">채팅 목록</h5>
        <Button
          variant="link"  // ??
          className="d-flex align-items-center text-white p-0 border-0"
          onClick={onClose}
          style={{ fontSize: '20px' }}
        >
          <FaTimes />
        </Button>
      </div>

      {/* 채팅 목록 */}
      <div className="chat-list-content p-0">
        {chatSessions.length === 0 ? (
          <div className="text-center text-muted p-4">
            <FaComment size={48} className="mb-3 opacity-50" />
            <p>저장된 채팅이 없습니다.</p>
          </div>
        ) : (
          Object.entries(groupedSessions).map(([group, sessions]) =>
            sessions.length > 0 ? (
              <div key={group} className="mb-3">
                {/* 그룹 제목 */}
                <div className="d-flex align-items-center bg-opacity-10 px-3 py-2 rounded">
                  <small className="fw-bold text-muted">{group}</small>
                  <Badge className="mx-3 bg-secondary" pill>
                    {sessions.length}
                  </Badge>
                </div>

                {/* 채팅 세션 목록 */}
                <ListGroup variant="flush">
                  {sessions.map((session) => (
                    <ListGroup.Item
                      as="div"
                      key={session.id}
                      action
                      onClick={() => handleSelectChat(session)}
                      style={{
                        cursor: 'pointer',
                        marginBottom: '4px',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0'
                      }}
                      className={`chat-list-item list-group-item-action p-3 ${
                        isCurrentSession(session.chatId) ? 'bg-primary text-white' : ''
                      }`}
                    >
                      <div className="d-flex justify-content-between w-100">
                        <div className="d-flex">
                          {/* 아이콘: 파일/일반 채팅 구분 */}
                          <span className={`d-flex align-items-center mx-1 ${
                            isCurrentSession(session.chatId) ? 'text-white' : 'text-primary'
                          }`}>
                            {session.fileName ? <FaFile /> : <FaComment />}
                          </span>
                          {/* 세션 제목, 타임스탬프 */}
                          <div className="mx-2">
                            <h6
                              className={`mb-0 ${isCurrentSession(session.chatId) ? 'text-white' : ''}`}
                              style={{
                                fontSize: '14px',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}
                              title={generateTitle(session, 100)}
                            >
                              {generateTitle(session)}
                            </h6>
                            <div className="mb-0">
                              <small className={isCurrentSession(session.chatId) ? 'text-white-50' : 'text-muted'}>
                                {formatTime(session.lastUpdated)}
                              </small>
                            </div>
                          </div>
                        </div>
                        {/* 삭제 버튼 */}
                        <Button
                          variant={isCurrentSession(session.chatId) ? 'light' : 'outline-danger'}
                          size="sm"
                          onClick={(e) => handleDeleteSession(e, session.id)}
                          disabled={deletingSessionId === session.id}
                          className="border-0"
                          style={{ fontSize: '12px' }}
                        >
                          <FaTimes />{deletingSessionId === session.id ? '삭제 중...' : ''}
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
  );
}

export default ChatList;
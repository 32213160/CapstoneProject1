// src/services/ChatService.js

import { sendChatMessage } from './ApiService';
import { loadChatSessionFromStorage, updateChatSession } from '../utils/helpers/ChatHelpers';

/**
 * 채팅 관련 비즈니스 로직을 처리하는 서비스
 * ✅ CORS 에러 수정
 * ✅ 에러 처리 강화
 * ✅ API 명세 준수
 */
class ChatService {
  /**
   * 로그인한 사용자의 채팅 세션 목록 불러오기
   * GET /api/chats-of-user/my-sessions
   */
  static async fetchUserChatSessions() {
    const BASE_URL = 'https://torytestsv.kro.kr';
    try {
      console.log('[디버깅] ChatService: 세션 목록 가져오기 시작');
      
      const response = await fetch(`${BASE_URL}/api/chats-of-user/my-sessions`, {
        method: 'GET',
        credentials: 'include', // 세션 쿠키 포함 (필수!)
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const text = await response.text();
        console.error('[디버깅] ChatService: 서버 응답 오류:', response.status, text);
        
        if (response.status === 401) {
          console.warn('[디버깅] ChatService: 미인증 상태 - 다시 로그인 필요');
        }
        
        throw new Error(`채팅 세션 목록을 불러올 수 없습니다. (상태 코드: ${response.status})`);
      }

      const data = await response.json();
      console.log('[디버깅] ChatService: 서버 응답 데이터:', data);

      // 각 세션 형식을 ChatList에서 사용할 수 있도록 변환
      const sessions = (data.chatSessions || []).map(session => ({
        id: session.sessionId,
        chatId: session.sessionId,
        sessionId: session.sessionId,
        title: session.fileName ? `${session.fileName} 파일의 악성 코드 분석` : '채팅 세션',
        fileName: session.fileName,
        lastUpdated: session.lastUpdated || new Date().toISOString(),
        createdAt: session.createdAt || new Date().toISOString(),
        messageCount: session.messageCount || 0,
      }));

      console.log('[디버깅] ChatService: 변환된 세션 목록:', sessions);
      return sessions;
      
    } catch (error) {
      console.error('[디버깅] ChatService fetchUserChatSessions 오류:', error.message);
      throw error;
    }
  }

  /**
   * 로그인 상태 확인
   * GET /api/auth/status
   */
  static async checkAuthStatus() {
    const BASE_URL = 'https://torytestsv.kro.kr';
    try {
      console.log('[디버깅] ChatService: 로그인 상태 확인 시작');
      
      const response = await fetch(`${BASE_URL}/api/auth/status`, {
        method: 'GET',
        credentials: 'include' // 세션 쿠키 포함
      });

      const data = await response.json();
      console.log('[디버깅] ChatService: 로그인 상태 확인 결과:', data);
      
      return data.authenticated === true;
      
    } catch (error) {
      console.error('[디버깅] ChatService: 로그인 상태 확인 오류:', error.message);
      return false;
    }
  }

  /**
   * 특정 세션의 모든 메시지 가져오기
   * GET /api/chats-of-user/session/{sessionId}
   * 
   * ✅ CORS 에러 수정
   * ✅ headers 괄호 추가
   * ✅ sessionId 검증
   * ✅ 에러 상태별 처리
   */
  static async fetchChatMessages(sessionId) {
    const BASE_URL = 'https://torytestsv.kro.kr';
    
    try {
      // sessionId 검증
      if (!sessionId) {
        console.warn('[디버깅] ChatService: sessionId가 없습니다');
        return [];
      }

      console.log('[디버깅] ChatService: 메시지 가져오기 시작 -', sessionId);

      const response = await fetch(`${BASE_URL}/api/chats-of-user/session/${sessionId}`, {
        method: 'GET',
        credentials: 'include', // 세션 쿠키 포함 (필수! 인증된 사용자만 접근 가능)
        headers: {
          'Content-Type': 'application/json'
        } // ✅ 닫히는 괄호 추가됨
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[디버깅] ChatService: 서버 응답 오류:', response.status, errorText);

        // 에러 상태별 처리
        if (response.status === 401) {
          console.error('[디버깅] ChatService: 미인증 상태 (401) - 다시 로그인 필요');
          return [];
        } else if (response.status === 403) {
          console.error('[디버깅] ChatService: 접근 권한 없음 (403)');
          return [];
        } else if (response.status === 404) {
          console.error('[디버깅] ChatService: 세션을 찾을 수 없음 (404)');
          return [];
        }

        throw new Error(`서버 에러: ${response.status}`);
      }

      const data = await response.json();
      console.log('[디버깅] ChatService: 메시지 가져오기 성공:', data.messages?.length || 0, '개');

      // API 명세 준수: messages 배열 반환
      return data.messages || [];

    } catch (error) {
      console.error('[디버깅] ChatService fetchChatMessages 오류:', error.message);

      // CORS 에러 상세 표시
      if (error.message.includes('CORS') || error.message.includes('Failed to fetch')) {
        console.error('[디버깅] CORS 에러 발생 - 백엔드 CORS 설정 확인 필요');
        console.error('[디버깅] 프론트엔드 도메인: https://mango-beach-064c5c800.3.azurestaticapps.net');
        console.error('[디버깅] 백엔드 도메인: https://torytestsv.kro.kr');
      }

      return [];
    }
  }

  /**
   * localStorage에서 채팅 세션 가져오기
   */
  static getChatSession(chatId) {
    return loadChatSessionFromStorage(chatId);
  }

  /**
   * 채팅 세션 저장
   */
  static saveChatSession(chatId, messageData, headerTitle, initialFile, analysisResult) {
    updateChatSession(chatId, messageData, headerTitle, initialFile, analysisResult);
  }

  /**
   * 채팅 메시지 전송 및 응답 처리
   */
  static async sendMessage(chatId, message) {
    try {
      console.log('ChatService: 메시지 전송 시작', { chatId, message });
      
      const response = await sendChatMessage(chatId, message);

      // 응답 처리
      const responseText = response?.answer || response?.response || response?.message;
      
      if (!responseText) {
        throw new Error('서버로부터 응답을 받지 못했습니다.');
      }

      console.log('ChatService: 메시지 전송 완료', responseText);
      return responseText;
      
    } catch (error) {
      console.error('ChatService: 메시지 전송 실패', error);
      throw new Error(`메시지 전송 중 오류가 발생했습니다: ${error.message}`);
    }
  }

  /**
   * 채팅 히스토리 조회
   */
  static getChatHistory() {
    try {
      return JSON.parse(localStorage.getItem('chatSessions') || '[]');
    } catch (error) {
      console.error('채팅 히스토리 로드 실패:', error);
      return [];
    }
  }

  /**
   * 채팅 히스토리 전체 삭제
   */
  static clearChatHistory() {
    try {
      localStorage.removeItem('chatSessions');
      localStorage.removeItem('chatSessionData');
    } catch (error) {
      console.error('채팅 히스토리 삭제 실패:', error);
    }
  }

  /**
   * 특정 채팅 세션 삭제
   */
  static deleteChatSession(chatId) {
    try {
      const sessions = this.getChatHistory();
      const updatedSessions = sessions.filter(session => session.chatId !== chatId);
      localStorage.setItem('chatSessions', JSON.stringify(updatedSessions));
      return true;
    } catch (error) {
      console.error('채팅 세션 삭제 실패:', error);
      return false;
    }
  }
}

export default ChatService;
export const fetchChatMessages = ChatService.fetchChatMessages;
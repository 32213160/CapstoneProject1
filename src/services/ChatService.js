// src/services/ChatService.js

import { sendChatMessage } from './ApiService';
import { loadChatSessionFromStorage, updateChatSession } from '../utils/helpers/ChatHelpers';

/**
 * 채팅 관련 비즈니스 로직을 처리하는 서비스 (수정된 버전)
 */
class ChatService {
  /* 로그인한 사용자의 채팅 세션 목록 불러오기 */
  static async fetchUserChatSessions() {
    const BASE_URL = '';
    try {
      console.log('[디버깅] ChatService: 세션 목록 가져오기 시작');
      const response = await fetch(`${BASE_URL}/api/chats-of-user/my-sessions`, {
        method: 'GET',
        credentials: 'include', // 세션 쿠키 포함
      });

      if (!response.ok) {
        const text = await response.text(); // 서버 오류 응답 체크용
        console.error('[디버깅] ChatService: 서버 응답 오류:', text);
        throw new Error(`채팅 세션 목록을 불러올 수 없습니다. (상태 코드: ${response.status})`);
      }

      const data = await response.json();
      console.log('[디버깅] ChatService: 서버 응답 데이터:', data);
      
      // 서버 응답 형식: { chatSessions: [...] }
      // 각 세션 형식을 ChatList에서 사용할 수 있도록 변환
      const sessions = (data.chatSessions || []).map(session => ({
        id: session.sessionId,
        chatId: session.sessionId, // sessionId를 chatId로 사용
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
      console.error('[디버깅] ChatService fetchUserChatSessions 오류:', error);
      throw error;
    }
  }

  /* 로그인 상태 확인 */
  static async checkAuthStatus() {
    const BASE_URL = '';
    try {
      console.log('[디버깅] ChatService: 로그인 상태 확인 시작');
      const response = await fetch(`${BASE_URL}/api/auth/status`, {
        method: 'GET',
        credentials: 'include'
      });
      const data = await response.json();
      console.log('[디버깅] ChatService: 로그인 상태 확인 결과:', data);
      return data.authenticated === true;
    } catch (error) {
      console.error('[디버깅] ChatService: 로그인 상태 확인 오류:', error);
      return false;
    }
  }

  static getChatSession(chatId) {
    return loadChatSessionFromStorage(chatId);
  }

  /* 채팅 세션 관리 */
  static getChatSession(chatId) {
    return loadChatSessionFromStorage(chatId);
  }

  static saveChatSession(chatId, messageData, headerTitle, initialFile, analysisResult) {
    updateChatSession(chatId, messageData, headerTitle, initialFile, analysisResult);
  }

  /* 채팅 메시지 전송 및 응답 처리 */
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

  /* 채팅 히스토리 관리 */
  static getChatHistory() {
    try {
      return JSON.parse(localStorage.getItem('chatSessions') || '[]');
    } catch (error) {
      console.error('채팅 히스토리 로드 실패:', error);
      return [];
    }
  }

  static clearChatHistory() {
    try {
      localStorage.removeItem('chatSessions');
      localStorage.removeItem('chatSessionData');
    } catch (error) {
      console.error('채팅 히스토리 삭제 실패:', error);
    }
  }

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

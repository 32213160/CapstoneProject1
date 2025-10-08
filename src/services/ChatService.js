// src/services/ChatService.js
import { sendChatMessage } from './ApiService';
import { loadChatSessionFromStorage, updateChatSession } from '../utils/helpers/ChatHelpers';

/**
 * 채팅 관련 비즈니스 로직을 처리하는 서비스 (수정된 버전)
 */
class ChatService {
  /**
   * 채팅 세션 관리
   */
  static getChatSession(chatId) {
    return loadChatSessionFromStorage(chatId);
  }

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
   * 채팅 히스토리 관리
   */
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

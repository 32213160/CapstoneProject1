// src/utils/helpers/ChatHelpers.js

/**
 * 채팅 관련 유틸리티 함수들
 */

/**
 * 랜덤 채팅 ID 생성
 */
export const generateRandomChatId = () => {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * 로컬 스토리지에서 채팅 세션 로드
 */
export const loadChatSessionFromStorage = (targetChatId) => {
  try {
    const sessions = JSON.parse(localStorage.getItem('chatSessions') || '[]');
    const session = sessions.find(s => s.chatId === targetChatId);
    return session;
  } catch (error) {
    console.error('채팅 세션 로드 실패:', error);
    return null;
  }
};

/**
 * 채팅 세션을 로컬 스토리지에 업데이트
 */
export const updateChatSession = (chatId, newMessage, headerTitle, initialFile, analysisResult) => {
  try {
    const sessions = JSON.parse(localStorage.getItem('chatSessions') || '[]');
    const sessionIndex = sessions.findIndex(session => session.chatId === chatId);

    if (sessionIndex >= 0) {
      // 기존 세션 업데이트
      sessions[sessionIndex].messages.push(newMessage);
      sessions[sessionIndex].messageCount = sessions[sessionIndex].messages.length;
      sessions[sessionIndex].lastUpdated = new Date().toISOString();
      
      if (headerTitle) {
        sessions[sessionIndex].title = headerTitle;
      }
      
      localStorage.setItem('chatSessions', JSON.stringify(sessions));
      console.log('채팅 세션 업데이트됨:', chatId);
    } else {
      // 새 세션 생성
      const newSession = {
        id: chatId,
        chatId: chatId,
        title: headerTitle || `${initialFile?.name || 'Unknown'} 파일의 악성 코드 분석`,
        fileName: initialFile?.name || null,
        fileSize: initialFile?.size || 0,
        analysisResult: analysisResult,
        messages: [newMessage],
        messageCount: 1,
        lastUpdated: new Date().toISOString(),
        createdAt: new Date().toISOString()
      };
      
      sessions.unshift(newSession);
      localStorage.setItem('chatSessions', JSON.stringify(sessions));
      console.log('새 채팅 세션 생성됨:', chatId);
    }
  } catch (error) {
    console.error('채팅 세션 업데이트 실패:', error);
  }
};

/**
 * 사용자 메시지 객체 생성
 */
export const createUserMessage = (text, fileName = null) => ({
  isUser: true,
  text: text,
  file: fileName,
  timestamp: new Date().toISOString()
});

/**
 * AI 메시지 객체 생성
 */
export const createAiMessage = (text, isLoading = false) => ({
  isUser: false,
  text: text,
  isLoading: isLoading,
  timestamp: new Date().toISOString()
});

/**
 * 로딩 메시지 객체 생성
 */
export const createLoadingMessage = (text = "처리 중입니다...") => ({
  isUser: false,
  text: text,
  isLoading: true,
  timestamp: new Date().toISOString()
});

/**
 * 메시지 목록에서 로딩 메시지 제거
 */
export const removeLoadingMessages = (messages) => {
  return messages.filter(msg => !msg.isLoading);
};

/**
 * 입력값 유효성 검증
 */
export const validateInput = (text, selectedFile, loading, maxLength = 3000) => {
  if (loading) {
    return { isValid: false, message: '처리 중입니다.' };
  }

  if (!selectedFile && text.trim().length === 0) {
    return { isValid: false, message: '메시지를 입력하거나 파일을 선택해주세요.' };
  }

  if (text.length > maxLength) {
    return { isValid: false, message: `글자수는 최대 ${maxLength}자까지 입력 가능합니다.` };
  }

  return { isValid: true };
};

// src/services/ChatResponseService.js
import { sendChatMessage } from './ApiService';
import { parseMalwareAnalysisResponse, formatAnalysisMessage } from '../utils/parsers/MalwareAnalysisParser';
import { parseForDisplay, checkVariableExists, getVariableValue } from '../utils/parsers/ApiResponseParser';

/**
 * 채팅 응답 처리 전용 서비스
 */
class ChatResponseService {
  /**
   * GET API 응답을 파싱하여 화면 표시용 데이터로 변환
   */
  static parseApiResponse(response) {
    try {
      console.log('=== ChatResponseService: API 응답 파싱 시작 ===');
      console.log('원본 응답:', response);

      // 새로운 파서 사용
      const parsedResult = parseForDisplay(response);
      
      if (parsedResult) {
        console.log('=== ChatResponseService: 파싱 완료 ===');
        console.log('파싱된 결과:', parsedResult);
        return parsedResult;
      }

      // 기존 파서로 폴백
      const fallbackResult = parseMalwareAnalysisResponse(response);
      console.log('기존 파서 사용:', fallbackResult);
      return fallbackResult;

    } catch (error) {
      console.error('ChatResponseService: 파싱 오류:', error);
      return null;
    }
  }

  /**
   * 사용자 질문 처리 (변수 조회 또는 챗봇 응답)
   */
  static async handleUserQuestion(question, parsedData, chatId) {
    try {
      const trimmedQuestion = question.trim();

      // 변수명 체크
      if (checkVariableExists(trimmedQuestion, parsedData)) {
        const variableValue = getVariableValue(trimmedQuestion, parsedData);
        return variableValue !== null 
          ? `${trimmedQuestion}: ${variableValue}` 
          : `변수 '${trimmedQuestion}'의 값을 찾을 수 없습니다.`;
      }

      // 챗봇 API 호출
      if (chatId) {
        console.log('챗봇 API 호출:', { id: chatId, message: trimmedQuestion });
        const chatResponse = await sendChatMessage(chatId, trimmedQuestion);
        console.log('챗봇 응답:', chatResponse);
        
        // 다양한 응답 형식 처리
        return chatResponse?.answer || 
               chatResponse?.response || 
               chatResponse?.message || 
               '응답을 받지 못했습니다.';
      } else {
        return `채팅을 위해서는 먼저 파일을 분석해야 합니다. 다음 변수들을 조회할 수 있습니다: vtId, vtScanId, vtMaliciousCount, fileName, fileSize, md5, sha256, llmReport 등`;
      }
    } catch (error) {
      console.error('ChatResponseService: 질문 처리 오류:', error);
      throw error;
    }
  }

  /**
   * 분석 결과로부터 AI 응답 메시지 생성
   */
  static generateAiResponseMessage(analysisResult, preGeneratedReport = null) {
    try {
      if (preGeneratedReport && preGeneratedReport.trim()) {
        console.log('미리 생성된 리포트 사용');
        return preGeneratedReport;
      }

      // 새로운 API 응답 형식에서 LLM 리포트 추출
      const llmReport = analysisResult?.analysisResult?.reportfromLLM?.report;
      if (llmReport && llmReport.trim()) {
        console.log('LLM 리포트 사용');
        return llmReport;
      }

      // 기존 형식에서 LLM 리포트 추출
      const directLlmReport = analysisResult?.reportfromLLM?.report;
      if (directLlmReport && directLlmReport.trim()) {
        console.log('직접 LLM 리포트 사용');
        return directLlmReport;
      }

      // 기존 파서 사용
      const parsed = parseMalwareAnalysisResponse(analysisResult);
      const formattedMsg = formatAnalysisMessage(parsed);
      
      if (formattedMsg && formattedMsg !== '분석 결과를 파싱할 수 없습니다.') {
        return formattedMsg;
      }

      // 새로운 파서로 파싱된 데이터를 JSON으로 표시
      const newParsed = this.parseApiResponse(analysisResult);
      if (newParsed) {
        return `파일 분석이 완료되었습니다.\n\n파싱 결과:\n${JSON.stringify(newParsed, null, 2)}`;
      }

      // 마지막으로 원본 데이터 표시
      return `파일 분석이 완료되었습니다.\n\n원본 결과:\n${JSON.stringify(analysisResult, null, 2)}`;

    } catch (error) {
      console.error('AI 응답 메시지 생성 오류:', error);
      return `파일 분석이 완료되었습니다.\n\n원본 결과:\n${JSON.stringify(analysisResult, null, 2)}`;
    }
  }
}

export default ChatResponseService;

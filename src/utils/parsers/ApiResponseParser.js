// src/utils/parsers/ApiResponseParser.js
/**
 * API 응답 전용 파서
 * 새로운 GET API 응답 형식을 처리하는 전용 파서
 */

/**
 * 새로운 API 응답 형식 파싱
 * {
 *   "sessionId": "session_778e2d85e5a8d3f9",
 *   "fileName": "advchange.exe",
 *   "analysisResult": {
 *     "reportfromVT": { ... },
 *     "reportfromLLM": { ... }
 *   },
 *   "extractedId": null
 * }
 */
export const parseNewApiResponse = (response) => {
  try {
    console.log('=== parseNewApiResponse 시작 ===');
    console.log('원본 응답:', response);

    // 새로운 응답 형식 체크
    if (response.sessionId && response.analysisResult) {
      const analysisResult = response.analysisResult;
      const reportVT = analysisResult.reportfromVT || {};
      const reportLLM = analysisResult.reportfromLLM || {};
      
      return {
        sessionId: response.sessionId,
        fileName: response.fileName,
        vtReport: reportVT,
        llmReport: reportLLM,
        extractedId: response.extractedId,
        vtData: reportVT.data || {},
        vtId: reportVT._id || null,
        llmId: reportLLM._id || null,
        llmReportText: reportLLM.report || '',
        rawResponse: response
      };
    }

    // 기존 형식 (reportfromVT가 직접 있는 경우)
    if (response.reportfromVT || response.reportfromLLM) {
      return {
        sessionId: null,
        fileName: response.fileName || 'Unknown File',
        vtReport: response.reportfromVT || {},
        llmReport: response.reportfromLLM || {},
        extractedId: response.extractedId,
        vtData: response.reportfromVT?.data || {},
        vtId: response.reportfromVT?._id || null,
        llmId: response.reportfromLLM?._id || null,
        llmReportText: response.reportfromLLM?.report || '',
        rawResponse: response
      };
    }

    console.warn('알 수 없는 API 응답 형식:', response);
    return null;

  } catch (error) {
    console.error('parseNewApiResponse 오류:', error);
    return null;
  }
};

/**
 * VirusTotal 데이터 파싱
 */
export const parseVirusTotalData = (vtData) => {
  try {
    const attributes = vtData.attributes || {};
    const lastAnalysisStats = attributes.lastAnalysisStats || {};
    const lastAnalysisResults = attributes.lastAnalysisResults || {};

    // 엔진별 탐지 결과
    const maliciousEngines = lastAnalysisResults 
      ? Object.entries(lastAnalysisResults)
          .filter(([engine, result]) => result.category === 'malicious')
          .map(([engine, result]) => ({ engine, result: result.result }))
      : [];

    const suspiciousEngines = lastAnalysisResults 
      ? Object.entries(lastAnalysisResults)
          .filter(([engine, result]) => result.category === 'suspicious')
          .map(([engine, result]) => ({ engine, result: result.result }))
      : [];

    const totalEngines = lastAnalysisResults ? Object.keys(lastAnalysisResults).length : 0;

    return {
      fileSize: attributes.size || 0,
      fileType: attributes.type_description || '',
      md5: attributes.md5 || vtData.id_SHA256 || '',
      sha1: attributes.sha1 || '',
      sha256: attributes.sha256 || vtData.id_SHA256 || '',
      vtMaliciousCount: lastAnalysisStats.malicious || 0,
      vtSuspiciousCount: lastAnalysisStats.suspicious || 0,
      vtUndetectedCount: lastAnalysisStats.undetected || 0,
      vtHarmlessCount: lastAnalysisStats.harmless || 0,
      vtTimeoutCount: lastAnalysisStats.timeout || 0,
      vtFailureCount: lastAnalysisStats.failure || 0,
      vtTypeUnsupportedCount: lastAnalysisStats.typeUnsupported || 0,
      vtTotalEngines: totalEngines,
      vtDetectionRate: `${lastAnalysisStats.malicious || 0}/${totalEngines}`,
      vtMaliciousEngines: maliciousEngines,
      vtSuspiciousEngines: suspiciousEngines,
      vtMaliciousEnginesList: maliciousEngines.map(e => e.engine).join(', '),
      vtSuspiciousEnginesList: suspiciousEngines.map(e => e.engine).join(', ')
    };
  } catch (error) {
    console.error('parseVirusTotalData 오류:', error);
    return {};
  }
};

/**
 * 통합 API 응답 파싱 (화면 표시용)
 */
export const parseForDisplay = (response) => {
  try {
    const parsedResponse = parseNewApiResponse(response);
    if (!parsedResponse) return null;

    const vtParsed = parseVirusTotalData(parsedResponse.vtData);
    
    const result = {
      // 기본 정보
      sessionId: parsedResponse.sessionId,
      fileName: parsedResponse.fileName,
      vtChatId: parsedResponse.vtId,
      llmId: parsedResponse.llmId,
      extractedId: parsedResponse.extractedId,
      
      // VirusTotal 정보
      ...vtParsed,
      
      // LLM 리포트
      llmReport: parsedResponse.llmReportText,
      
      // 기타
      analysisDate: new Date().toISOString(),
      rawResponse: response
    };

    console.log('=== parseForDisplay 완료 ===');
    console.log('파싱된 결과:', result);

    return result;
  } catch (error) {
    console.error('parseForDisplay 오류:', error);
    return null;
  }
};

/**
 * 변수 존재 여부 체크
 */
export const checkVariableExists = (variableName, parsedData) => {
  if (!parsedData || !variableName) return false;
  
  const availableVariables = [
    'sessionId', 'fileName', 'vtChatId', 'llmId', 'extractedId',
    'fileSize', 'fileType', 'md5', 'sha1', 'sha256',
    'vtMaliciousCount', 'vtSuspiciousCount', 'vtUndetectedCount', 'vtHarmlessCount',
    'vtTimeoutCount', 'vtFailureCount', 'vtTypeUnsupportedCount', 'vtTotalEngines',
    'vtDetectionRate', 'vtMaliciousEnginesList', 'vtSuspiciousEnginesList',
    'llmReport', 'analysisDate'
  ];
  
  return availableVariables.includes(variableName) && parsedData.hasOwnProperty(variableName);
};

/**
 * 변수명으로 값 조회
 */
export const getVariableValue = (variableName, parsedData) => {
  if (!parsedData || !variableName) return null;
  
  // 직접 속성 접근
  if (parsedData.hasOwnProperty(variableName)) {
    const value = parsedData[variableName];
    
    // 객체나 배열은 JSON 문자열로 변환
    if (typeof value === 'object' && value !== null) {
      return JSON.stringify(value, null, 2);
    }
    
    return value;
  }
  
  return null;
};

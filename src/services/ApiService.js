// src/services/ApiService.js

const API_BASE_URL = 'http://54.180.122.103:8080';

// 모든 스캔 결과 가져오기
export const fetchAllScanResults = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/json/scanresults`);
    if (!response.ok) {
      throw new Error('서버에서 데이터를 가져오는데 실패했습니다');
    }
    return await response.json();
  } catch (error) {
    console.error('스캔 결과 가져오기 오류:', error);
    throw error;
  }
};

// 특정 ID의 스캔 결과 가져오기
export const fetchScanResultById = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/json/scanresults/${id}`);
    if (!response.ok) throw new Error('서버에서 데이터를 가져오는데 실패했습니다');
    const responseData = await response.json();
    if (!responseData.data) throw new Error('서버에 데이터가 존재하지 않습니다');
    return responseData.data;
  } catch (error) {
    console.error('특정 스캔 결과 가져오기 오류:', error);
    throw error;
  }
};

// 파일 업로드 및 분석 결과 받기 - 개선된 에러 처리
export const uploadAndAnalyzeFile = async (file) => {
  try {
    console.log('파일 업로드 시작:', file.name, file.size, 'bytes');
    
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      body: formData,
    });

    console.log('서버 응답 상태:', response.status, response.statusText);

    // 응답 텍스트를 먼저 읽어서 로깅
    const responseText = await response.text();
    console.log('서버 응답 내용:', responseText);

    if (!response.ok) {
      // 서버에서 반환한 에러 메시지 파싱 시도
      let errorMessage = `서버 오류 (${response.status}): ${response.statusText}`;
      
      try {
        const errorData = JSON.parse(responseText);
        if (errorData.error) {
          errorMessage = errorData.error;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
      } catch (parseError) {
        // JSON 파싱 실패 시 원본 텍스트 사용
        if (responseText.trim()) {
          errorMessage = responseText;
        }
      }
      
      throw new Error(errorMessage);
    }

    try {
      // JSON 파싱
      const jsonData = JSON.parse(responseText);
      
      // 스캔 ID 추출 로직 (다양한 위치에서 ID 찾기)
      let scanKeyId = null;
      
      if (jsonData._id) {
        scanKeyId = jsonData._id;
      } else if (jsonData.scanId) {
        scanKeyId = jsonData.scanId;
      } else if (jsonData.reportfromVT && jsonData.reportfromVT._id) {
        scanKeyId = jsonData.reportfromVT._id;
      } else if (jsonData.reportfromVT && jsonData.reportfromVT.scan_id) {
        scanKeyId = jsonData.reportfromVT.scan_id;
      }

      console.log("파싱된 응답 데이터:", jsonData);
      console.log("추출된 스캔 ID:", scanKeyId);

      return {
        ...jsonData,
        extractedId: scanKeyId
      };

    } catch (parseError) {
      console.error('JSON 파싱 오류:', parseError);
      console.error('파싱 실패한 응답:', responseText);
      
      throw new Error(`응답 데이터 파싱 오류: ${parseError.message}`);
    }

  } catch (error) {
    console.error('파일 분석 요청 실패:', error);
    
    // 네트워크 오류와 서버 오류를 구분
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.');
    }
    
    throw error;
  }
};

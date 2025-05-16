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
    return responseData.data; // 실제 데이터 반환
  } catch (error) {
    console.error('특정 스캔 결과 가져오기 오류:', error);
    throw error;
  }
};

// 파일 업로드 및 분석 결과 받기
export const uploadAndAnalyzeFile = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    // API 엔드포인트 수정 - 서버 경로에 맞게 조정
    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const responseText = await response.text();
    
    try {
      // JSON 파싱
      const jsonData = JSON.parse(responseText);
      
      // 스캔 ID 추출 로직 (다양한 위치에서 ID 찾기)
      let scanKeyId = null;
      
      // 다양한 위치에서 ID 찾기
      if (jsonData._id) {
        scanKeyId = jsonData._id;
      } else if (jsonData.scanId) {
        scanKeyId = jsonData.scanId;
      } else if (jsonData.reportfromVT && jsonData.reportfromVT._id) {
        scanKeyId = jsonData.reportfromVT._id;
      } else if (jsonData.reportfromVT && jsonData.reportfromVT.scan_id) {
        scanKeyId = jsonData.reportfromVT.scan_id;
      }
      
      // Debugging: 응답 데이터 확인
      console.log("응답 데이터:", jsonData);
      console.log("응답 데이터 중 _ID:", scanKeyId);
      
      return {
        ...jsonData,
        extractedId: scanKeyId // ID를 명시적으로 포함
      };
    } catch (parseError) {
      console.error('JSON 파싱 오류:', parseError);
      // 원본 텍스트도 함께 반환하여 디버깅 용이하게
      return {
        error: '응답 데이터 파싱 오류',
        errorMessage: parseError.message,
        rawResponse: responseText
      };
    }
  } catch (error) {
    console.error('파일 분석 요청 실패:', error);
    throw error;
  }
};

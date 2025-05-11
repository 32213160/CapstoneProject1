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
    
    // data 필드 존재 여부 확인
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
    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) {
      throw new Error('파일 업로드에 실패했습니다');
    }
    return await response.json();
  } catch (error) {
    console.error('파일 업로드 오류:', error);
    throw error;
  }
};

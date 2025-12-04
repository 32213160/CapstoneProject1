// src/services/ApiService.js

const API_BASE_URL = 'https://torytestsv.kro.kr';

// 서버 연결 상태 확인
export const checkServerStatus = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/status`, {
      method: 'GET',
      credentials: 'include'
    });
    return response.ok;
  } catch (error) {
    console.error('서버 연결 확인 실패:', error);
    return false;
  }
};

// 로그인 API
export const login = async (username, password) => {
  try {
    console.log('로그인 요청:', { username, password: '***' });

    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
      credentials: 'include'
    });

    console.log('로그인 응답 상태:', response.status);

    const data = await response.json();
    console.log('로그인 응답 데이터:', data);

    if (!response.ok) {
      // 더 구체적인 에러 메시지 생성
      if (response.status === 401) {
        if (data.message && data.message.includes('Bad credentials')) {
          throw new Error('아이디 또는 비밀번호가 올바르지 않습니다. 계정이 존재하지 않을 수 있습니다.');
        }
        throw new Error('인증에 실패했습니다. 아이디와 비밀번호를 확인해주세요.');
      }
      throw new Error(data.message || data.error || `로그인 실패 (${response.status})`);
    }

    return data;
  } catch (error) {
    console.error('로그인 API 에러:', error);
    throw error;
  }
};

// 회원가입 API
export const register = async (username, password, email, name) => {
  try {
    console.log('회원가입 요청:', { username, email, name, password: '***' });

    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, email, name }),
      credentials: 'include'
    });

    console.log('회원가입 응답 상태:', response.status);
    const data = await response.json();
    console.log('회원가입 응답:', data);

    if (!response.ok) {
      if (response.status === 400) {
        throw new Error(data.error || '입력 정보를 확인해주세요.');
      }
      throw new Error(data.error || data.message || '회원가입 실패');
    }
    return data;
  } catch (error) {
    console.error('회원가입 API 에러:', error);
    throw error;
  }
};

// 로그아웃 API
export const logout = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include'
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || data.error || '로그아웃 실패');
    return data;
  } catch (error) {
    console.error('로그아웃 API 에러:', error);
    throw error;
  }
};

// 기존 다른 API 함수들은 그대로 유지...
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

export const sendChatMessage = async (id, message) => {
  try {
    console.log('채팅 메시지 전송:', { id, message });
    const url = `${API_BASE_URL}/api/chat?id=${encodeURIComponent(id)}&message=${encodeURIComponent(message)}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: new URLSearchParams({
        sessionId: id,
        message: message,
      })
    });

    console.log('채팅 서버 응답 상태:', response.status, response.statusText);
    const responseText = await response.text();
    console.log('채팅 서버 응답 내용:', responseText);

    if (!response.ok) {
      let errorMessage = `서버 오류 (${response.status}): ${response.statusText}`;
      try {
        const errorData = JSON.parse(responseText);
        if (errorData.error) {
          errorMessage = errorData.error;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
      } catch (parseError) {
        if (responseText.trim()) {
          errorMessage = responseText;
        }
      }
      throw new Error(errorMessage);
    }

    try {
      const jsonData = JSON.parse(responseText);
      console.log("채팅 응답 데이터:", jsonData);
      return jsonData;
    } catch (parseError) {
      console.error('채팅 응답 JSON 파싱 오류:', parseError);
      throw new Error(`응답 데이터 파싱 오류: ${parseError.message}`);
    }
  } catch (error) {
    console.error('채팅 메시지 전송 실패:', error);
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.');
    }
    throw error;
  }
};

export const uploadAndAnalyzeFile = async (file) => {
  try {
    console.log('파일 업로드 시작:', file.name, file.size, 'bytes');
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/api/upload`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });

    console.log('서버 응답 상태:', response.status, response.statusText);
    const responseText = await response.text();
    console.log('서버 응답 내용:', responseText);

    if (!response.ok) {
      let errorMessage = `서버 오류 (${response.status}): ${response.statusText}`;
      try {
        const errorData = JSON.parse(responseText);
        if (errorData.error) {
          errorMessage = errorData.error;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
      } catch (parseError) {
        if (responseText.trim()) {
          errorMessage = responseText;
        }
      }
      throw new Error(errorMessage);
    }

    try {
      const jsonData = JSON.parse(responseText);
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
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.');
    }
    throw error;
  }
};

export default API_BASE_URL;

// src/pages/TestPage.js

import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import TextFormatter from '../components/common/TextFormatter/TextFormatter';
import { useAuth } from '../components/auth/AuthContext';

export default function TestPage() {
  const BASE_URL = 'https://torytestsv.kro.kr';
  const { refreshAuthStatus } = useAuth(); // AuthContext hook

  // State for File Upload Analysis
  const [file, setFile] = useState(null);
  const [uploadResult, setUploadResult] = useState(null);

  // State for Chat
  const [sessionId, setSessionId] = useState('');
  const [message, setMessage] = useState('');
  const [chatResult, setChatResult] = useState(null);

  // State for User Sessions
  const [mySessions, setMySessions] = useState(null);
  const [sessionMessages, setSessionMessages] = useState(null);
  const [sessionIdToView, setSessionIdToView] = useState('');

  // State for Auth
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [registerData, setRegisterData] = useState({
    username: '',
    password: '',
    email: '',
    name: ''
  });
  const [authResult, setAuthResult] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [authStatus, setAuthStatus] = useState(null);

  // Error State
  const [error, setError] = useState(null);

  // State for Level Selection
  const [showLevelSelectModal, setShowLevelSelectModal] = useState(false);
  const [levelSetting, setLevelSetting] = useState(false);

  // 🔥 공통 헤더 생성 함수: localStorage의 세션 ID를 헤더에 포함
  const getAuthHeaders = () => {
    const headers = {};
    const storedSessionId = localStorage.getItem('serverSessionId');
    if (storedSessionId) {
      headers['X-Session-ID'] = storedSessionId;
      console.log('[디버깅] 요청 헤더에 X-Session-ID 추가:', storedSessionId);
    }
    return headers;
  };

  // === 10. Set User Level (POST) ===
  const handleSetLevel = async (level) => {
    setError(null);
    setLevelSetting(true);

    try {
      const response = await fetch(`${BASE_URL}/api/auth/setlevel?level=${level}`, {
        method: 'POST',
        headers: {
          ...getAuthHeaders() // 🔥 인증 헤더 추가
        },
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || '레벨 설정 실패');
        setLevelSetting(false);
        return;
      }

      setShowLevelSelectModal(false);
      alert(`레벨이 ${getLevelDisplayName(level)}(으)로 설정되었습니다.`);
      await handleGetUserInfo();
      setLevelSetting(false);
    } catch (err) {
      setError('레벨 설정 중 오류 발생: ' + err.message);
      setLevelSetting(false);
    }
  };

  const getLevelDisplayName = (level) => {
    const levelNames = {
      'novice': '초보자',
      'intermediate': '중급자',
      'expert': '전문가',
      'auto': '자동 조정'
    };
    return levelNames[level] || level;
  };

  // === 1. File Upload Analysis API ===
  const handleFileUpload = async () => {
    if (!file) {
      setError('파일을 선택해 주세요.');
      return;
    }

    setError(null);
    setUploadResult(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${BASE_URL}/api/upload`, {
        method: 'POST',
        headers: {
          ...getAuthHeaders() // 🔥 인증 헤더 추가
        },
        body: formData,
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || '파일 업로드 실패');
        return;
      }

      setUploadResult(data);
      setSessionId(data.sessionId);
    } catch (err) {
      setError('파일 업로드 중 오류 발생: ' + err.message);
    }
  };

  // === 2. Chat API ===
  const handleSendMessage = async () => {
    if (!sessionId || !message) {
      setError('세션 ID와 메시지를 입력해 주세요.');
      return;
    }

    setError(null);
    setChatResult(null);

    const formData = new FormData();
    formData.append('sessionId', sessionId);
    formData.append('message', message);

    try {
      const response = await fetch(`${BASE_URL}/api/chat`, {
        method: 'POST',
        headers: {
          ...getAuthHeaders() // 🔥 인증 헤더 추가
        },
        body: formData,
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || '채팅 전송 실패');
        return;
      }

      setChatResult(data);
    } catch (err) {
      setError('채팅 전송 중 오류 발생: ' + err.message);
    }
  };

  // === 3. Get My Sessions (GET) ===
  const handleGetMySessions = async () => {
    setError(null);
    setMySessions(null);

    try {
      const response = await fetch(`${BASE_URL}/api/chats-of-user/my-sessions`, {
        method: 'GET',
        headers: {
          ...getAuthHeaders() // 🔥 인증 헤더 추가
        },
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || '세션 목록 조회 실패');
        return;
      }

      setMySessions(data);
    } catch (err) {
      setError('세션 목록 조회 중 오류 발생: ' + err.message);
    }
  };

  // === 4. Get Session Messages (GET) ===
  const handleGetSessionMessages = async () => {
    if (!sessionIdToView) {
      setError('세션 ID를 입력해 주세요.');
      return;
    }

    setError(null);
    setSessionMessages(null);

    try {
      const response = await fetch(`${BASE_URL}/api/chats-of-user/session/${sessionIdToView}`, {
        method: 'GET',
        headers: {
          ...getAuthHeaders() // 🔥 인증 헤더 추가
        },
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || '메시지 조회 실패');
        return;
      }

      setSessionMessages(data);
    } catch (err) {
      setError('메시지 조회 중 오류 발생: ' + err.message);
    }
  };

  // === 5. Login API ===
  const handleLogin = async () => {
    if (!loginUsername || !loginPassword) {
      setError('사용자명과 비밀번호를 입력해 주세요.');
      return;
    }

    setError(null);
    setAuthResult(null);

    console.log('[디버깅] TestPage Login: 로그인 시도');
    console.log('[디버깅] TestPage Login: URL:', `${BASE_URL}/api/auth/login`);
    console.log('[디버깅] TestPage Login: 요청 body:', { username: loginUsername, password: '***' });

    try {
      const response = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: loginUsername,
          password: loginPassword
        }),
        credentials: 'include'
      });

      console.log('[디버깅] TestPage Login: 응답 상태:', response.status);
      console.log('[디버깅] TestPage Login: 응답 헤더 전체:', Object.fromEntries(response.headers.entries()));

      const data = await response.json();
      console.log('[디버깅] TestPage Login: 응답 데이터:', data);

      if (!response.ok) {
        setError(data.message || '로그인 실패');
        return;
      }

      // 🔥 세션 ID를 localStorage에 저장
      if (data.sessionId) {
        console.log('[디버깅] TestPage Login: sessionId 저장:', data.sessionId);
        localStorage.setItem('serverSessionId', data.sessionId);
      }

      setAuthResult(data);

      // 🔥 약간의 딜레이 후 인증 상태 확인
      setTimeout(async () => {
        await refreshAuthStatus();
        await handleGetAuthStatus();
        console.log('[디버깅] TestPage: 로그인 성공 후 AuthContext 업데이트 완료');
      }, 500);
    } catch (err) {
      console.error('[디버깅] TestPage Login: 에러:', err);
      setError('서버와 통신 중 오류가 발생했습니다: ' + err.message);
    }
  };

  // === 6. Register API ===
  const handleRegister = async () => {
    if (!registerData.username || !registerData.password || !registerData.email || !registerData.name) {
      setError('모든 필드를 입력해 주세요.');
      return;
    }

    setError(null);
    setAuthResult(null);

    try {
      const response = await fetch(`${BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(registerData),
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || '회원가입 실패');
        return;
      }

      setAuthResult(data);
    } catch (err) {
      setError('회원가입 중 오류 발생: ' + err.message);
    }
  };

  // === 7. Logout API ===
  const handleLogout = async () => {
    setError(null);
    setAuthResult(null);

    try {
      const response = await fetch(`${BASE_URL}/api/auth/logout`, {
        method: 'POST',
        headers: {
          ...getAuthHeaders() // 🔥 인증 헤더 추가
        },
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || '로그아웃 실패');
        return;
      }

      // 🔥 localStorage에서 세션 ID 제거
      localStorage.removeItem('serverSessionId');
      console.log('[디버깅] TestPage Logout: localStorage의 serverSessionId 삭제');

      setAuthResult(data);
      setUserInfo(null);
      setAuthStatus(null);
    } catch (err) {
      setError('로그아웃 중 오류 발생: ' + err.message);
    }
  };

  // === 8. Get Current User Info (GET) ===
  const handleGetUserInfo = async () => {
    setError(null);
    setUserInfo(null);

    try {
      const response = await fetch(`${BASE_URL}/api/auth/me`, {
        method: 'GET',
        headers: {
          ...getAuthHeaders() // 🔥 인증 헤더 추가
        },
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || '사용자 정보 조회 실패');
        return;
      }

      setUserInfo(data);
    } catch (err) {
      setError('사용자 정보 조회 중 오류 발생: ' + err.message);
    }
  };

  // === 9. Get Auth Status (GET) ===
  const handleGetAuthStatus = async () => {
    console.log('[디버깅] TestPage: 인증 상태 확인 버튼 클릭');
    console.log('[디버깅] TestPage: BASE_URL:', BASE_URL);

    // 🔥 localStorage에서 세션 ID 확인
    const storedSessionId = localStorage.getItem('serverSessionId');
    console.log('[디버깅] TestPage: localStorage의 serverSessionId:', storedSessionId || '없음');

    setError(null);
    setAuthStatus(null);

    try {
      console.log('[디버깅] TestPage: /api/auth/status 요청 시작');

      const response = await fetch(`${BASE_URL}/api/auth/status`, {
        method: 'GET',
        headers: {
          ...getAuthHeaders() // 🔥 인증 헤더 추가
        },
        credentials: 'include'
      });

      console.log('[디버깅] TestPage: 응답 상태 코드:', response.status);
      console.log('[디버깅] TestPage: 응답 헤더:', Object.fromEntries(response.headers.entries()));
      console.log('[디버깅] TestPage: ⚠️ Request Headers의 Cookie는 브라우저 개발자 도구 Network 탭에서 확인하세요');

      const data = await response.json();
      console.log('[디버깅] TestPage: 응답 데이터:', data);

      setAuthStatus(data);

      if (data.authenticated) {
        console.log('[디버깅] TestPage: ✅ 인증됨 - 사용자:', data.username);
      } else {
        console.log('[디버깅] TestPage: ❌ 인증 안됨');
        console.log('[디버깅] TestPage: 💡 쿠키가 설정되지 않았거나 만료되었을 수 있습니다.');
        console.log('[디버깅] TestPage: 💡 백엔드 서버의 Set-Cookie 헤더에 "SameSite=None; Secure" 속성이 필요합니다.');
        console.log('[디버깅] TestPage: 💡 또는 백엔드가 X-Session-ID 헤더를 읽도록 설정되어야 합니다.');
      }
    } catch (err) {
      console.error('[디버깅] TestPage: 에러 발생:', err);
      setError('서버와 통신 중 오류가 발생했습니다: ' + err.message);
    }
  };

  return (
    <div className="container my-5">
      <h1 className="mb-4 text-center">Backend API Test Page</h1>

      {/* Error Display */}
      {error && (
        <div className="alert alert-danger" role="alert">
          <strong>오류:</strong> {error}
        </div>
      )}

      {/* === Section 5: Login API === */}
      <section className="mb-5">
        <h2 className="mb-3">5. 로그인 (POST /api/auth/login)</h2>
        <div className="card">
          <div className="card-body">
            <div className="mb-3">
              <label htmlFor="loginUsername" className="form-label">사용자명</label>
              <input
                type="text"
                className="form-control"
                id="loginUsername"
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                placeholder="사용자명 입력"
              />
            </div>
            <div className="mb-3">
              <label htmlFor="loginPassword" className="form-label">비밀번호</label>
              <input
                type="password"
                className="form-control"
                id="loginPassword"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="비밀번호 입력"
              />
            </div>
            <button className="btn btn-primary" onClick={handleLogin}>
              로그인
            </button>
          </div>
        </div>
        {authResult && (
          <div className="alert alert-success mt-3" role="alert">
            <strong>로그인 결과:</strong>
            <pre className="mb-0">{JSON.stringify(authResult, null, 2)}</pre>
          </div>
        )}
      </section>

      {/* === Section 6: Register API === */}
      <section className="mb-5">
        <h2 className="mb-3">6. 회원가입 (POST /api/auth/register)</h2>
        <div className="card">
          <div className="card-body">
            <div className="mb-3">
              <label htmlFor="registerUsername" className="form-label">사용자명</label>
              <input
                type="text"
                className="form-control"
                id="registerUsername"
                value={registerData.username}
                onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                placeholder="사용자명 입력"
              />
            </div>
            <div className="mb-3">
              <label htmlFor="registerPassword" className="form-label">비밀번호</label>
              <input
                type="password"
                className="form-control"
                id="registerPassword"
                value={registerData.password}
                onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                placeholder="비밀번호 입력"
              />
            </div>
            <div className="mb-3">
              <label htmlFor="registerEmail" className="form-label">이메일</label>
              <input
                type="email"
                className="form-control"
                id="registerEmail"
                value={registerData.email}
                onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                placeholder="이메일 입력"
              />
            </div>
            <div className="mb-3">
              <label htmlFor="registerName" className="form-label">이름</label>
              <input
                type="text"
                className="form-control"
                id="registerName"
                value={registerData.name}
                onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                placeholder="이름 입력"
              />
            </div>
            <button className="btn btn-success" onClick={handleRegister}>
              회원가입
            </button>
          </div>
        </div>
      </section>

      {/* === Section 7: Logout API === */}
      <section className="mb-5">
        <h2 className="mb-3">7. 로그아웃 (POST /api/auth/logout)</h2>
        <div className="card">
          <div className="card-body">
            <button className="btn btn-warning" onClick={handleLogout}>
              로그아웃
            </button>
          </div>
        </div>
      </section>

      {/* === Section 8: Get Current User Info === */}
      <section className="mb-5">
        <h2 className="mb-3">8. 현재 사용자 정보 조회 (GET /api/auth/me)</h2>
        <div className="card">
          <div className="card-body">
            <button className="btn btn-info" onClick={handleGetUserInfo}>
              사용자 정보 조회
            </button>
          </div>
        </div>
        {userInfo && (
          <div className="alert alert-info mt-3" role="alert">
            <strong>사용자 정보:</strong>
            <pre className="mb-0">{JSON.stringify(userInfo, null, 2)}</pre>
          </div>
        )}
      </section>

      {/* === Section 10: Set User Level === */}
      <section className="mb-5">
        <h2 className="mb-3">10. 사용자 레벨 설정 (POST /api/auth/setlevel)</h2>
        <div className="card">
          <div className="card-body">
            <button 
              className="btn btn-secondary" 
              onClick={() => setShowLevelSelectModal(true)}
              disabled={levelSetting}
            >
              {levelSetting ? '설정 중...' : '레벨 선택'}
            </button>
          </div>
        </div>

        {/* Level Selection Modal */}
        {showLevelSelectModal && (
          <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">대화 난이도 선택</h5>
                  <button 
                    type="button" 
                    className="btn-close" 
                    onClick={() => setShowLevelSelectModal(false)}
                    disabled={levelSetting}
                  ></button>
                </div>
                <div className="modal-body">
                  <p className="text-muted">대화 난이도를 선택하세요. 선택한 레벨에 따라 AI의 응답 스타일이 조정됩니다.</p>
                  <div className="d-grid gap-2">
                    <button 
                      className="btn btn-outline-primary" 
                      onClick={() => handleSetLevel('novice')}
                      disabled={levelSetting}
                    >
                      초보자 (Novice)
                    </button>
                    <button 
                      className="btn btn-outline-success" 
                      onClick={() => handleSetLevel('intermediate')}
                      disabled={levelSetting}
                    >
                      중급자 (Intermediate)
                    </button>
                    <button 
                      className="btn btn-outline-warning" 
                      onClick={() => handleSetLevel('expert')}
                      disabled={levelSetting}
                    >
                      전문가 (Expert)
                    </button>
                    <button 
                      className="btn btn-outline-secondary" 
                      onClick={() => handleSetLevel('auto')}
                      disabled={levelSetting}
                    >
                      자동 조정 (Auto)
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* === Section 9: Get Auth Status === */}
      <section className="mb-5">
        <h2 className="mb-3">9. 인증 상태 확인 (GET /api/auth/status)</h2>
        <div className="card">
          <div className="card-body">
            <button className="btn btn-primary" onClick={handleGetAuthStatus}>
              인증 상태 확인
            </button>
          </div>
        </div>
        {authStatus && (
          <div className="alert alert-secondary mt-3" role="alert">
            <strong>인증 상태:</strong>
            <pre className="mb-0">{JSON.stringify(authStatus, null, 2)}</pre>
          </div>
        )}
      </section>

      {/* === Section 1: File Upload Analysis API === */}
      <section className="mb-5">
        <h2 className="mb-3">1. 파일 업로드 분석 (POST /api/upload)</h2>
        <div className="card">
          <div className="card-body">
            <div className="mb-3">
              <label htmlFor="fileInput" className="form-label">파일 선택</label>
              <input
                className="form-control"
                type="file"
                id="fileInput"
                onChange={(e) => setFile(e.target.files[0])}
              />
            </div>
            <button className="btn btn-primary" onClick={handleFileUpload}>
              파일 업로드
            </button>
          </div>
        </div>
        {uploadResult && (
          <div className="alert alert-success mt-3" role="alert">
            <strong>업로드 결과:</strong>
            {uploadResult.analysisResult && (
              <>
                <p className="mb-1"><strong>세션 ID:</strong> {uploadResult.sessionId}</p>
                <p className="mb-1"><strong>파일명:</strong> {uploadResult.fileName}</p>
                <p className="mb-1"><strong>VirusTotal 분석 ID:</strong> {uploadResult.analysisResult.reportfromVT.id}</p>
                <p className="mb-2"><strong>VirusTotal 결과:</strong></p>
                <pre className="bg-light p-2 rounded">
                  {JSON.stringify(uploadResult.analysisResult.reportfromVT.data.attributes, null, 2)}
                </pre>
                <p className="mb-1"><strong>LLM 분석 ID:</strong> {uploadResult.analysisResult.reportfromLLM.id}</p>
                <p className="mb-2"><strong>LLM 분석 결과:</strong></p>
                <div className="border p-3 rounded">
                  <TextFormatter text={uploadResult.analysisResult.reportfromLLM.data} />
                </div>
              </>
            )}
          </div>
        )}
      </section>

      {/* === Section 2: Chat API === */}
      <section className="mb-5">
        <h2 className="mb-3">2. 채팅 (POST /api/chat)</h2>
        <div className="card">
          <div className="card-body">
            <div className="mb-3">
              <label htmlFor="chatSessionId" className="form-label">세션 ID</label>
              <input
                type="text"
                className="form-control"
                id="chatSessionId"
                value={sessionId}
                onChange={(e) => setSessionId(e.target.value)}
                placeholder="세션 ID 입력"
              />
            </div>
            <div className="mb-3">
              <label htmlFor="chatMessage" className="form-label">메시지</label>
              <textarea
                className="form-control"
                id="chatMessage"
                rows="3"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="메시지 입력"
              ></textarea>
            </div>
            <button className="btn btn-primary" onClick={handleSendMessage}>
              메시지 전송
            </button>
          </div>
        </div>
        {chatResult && (
          <div className="alert alert-success mt-3" role="alert">
            <strong>채팅 결과:</strong>
            <p className="mb-1"><strong>세션 ID:</strong> {chatResult.sessionId}</p>
            <p className="mb-2"><strong>응답:</strong></p>
            <div className="border p-3 rounded">
              <TextFormatter text={chatResult.response} />
            </div>
          </div>
        )}
      </section>

      {/* === Section 3: Get My Sessions === */}
      <section className="mb-5">
        <h2 className="mb-3">3. 내 세션 목록 조회 (GET /api/chats-of-user/my-sessions)</h2>
        <div className="card">
          <div className="card-body">
            <button className="btn btn-info" onClick={handleGetMySessions}>
              세션 목록 조회
            </button>
          </div>
        </div>
        {mySessions && (
          <div className="alert alert-info mt-3" role="alert">
            <strong>세션 목록:</strong>
            <div className="table-responsive mt-2">
              <table className="table table-bordered">
                <thead>
                  <tr>
                    <th>세션 ID</th>
                    <th>파일명</th>
                    <th>생성 시간</th>
                    <th>수정 시간</th>
                  </tr>
                </thead>
                <tbody>
                  {mySessions.sessions && mySessions.sessions.map((session) => (
                    <tr key={session.sessionId}>
                      <td>{session.sessionId}</td>
                      <td>{session.fileName}</td>
                      <td>{new Date(session.createdAt).toLocaleString()}</td>
                      <td>{new Date(session.updatedAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {/* === Section 4: Get Session Messages === */}
      <section className="mb-5">
        <h2 className="mb-3">4. 세션 메시지 조회 (GET /api/chats-of-user/session/:sessionId)</h2>
        <div className="card">
          <div className="card-body">
            <div className="mb-3">
              <label htmlFor="viewSessionId" className="form-label">세션 ID</label>
              <input
                type="text"
                className="form-control"
                id="viewSessionId"
                value={sessionIdToView}
                onChange={(e) => setSessionIdToView(e.target.value)}
                placeholder="조회할 세션 ID 입력"
              />
            </div>
            <button className="btn btn-info" onClick={handleGetSessionMessages}>
              메시지 조회
            </button>
          </div>
        </div>
        {sessionMessages && (
          <div className="alert alert-info mt-3" role="alert">
            <strong>세션 메시지:</strong>
            <p className="mb-1"><strong>세션 ID:</strong> {sessionMessages.sessionId}</p>
            <p className="mb-1"><strong>파일명:</strong> {sessionMessages.fileName}</p>
            <p className="mb-2"><strong>메시지:</strong></p>
            <ul className="list-group">
              {sessionMessages.messages && sessionMessages.messages.map((msg, index) => (
                <li key={index} className="list-group-item">
                  <strong>{msg.role === 'user' ? '사용자' : 'AI'}:</strong>
                  <div className="mt-1">
                    <TextFormatter text={msg.content} />
                  </div>
                  <small className="text-muted">{new Date(msg.timestamp).toLocaleString()}</small>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </div>
  );
}

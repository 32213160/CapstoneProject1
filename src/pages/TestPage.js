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

  // === 10. Set User Level (POST) ===
  const handleSetLevel = async (level) => {
    setError(null);
    setLevelSetting(true);
    try {
      const response = await fetch(`${BASE_URL}/api/auth/setlevel?level=${level}`, {
        method: 'POST',
        mode: 'cors',
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
        mode: 'cors',
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
        mode: 'cors',
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
        mode: 'cors',
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
        mode: 'cors',
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
    console.log('[디버깅] TestPage Login: 현재 브라우저 쿠키:', document.cookie || '(없음)');

    try {
      const response = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        mode: 'cors',
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

      // 🔥 응답 후 브라우저 쿠키 확인
      console.log('[디버깅] TestPage Login: 로그인 후 브라우저 쿠키:', document.cookie || '(없음)');
      
      // 🔥 Set-Cookie 헤더 확인 (브라우저에서는 접근 불가, Network 탭에서 확인 필요)
      const setCookieHeader = response.headers.get('set-cookie');
      console.log('[디버깅] TestPage Login: Set-Cookie 헤더:', setCookieHeader || '(브라우저에서 접근 불가 - Network 탭 확인 필요)');

      // 🔥 세션 ID를 localStorage에 저장 (쿠키 대체 방안)
      if (data.sessionId) {
        console.log('[디버깅] TestPage Login: sessionId 저장:', data.sessionId);
        localStorage.setItem('serverSessionId', data.sessionId);
      }

      setAuthResult(data);

      // 🔥 약간의 딜레이 후 인증 상태 확인 (쿠키 설정 시간 고려)
      setTimeout(async () => {
        console.log('[디버깅] TestPage: 로그인 성공 후 쿠키 재확인:', document.cookie || '(없음)');
        await refreshAuthStatus();
        await handleGetAuthStatus(); // 즉시 상태 확인
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
        mode: 'cors',
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
        mode: 'cors',
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
      console.log('[디버깅] TestPage Logout: 로그아웃 후 브라우저 쿠키:', document.cookie || '(없음)');

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
        mode: 'cors',
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
    console.log('[디버깅] TestPage: 현재 브라우저 쿠키:', document.cookie || '(없음)');

    // 🔥 localStorage에서 세션 ID 확인
    const storedSessionId = localStorage.getItem('serverSessionId');
    console.log('[디버깅] TestPage: localStorage의 serverSessionId:', storedSessionId || '없음');

    setError(null);
    setAuthStatus(null);

    try {
      console.log('[디버깅] TestPage: /api/auth/status 요청 시작');
      
      const response = await fetch(`${BASE_URL}/api/auth/status`, {
        method: 'GET',
        mode: 'cors',
        credentials: 'include',
        cache: 'no-store'
      });

      console.log('[디버깅] TestPage: 응답 상태 코드:', response.status);
      console.log('[디버깅] TestPage: 응답 헤더:', Object.fromEntries(response.headers.entries()));

      // 🔥 Request Headers 확인 (브라우저 개발자 도구에서만 확인 가능)
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
        console.log('[디버깅] TestPage: 💡 백엔드 CORS 설정에서 Access-Control-Allow-Credentials: true 필요합니다.');
        console.log('[디버깅] TestPage: 💡 백엔드 CORS 설정에서 Access-Control-Allow-Origin은 명시적 도메인이어야 합니다 (와일드카드 불가).');
      }
    } catch (err) {
      console.error('[디버깅] TestPage: 에러 발생:', err);
      setError('서버와 통신 중 오류가 발생했습니다: ' + err.message);
    }
  };

  return (
    <div className="container my-5">
      <h1 className="text-center mb-5">Backend API Test Page</h1>

      {/* === Error Display === */}
      {error && (
        <div className="alert alert-danger" role="alert">
          <strong>오류:</strong> {error}
        </div>
      )}

      {/* === 1. File Upload Analysis === */}
      <div className="card mb-4">
        <div className="card-header bg-primary text-white">
          <h5 className="mb-0">1. File Upload Analysis (POST /api/upload)</h5>
        </div>
        <div className="card-body">
          <div className="mb-3">
            <label htmlFor="fileInput" className="form-label">파일 선택</label>
            <input
              type="file"
              className="form-control"
              id="fileInput"
              onChange={(e) => setFile(e.target.files[0])}
            />
          </div>
          <button className="btn btn-primary" onClick={handleFileUpload}>
            파일 업로드 및 분석
          </button>

          {uploadResult && (
            <div className="mt-3">
              <h6>분석 결과:</h6>
              {uploadResult.analysisResult && (
                <div>
                  <p><strong>세션 ID:</strong> {uploadResult.sessionId}</p>
                  <p><strong>파일명:</strong> {uploadResult.fileName}</p>

                  <p><strong>VirusTotal 분석 ID:</strong> {uploadResult.analysisResult.reportfromVT.id}</p>
                  <p><strong>VirusTotal 결과:</strong></p>
                  <pre className="bg-light p-2" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                    {JSON.stringify(uploadResult.analysisResult.reportfromVT.data.attributes, null, 2)}
                  </pre>

                  <p><strong>LLM 분석 ID:</strong> {uploadResult.analysisResult.reportfromLLM.id}</p>
                  <p><strong>LLM 분석 결과:</strong></p>
                  <div className="bg-light p-2" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    <TextFormatter text={uploadResult.analysisResult.reportfromLLM.content} />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* === 2. Chat === */}
      <div className="card mb-4">
        <div className="card-header bg-success text-white">
          <h5 className="mb-0">2. Chat (POST /api/chat)</h5>
        </div>
        <div className="card-body">
          <div className="mb-3">
            <label htmlFor="sessionIdInput" className="form-label">세션 ID</label>
            <input
              type="text"
              className="form-control"
              id="sessionIdInput"
              value={sessionId}
              onChange={(e) => setSessionId(e.target.value)}
              placeholder="세션 ID 입력"
            />
          </div>
          <div className="mb-3">
            <label htmlFor="messageInput" className="form-label">메시지</label>
            <textarea
              className="form-control"
              id="messageInput"
              rows="3"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="메시지 입력"
            ></textarea>
          </div>
          <button className="btn btn-success" onClick={handleSendMessage}>
            메시지 전송
          </button>

          {chatResult && (
            <div className="mt-3">
              <h6>채팅 응답:</h6>
              <p><strong>세션 ID:</strong> {chatResult.sessionId}</p>
              <p><strong>응답:</strong></p>
              <div className="bg-light p-2" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                <TextFormatter text={chatResult.response} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* === 3. Get My Sessions === */}
      <div className="card mb-4">
        <div className="card-header bg-info text-white">
          <h5 className="mb-0">3. Get My Sessions (GET /api/chats-of-user/my-sessions)</h5>
        </div>
        <div className="card-body">
          <button className="btn btn-info" onClick={handleGetMySessions}>
            내 세션 목록 조회
          </button>

          {mySessions && (
            <div className="mt-3">
              <h6>내 세션 목록:</h6>
              <div className="table-responsive" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>세션 ID</th>
                      <th>파일명</th>
                      <th>생성 시간</th>
                      <th>수정 시간</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mySessions.map((session, index) => (
                      <tr key={index}>
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
        </div>
      </div>

      {/* === 4. Get Session Messages === */}
      <div className="card mb-4">
        <div className="card-header bg-warning text-dark">
          <h5 className="mb-0">4. Get Session Messages (GET /api/chats-of-user/session/:sessionId)</h5>
        </div>
        <div className="card-body">
          <div className="mb-3">
            <label htmlFor="sessionIdToViewInput" className="form-label">세션 ID</label>
            <input
              type="text"
              className="form-control"
              id="sessionIdToViewInput"
              value={sessionIdToView}
              onChange={(e) => setSessionIdToView(e.target.value)}
              placeholder="세션 ID 입력"
            />
          </div>
          <button className="btn btn-warning" onClick={handleGetSessionMessages}>
            세션 메시지 조회
          </button>

          {sessionMessages && (
            <div className="mt-3">
              <h6>세션 메시지:</h6>
              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {sessionMessages.map((msg, index) => (
                  <div key={index} className="mb-3 p-2 border rounded">
                    <p><strong>발신자:</strong> {msg.sender}</p>
                    <p><strong>메시지:</strong></p>
                    <div className="bg-light p-2">
                      <TextFormatter text={msg.message} />
                    </div>
                    <small className="text-muted">{new Date(msg.timestamp).toLocaleString()}</small>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* === 5. Login === */}
      <div className="card mb-4">
        <div className="card-header bg-dark text-white">
          <h5 className="mb-0">5. Login (POST /api/auth/login)</h5>
        </div>
        <div className="card-body">
          <div className="mb-3">
            <label htmlFor="loginUsernameInput" className="form-label">사용자명</label>
            <input
              type="text"
              className="form-control"
              id="loginUsernameInput"
              value={loginUsername}
              onChange={(e) => setLoginUsername(e.target.value)}
              placeholder="사용자명 입력"
            />
          </div>
          <div className="mb-3">
            <label htmlFor="loginPasswordInput" className="form-label">비밀번호</label>
            <input
              type="password"
              className="form-control"
              id="loginPasswordInput"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              placeholder="비밀번호 입력"
            />
          </div>
          <button className="btn btn-dark" onClick={handleLogin}>
            로그인
          </button>

          {authResult && (
            <div className="mt-3">
              <h6>인증 결과:</h6>
              <pre className="bg-light p-2">{JSON.stringify(authResult, null, 2)}</pre>
            </div>
          )}
        </div>
      </div>

      {/* === 6. Register === */}
      <div className="card mb-4">
        <div className="card-header bg-secondary text-white">
          <h5 className="mb-0">6. Register (POST /api/auth/register)</h5>
        </div>
        <div className="card-body">
          <div className="mb-3">
            <label htmlFor="registerUsernameInput" className="form-label">사용자명</label>
            <input
              type="text"
              className="form-control"
              id="registerUsernameInput"
              value={registerData.username}
              onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
              placeholder="사용자명 입력"
            />
          </div>
          <div className="mb-3">
            <label htmlFor="registerPasswordInput" className="form-label">비밀번호</label>
            <input
              type="password"
              className="form-control"
              id="registerPasswordInput"
              value={registerData.password}
              onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
              placeholder="비밀번호 입력"
            />
          </div>
          <div className="mb-3">
            <label htmlFor="registerEmailInput" className="form-label">이메일</label>
            <input
              type="email"
              className="form-control"
              id="registerEmailInput"
              value={registerData.email}
              onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
              placeholder="이메일 입력"
            />
          </div>
          <div className="mb-3">
            <label htmlFor="registerNameInput" className="form-label">이름</label>
            <input
              type="text"
              className="form-control"
              id="registerNameInput"
              value={registerData.name}
              onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
              placeholder="이름 입력"
            />
          </div>
          <button className="btn btn-secondary" onClick={handleRegister}>
            회원가입
          </button>
        </div>
      </div>

      {/* === 7. Logout === */}
      <div className="card mb-4">
        <div className="card-header bg-danger text-white">
          <h5 className="mb-0">7. Logout (POST /api/auth/logout)</h5>
        </div>
        <div className="card-body">
          <button className="btn btn-danger" onClick={handleLogout}>
            로그아웃
          </button>
        </div>
      </div>

      {/* === 8. Get Current User Info === */}
      <div className="card mb-4">
        <div className="card-header" style={{ backgroundColor: '#6f42c1', color: 'white' }}>
          <h5 className="mb-0">8. Get Current User Info (GET /api/auth/me)</h5>
        </div>
        <div className="card-body">
          <button className="btn" style={{ backgroundColor: '#6f42c1', color: 'white' }} onClick={handleGetUserInfo}>
            사용자 정보 조회
          </button>

          {userInfo && (
            <div className="mt-3">
              <h6>사용자 정보:</h6>
              <pre className="bg-light p-2">{JSON.stringify(userInfo, null, 2)}</pre>
            </div>
          )}
        </div>
      </div>

      {/* === 9. Get Auth Status === */}
      <div className="card mb-4">
        <div className="card-header" style={{ backgroundColor: '#fd7e14', color: 'white' }}>
          <h5 className="mb-0">9. Get Auth Status (GET /api/auth/status)</h5>
        </div>
        <div className="card-body">
          <button className="btn" style={{ backgroundColor: '#fd7e14', color: 'white' }} onClick={handleGetAuthStatus}>
            인증 상태 확인
          </button>

          {authStatus && (
            <div className="mt-3">
              <h6>인증 상태:</h6>
              <pre className="bg-light p-2">{JSON.stringify(authStatus, null, 2)}</pre>
            </div>
          )}
        </div>
      </div>

      {/* === 10. Set User Level === */}
      <div className="card mb-4">
        <div className="card-header" style={{ backgroundColor: '#20c997', color: 'white' }}>
          <h5 className="mb-0">10. Set User Level (POST /api/auth/setlevel)</h5>
        </div>
        <div className="card-body">
          <p>대화 난이도를 선택하세요. 선택한 레벨에 따라 AI의 응답 스타일이 조정됩니다.</p>
          <button
            className="btn"
            style={{ backgroundColor: '#20c997', color: 'white' }}
            onClick={() => setShowLevelSelectModal(true)}
            disabled={levelSetting}
          >
            {levelSetting ? '처리 중...' : '레벨 설정'}
          </button>
        </div>
      </div>

      {/* === Level Selection Modal === */}
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
                <p>대화 난이도를 선택하세요. 선택한 레벨에 따라 AI의 응답 스타일이 조정됩니다.</p>
                <div className="d-grid gap-2">
                  <button
                    className="btn btn-outline-primary"
                    onClick={() => handleSetLevel('novice')}
                    disabled={levelSetting}
                  >
                    초보자
                  </button>
                  <button
                    className="btn btn-outline-success"
                    onClick={() => handleSetLevel('intermediate')}
                    disabled={levelSetting}
                  >
                    중급자
                  </button>
                  <button
                    className="btn btn-outline-danger"
                    onClick={() => handleSetLevel('expert')}
                    disabled={levelSetting}
                  >
                    전문가
                  </button>
                  <button
                    className="btn btn-outline-secondary"
                    onClick={() => handleSetLevel('auto')}
                    disabled={levelSetting}
                  >
                    자동 조정
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

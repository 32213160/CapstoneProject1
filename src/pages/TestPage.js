// src/pages/TestPage.js
import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import TextFormatter from '../components/common/TextFormatter/TextFormatter';

export default function TestPage() {
  const BASE_URL = '';

  // State for File Upload & Analysis
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
  const [registerData, setRegisterData] = useState({ username: '', password: '', email: '', name: '' });
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
        credentials: 'include'
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || '레벨 설정에 실패했습니다.');
        setLevelSetting(false);
        return;
      }
      setShowLevelSelectModal(false);
      alert(`레벨이 ${getLevelDisplayName(level)}(으)로 설정되었습니다.`);
      await handleGetUserInfo();
      setLevelSetting(false);
    } catch (err) {
      setError('서버와 통신 중 오류가 발생했습니다: ' + err.message);
      setLevelSetting(false);
    }
  };

  // 레벨 표시 이름 변환
  const getLevelDisplayName = (level) => {
    const levelNames = {
      'novice': '초보자',
      'intermediate': '중급자',
      'expert': '전문가',
      'auto': '자동 조정'
    };
    return levelNames[level] || level;
  };

  // === 1. File Upload & Analysis API ===
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
        body: formData,
        credentials: 'include'
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.message || '업로드 중 오류가 발생했습니다.');
        return;
      }
      setUploadResult(data);
      setSessionId(data.sessionId);
    } catch (err) {
      setError('서버와 통신 중 오류가 발생했습니다: ' + err.message);
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
        body: formData,
        credentials: 'include'
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.message || '채팅 처리 중 오류가 발생했습니다.');
        return;
      }
      setChatResult(data);
    } catch (err) {
      setError('서버와 통신 중 오류가 발생했습니다: ' + err.message);
    }
  };

  // === 3. Get My Sessions (GET) ===
  const handleGetMySessions = async () => {
    setError(null);
    setMySessions(null);
    try {
      const response = await fetch(`${BASE_URL}/api/chats-of-user/my-sessions`, {
        method: 'GET',
        credentials: 'include'
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || '세션 목록을 가져오는 중 오류가 발생했습니다.');
        return;
      }
      setMySessions(data);
    } catch (err) {
      setError('서버와 통신 중 오류가 발생했습니다: ' + err.message);
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
        credentials: 'include'
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || '세션 메시지를 가져오는 중 오류가 발생했습니다.');
        return;
      }
      setSessionMessages(data);
    } catch (err) {
      setError('서버와 통신 중 오류가 발생했습니다: ' + err.message);
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

    try {
      const response = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: loginUsername, password: loginPassword }),
        credentials: 'include'
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.message || '로그인 실패');
        return;
      }
      setAuthResult(data);
    } catch (err) {
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
        headers: { 'Content-Type': 'application/json' },
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
      setError('서버와 통신 중 오류가 발생했습니다: ' + err.message);
    }
  };

  // === 7. Logout API ===
  const handleLogout = async () => {
    setError(null);
    setAuthResult(null);

    try {
      const response = await fetch(`${BASE_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.message || '로그아웃 실패');
        return;
      }
      setAuthResult(data);
      setUserInfo(null);
      setAuthStatus(null);
    } catch (err) {
      setError('서버와 통신 중 오류가 발생했습니다: ' + err.message);
    }
  };

  // === 8. Get Current User Info (GET) ===
  const handleGetUserInfo = async () => {
    setError(null);
    setUserInfo(null);

    try {
      const response = await fetch(`${BASE_URL}/api/auth/me`, {
        method: 'GET',
        credentials: 'include'
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || '사용자 정보를 가져오는 중 오류가 발생했습니다.');
        return;
      }
      setUserInfo(data);
    } catch (err) {
      setError('서버와 통신 중 오류가 발생했습니다: ' + err.message);
    }
  };

  // === 9. Get Auth Status (GET) ===
  const handleGetAuthStatus = async () => {
    setError(null);
    setAuthStatus(null);

    try {
      const response = await fetch(`${BASE_URL}/api/auth/status`, {
        method: 'GET',
        credentials: 'include'
      });
      const data = await response.json();
      setAuthStatus(data);
    } catch (err) {
      setError('서버와 통신 중 오류가 발생했습니다: ' + err.message);
    }
  };

  return (
    <div className="container-fluid p-4 bg-light" style={{ minHeight: '100vh' }}>
      {/* Error Alert */}
      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          <strong>오류:</strong> {error}
          <button type="button" className="btn-close" onClick={() => setError(null)} />
        </div>
      )}

      {/* ===== 1. Authentication Section ===== */}
      <div className="card mb-4">
        <div className="card-header bg-primary text-white">
          <h3>🔐 인증 (Authentication)</h3>
        </div>
        <div className="card-body">
          {/* Login */}
          <h5>1. 로그인</h5>
          <div className="row g-3 mb-3">
            <div className="col-md-5">
              <input
                type="text"
                className="form-control"
                placeholder="사용자명"
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
              />
            </div>
            <div className="col-md-5">
              <input
                type="password"
                className="form-control"
                placeholder="비밀번호"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
              />
            </div>
            <div className="col-md-2">
              <button className="btn btn-primary w-100" onClick={handleLogin}>
                로그인
              </button>
            </div>
          </div>

          {/* Register */}
          <h5>2. 회원가입</h5>
          <div className="row g-3 mb-3">
            <div className="col-md-3">
              <input
                type="text"
                className="form-control"
                placeholder="사용자명"
                value={registerData.username}
                onChange={(e) => setRegisterData({...registerData, username: e.target.value})}
              />
            </div>
            <div className="col-md-3">
              <input
                type="password"
                className="form-control"
                placeholder="비밀번호"
                value={registerData.password}
                onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
              />
            </div>
            <div className="col-md-3">
              <input
                type="email"
                className="form-control"
                placeholder="이메일"
                value={registerData.email}
                onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
              />
            </div>
            <div className="col-md-2">
              <input
                type="text"
                className="form-control"
                placeholder="이름"
                value={registerData.name}
                onChange={(e) => setRegisterData({...registerData, name: e.target.value})}
              />
            </div>
            <div className="col-md-1">
              <button className="btn btn-success w-100" onClick={handleRegister}>
                가입
              </button>
            </div>
          </div>

          {/* Other Auth Actions */}
          <div className="d-flex gap-2 mb-3">
            <button className="btn btn-warning" onClick={handleLogout}>로그아웃</button>
            <button className="btn btn-info" onClick={handleGetUserInfo}>내 정보 조회</button>
            <button className="btn btn-secondary" onClick={handleGetAuthStatus}>인증 상태 확인</button>
          </div>

          {/* Auth Result Display */}
          {authResult && (
            <div className="alert alert-success">
              <h6>인증 결과:</h6>
              <pre className="mb-0">{JSON.stringify(authResult, null, 2)}</pre>
            </div>
          )}

          {userInfo && (
            <div className="alert alert-info">
              <h6>사용자 정보:</h6>
              <div style={{ marginBottom: '12px', fontSize: '14px' }}>
                <strong>현재 레벨:</strong> {userInfo.user?.level ? getLevelDisplayName(userInfo.user.level) : '설정되지 않음'}
              </div>
              <button 
                type="button"
                className="btn btn-sm btn-warning mb-2" 
                onClick={() => setShowLevelSelectModal(true)}
              >
                레벨 선택
              </button>
              <pre className="mb-0">{JSON.stringify(userInfo, null, 2)}</pre>
            </div>
          )}

          {/* Level Selection Modal - 1번 섹션 내부에만 */}
          {showLevelSelectModal && (
            <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 1200, display: 'flex', justifyContent: 'center', alignItems: 'center' }} onClick={() => setShowLevelSelectModal(false)}>
              <div style={{ width: '400px', background: '#ffffff', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }} onClick={(e) => e.stopPropagation()}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h5 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>레벨 선택</h5>
                  <button type="button" onClick={() => setShowLevelSelectModal(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '20px' }}>
                    ✕
                  </button>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>
                    대화 난이도를 선택하세요.
                  </p>
                </div>

                <div>
                  <button 
                    type="button"
                    style={{ width: '100%', padding: '12px', marginBottom: '10px', borderRadius: '8px', border: '2px solid #e2e8f0', background: '#ffffff', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}
                    onClick={() => handleSetLevel('novice')}
                    disabled={levelSetting}
                  >
                    👶 초보자 - 기초적이고 쉬운 설명
                  </button>

                  <button 
                    type="button"
                    style={{ width: '100%', padding: '12px', marginBottom: '10px', borderRadius: '8px', border: '2px solid #e2e8f0', background: '#ffffff', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}
                    onClick={() => handleSetLevel('intermediate')}
                    disabled={levelSetting}
                  >
                    👨‍💼 중급자 - 균형잡힌 수준의 설명
                  </button>

                  <button 
                    type="button"
                    style={{ width: '100%', padding: '12px', marginBottom: '10px', borderRadius: '8px', border: '2px solid #e2e8f0', background: '#ffffff', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}
                    onClick={() => handleSetLevel('expert')}
                    disabled={levelSetting}
                  >
                    👨‍🔬 전문가 - 전문적이고 상세한 설명
                  </button>

                  <button 
                    type="button"
                    style={{ width: '100%', padding: '12px', marginBottom: '10px', borderRadius: '8px', border: '2px solid #e2e8f0', background: '#ffffff', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}
                    onClick={() => handleSetLevel('auto')}
                    disabled={levelSetting}
                  >
                    🤖 자동 조정 - 대화 내용에 따라 자동으로 조정
                  </button>
                </div>

                <div style={{ marginTop: '16px', textAlign: 'right' }}>
                  <button 
                    type="button"
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => setShowLevelSelectModal(false)}
                    disabled={levelSetting}
                  >
                    {levelSetting ? '설정 중...' : '취소'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {authStatus && (
            <div className="alert alert-secondary">
              <h6>인증 상태:</h6>
              <pre className="mb-0">{JSON.stringify(authStatus, null, 2)}</pre>
            </div>
          )}
        </div>
      </div>

      {/* ===== 2. File Upload Section ===== */}
      <div className="card mb-4">
        <div className="card-header bg-success text-white">
          <h3>📤 파일 업로드 및 분석</h3>
        </div>
        <div className="card-body">
          <div className="row g-3 mb-3">
            <div className="col-md-10">
              <input
                type="file"
                className="form-control"
                onChange={(e) => setFile(e.target.files[0])}
              />
            </div>
            <div className="col-md-2">
              <button className="btn btn-success w-100" onClick={handleFileUpload}>
                업로드
              </button>
            </div>
          </div>

          {uploadResult && (
            <div className="alert alert-success">
              <h6>업로드 결과:</h6>
              <p><strong>세션 ID:</strong> {uploadResult.sessionId}</p>

              {uploadResult.analysisResult && (
                <>
                  <p><strong>파일명:</strong> {uploadResult.fileName}</p>
                  <p><strong>VirusTotal ID:</strong> {uploadResult.analysisResult.reportfromVT._id}</p>
                  <p><strong>감지 결과:</strong></p>
                  <pre>{JSON.stringify(uploadResult.analysisResult.reportfromVT.data.attributes, null, 2)}</pre>
                  <p><strong>LLM 분석 ID:</strong> {uploadResult.analysisResult.reportfromLLM._id}</p>
                  <p><strong>분석 내용:</strong></p>
                  <TextFormatter text={uploadResult.analysisResult.reportfromLLM.report} />
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ===== 3. Chat Section ===== */}
      <div className="card mb-4">
        <div className="card-header bg-info text-white">
          <h3>💬 채팅</h3>
        </div>
        <div className="card-body">
          <div className="row g-3 mb-3">
            <div className="col-md-3">
              <input
                type="text"
                className="form-control"
                placeholder="세션 ID"
                value={sessionId}
                onChange={(e) => setSessionId(e.target.value)}
              />
            </div>
            <div className="col-md-7">
              <input
                type="text"
                className="form-control"
                placeholder="메시지 입력"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>
            <div className="col-md-2">
              <button className="btn btn-info w-100" onClick={handleSendMessage}>
                전송
              </button>
            </div>
          </div>

          {chatResult && (
            <div className="alert alert-info">
              <h6>채팅 결과:</h6>
              <p><strong>세션 ID:</strong> {chatResult.sessionId}</p>
              <p><strong>응답:</strong></p>
              <TextFormatter text={chatResult.response || chatResult['response: ']} />
            </div>
          )}
        </div>
      </div>

      {/* ===== 4. User Sessions Section ===== */}
      <div className="card mb-4">
        <div className="card-header bg-warning text-dark">
          <h3>📋 사용자 채팅 세션 관리</h3>
        </div>
        <div className="card-body">
          <button className="btn btn-warning mb-3" onClick={handleGetMySessions}>
            내 세션 조회
          </button>

          {mySessions?.chatSessions && mySessions.chatSessions.length > 0 && (
            <div>
              <h6>사용자명: {mySessions.username}</h6>
              <table className="table table-sm table-striped">
                <thead>
                  <tr>
                    <th>세션 ID</th>
                    <th>파일명</th>
                    <th>생성 시간</th>
                    <th>수정 시간</th>
                  </tr>
                </thead>
                <tbody>
                  {mySessions.chatSessions.map((session) => (
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
          )}

          {mySessions && mySessions.chatSessions?.length === 0 && (
            <div className="alert alert-info">세션이 없습니다.</div>
          )}

          <div className="row g-3 mt-3">
            <div className="col-md-10">
              <input
                type="text"
                className="form-control"
                placeholder="조회할 세션 ID"
                value={sessionIdToView}
                onChange={(e) => setSessionIdToView(e.target.value)}
              />
            </div>
            <div className="col-md-2">
              <button className="btn btn-warning w-100" onClick={handleGetSessionMessages}>
                메시지 조회
              </button>
            </div>
          </div>

          {sessionMessages && sessionMessages.messages && sessionMessages.messages.length > 0 && (
            <div className="mt-3">
              <h6>메시지 목록:</h6>
              {sessionMessages.messages.map((msg, idx) => (
                <div key={idx} className="p-2 border-bottom">
                  <strong>{msg.content}</strong> <small className="text-muted">유형: {msg.messageType}</small>
                </div>
              ))}
            </div>
          )}

          {sessionMessages && sessionMessages.messages?.length === 0 && (
            <div className="alert alert-info mt-3">메시지가 없습니다.</div>
          )}
        </div>
      </div>
    </div>
  );
}
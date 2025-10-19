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
      setSessionId(data.sessionId); // Auto-fill sessionId for chat
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
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: loginUsername,
          password: loginPassword
        }),
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
    <div className="container my-5">
      <h1 className="mb-4">백엔드 API 통합 테스트 페이지</h1>

      {/* Global Error Display */}
      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          <strong>오류:</strong> {error}
          <button type="button" className="btn-close" onClick={() => setError(null)}></button>
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
              <pre className="mb-0">{JSON.stringify(userInfo, null, 2)}</pre>
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
          <div className="mb-3">
            <label className="form-label">분석할 파일 선택</label>
            <input
              type="file"
              className="form-control"
              onChange={(e) => setFile(e.target.files[0])}
            />
          </div>
          <button className="btn btn-success" onClick={handleFileUpload}>
            파일 업로드 및 분석 시작
          </button>

          {uploadResult && (
            <div className="alert alert-success mt-3">
              <h5>분석 결과</h5>
              <p><strong>세션 ID:</strong> {uploadResult.sessionId}</p>
              <p><strong>파일명:</strong> {uploadResult.fileName}</p>
              
              {uploadResult.analysisResult && (
                <>
                  <hr />
                  <h6>VirusTotal 보고서</h6>
                  <p><strong>ID:</strong> {uploadResult.analysisResult.reportfromVT._id}</p>
                  <p><strong>ID(SHA256):</strong> {uploadResult.analysisResult.reportfromVT.data.id_SHA256}</p>
                  <p><strong>감지:</strong></p>
                  <pre style={{whiteSpace: 'pre-wrap', backgroundColor: '#f8f9fa', padding: '10px', borderRadius: '4px'}}>
                    {JSON.stringify(uploadResult.analysisResult.reportfromVT.data.attributes, null, 2)}
                  </pre>
                  
                  <hr />
                  <h6>LLM 분석</h6>
                  <p><strong>ID:</strong> {uploadResult.analysisResult.reportfromLLM._id}</p>
                  <p><strong>내용:</strong></p>
                  <p>{uploadResult.analysisResult.reportfromLLM.report}</p>
                </>
              )}
              
              <hr />
              <details>
                <summary className="btn btn-sm btn-outline-secondary">전체 응답 보기</summary>
                <pre className="mt-2">{JSON.stringify(uploadResult, null, 2)}</pre>
              </details>
            </div>
          )}
        </div>
      </div>

      {/* ===== 3. Chat Section ===== */}
      <div className="card mb-4">
        <div className="card-header bg-warning text-dark">
          <h3>💬 채팅</h3>
        </div>
        <div className="card-body">
          <div className="row g-3 mb-3">
            <div className="col-md-4">
              <label className="form-label">세션 ID</label>
              <input
                type="text"
                className="form-control"
                placeholder="세션 ID"
                value={sessionId}
                onChange={(e) => setSessionId(e.target.value)}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">메시지</label>
              <input
                type="text"
                className="form-control"
                placeholder="메시지 입력"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>
            <div className="col-md-2 d-flex align-items-end">
              <button className="btn btn-warning w-100" onClick={handleSendMessage}>
                전송
              </button>
            </div>
          </div>

          {chatResult && (
            <div className="alert alert-info">
              <h6>채팅 응답:</h6>
              <p><strong>세션 ID:</strong> {chatResult.sessionId}</p>
              <p><strong>응답:</strong> {chatResult['response: '] || chatResult.response}</p>
            </div>
          )}
        </div>
      </div>

      {/* ===== 4. User Sessions Section ===== */}
      <div className="card mb-4">
        <div className="card-header bg-info text-white">
          <h3>📋 사용자 채팅 세션 관리</h3>
        </div>
        <div className="card-body">
          {/* Get My Sessions */}
          <h5>1. 내 채팅 세션 목록 조회 (GET)</h5>
          <button className="btn btn-info mb-3" onClick={handleGetMySessions}>
            내 세션 목록 가져오기
          </button>

          {mySessions && (
            <div className="alert alert-success">
              <h6>내 채팅 세션 ({mySessions.totalChats}개)</h6>
              <p><strong>사용자명:</strong> {mySessions.username}</p>
              {mySessions.chatSessions && mySessions.chatSessions.length > 0 ? (
                <table className="table table-sm table-bordered">
                  <thead>
                    <tr>
                      <th>세션 ID</th>
                      <th>파일명</th>
                      <th>생성 시간</th>
                      <th>수정 시간</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mySessions.chatSessions.map((session, idx) => (
                      <tr key={idx}>
                        <td>{session.sessionId}</td>
                        <td>{session.fileName}</td>
                        <td>{new Date(session.createdAt).toLocaleString()}</td>
                        <td>{new Date(session.updatedAt).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>세션이 없습니다.</p>
              )}
            </div>
          )}

          <hr />

          {/* Get Session Messages */}
          <h5>2. 특정 세션 메시지 조회 (GET)</h5>
          <div className="row g-3 mb-3">
            <div className="col-md-8">
              <input
                type="text"
                className="form-control"
                placeholder="조회할 세션 ID"
                value={sessionIdToView}
                onChange={(e) => setSessionIdToView(e.target.value)}
              />
            </div>
            <div className="col-md-4">
              <button className="btn btn-info w-100" onClick={handleGetSessionMessages}>
                메시지 조회
              </button>
            </div>
          </div>

          {sessionMessages && (
            <div className="alert alert-primary">
              <h6>세션 메시지 (세션 ID: {sessionMessages.sessionId})</h6>
              {sessionMessages.messages && sessionMessages.messages.length > 0 ? (
                <div className="list-group">
                  {sessionMessages.messages.map((msg, idx) => (
                    <div key={idx} className="list-group-item">
                      <div className="d-flex w-100 justify-content-between">
                        <h6 className="mb-1">
                          {msg.sender === 'user' ? '👤 사용자' : 
                           msg.sender === 'assistant' ? '🤖 어시스턴트' : '⚙️ 시스템'}
                        </h6>
                        <small>{new Date(msg.timestamp).toLocaleString()}</small>
                      </div>
                      <p className="mb-1">{msg.content}</p>
                      <small className="text-muted">유형: {msg.messageType}</small>
                    </div>
                  ))}
                </div>
              ) : (
                <p>메시지가 없습니다.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

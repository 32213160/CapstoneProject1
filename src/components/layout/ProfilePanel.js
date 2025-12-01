// src/components/layout/ProfilePanel/ProfilePanel.js
import React from 'react';
import BaseComponent from '../../core/BaseComponent';
import { FaTimes, FaUser, FaCog, FaBell, FaPalette, FaGlobe, FaLock, FaEye, FaEyeSlash, FaInfoCircle, FaEnvelope, FaSignOutAlt, FaSpinner } from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';

/**
 * 상속: BaseComponent를 상속받은 프로필 패널 컴포넌트
 * 캡슐화: 프로필 관련 상태와 동작을 내부에 캡슐화
 */
export default class ProfilePanel extends BaseComponent {
  state = {
    ...this.state,
    isAuthenticated: false, // 서버에서 확인한 실제 인증 상태
    userInfo: null, // 서버에서 가져온 사용자 정보
    showLogin: false,
    showSignup: false,
    showSettings: false, // 설정 창 표시 여부
    showLevelSelect: false, // 레벨 선택 모달 표시 여부
    levelSetting: false, // 레벨 설정 중 표시
    loading: true, // 로딩 상태

    // LoginForm 관련 상태
    loginFormData: {
      username: '',
      password: ''
    },
    loginShowPassword: false,
    loginError: '',
    loginLoading: false,

    // SignupForm 관련 상태
    signupFormData: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      name: ''
    },
    signupShowPassword: false,
    signupShowConfirmPassword: false,
    signupErrors: {},
    signupLoading: false,

    // LogoutButton 관련 상태
    logoutLoading: false,
  };

  handleAuthChange = (authStatus) => {
    // 로그인 성공 시에만 서버 상태 확인
    if (authStatus === true) {
      this.setState({ isAuthenticated: true, showLogin: false, showSignup: false });
      // 인증 상태 변경 시 사용자 정보 다시 로드
      this.checkAuthStatus();
    } else {
      // 로그아웃 시에는 서버 확인 없이 바로 상태 업데이트
      this.handleLogout();
    }
  };

  // 로그아웃 전용 핸들러 (서버 상태 확인 없이 로컬 상태만 업데이트)
  handleLogout = () => {
    this.setState({
      isAuthenticated: false,
      userInfo: null,
      showLogin: false,
      showSignup: false
    });
    // 로컬 저장소 정보도 정리
    this.loadLocalUserInfo();
  };

  onMount() {
    super.onMount();
    this.checkAuthStatus();
  }

  // 인증 상태 조회 API
  checkAuthStatus = async () => {
    const BASE_URL = ''; // TestPage.js와 동일
    try {
      const response = await fetch(`${BASE_URL}/api/auth/status`, {
        method: 'GET',
        credentials: 'include'
      });

      // 응답이 JSON인지 확인
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.warn('서버 응답이 JSON 형식이 아닙니다. HTML 에러 페이지일 수 있습니다.');
        throw new Error('서버 응답 형식이 올바르지 않습니다.');
      }

      const data = await response.json();

      if (data.authenticated) {
        // 인증된 경우 사용자 정보 가져오기
        await this.getUserInfo();
        // 인증된 사용자의 세션 개수 가져오기
        await this.getUserSessionCount();
        this.setState({
          isAuthenticated: true,
          loading: false
        });
      } else {
        // 미인증 상태
        this.setState({
          isAuthenticated: false,
          userInfo: null,
          loading: false
        });
        this.loadLocalUserInfo();
      }
    } catch (error) {
      console.error('인증 상태 확인 실패:', error);
      this.setState({
        isAuthenticated: false,
        userInfo: null,
        loading: false
      });
      this.loadLocalUserInfo();
    }
  };

  // 로그인된 사용자 정보 가져오기 (TestPage.js 참고)
  getUserInfo = async () => {
    const BASE_URL = ''; // TestPage.js와 동일
    try {
      const response = await fetch(`${BASE_URL}/api/auth/me`, {
        method: 'GET',
        credentials: 'include'
      });

      if (response.ok) {
        // 응답이 JSON인지 확인
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          this.setState({
            userInfo: data.user,
            isAuthenticated: true
          });
        }
      }
    } catch (error) {
      console.error('사용자 정보 가져오기 실패:', error);
    }
  };

  // 세션 개수 조회
  getUserSessionCount = async () => {
    const BASE_URL = '';
    try {
      const response = await fetch(`${BASE_URL}/api/chats-of-user/my-sessions`, {
        method: 'GET',
        credentials: 'include'
      });

      if (response.ok) {
        // 응답이 JSON인지 확인
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          // sessions 배열의 길이를 세션 개수로 사용
          const sessionCount = data.chatSessions ? data.chatSessions.length : 0;
          this.setState(prevState => ({
            userInfo: {
              ...prevState.userInfo,
              sessionCount: sessionCount
            }
          }));
        }
      }
    } catch (error) {
      console.error('세션 개수 가져오기 실패:', error);
    }
  };

  // 캡슐화된 사용자 정보 로딩 (로컬스토리지)
  loadLocalUserInfo = () => {
    try {
      const sessions = JSON.parse(localStorage.getItem('chatSessions') || '[]');
      this.setState({
        userInfo: {
          name: 'guest',
          role: 'guest',
          sessionCount: sessions.length
        }
      });
    } catch (error) {
      console.error('사용자 정보 로딩 실패:', error);
    }
  };

  handleClose = () => {
    const { onClose } = this.props;
    if (onClose) {
      onClose();
    }
  };

  handleClearSessions = () => {
    if (window.confirm('모든 채팅 기록을 삭제하시겠습니까?')) {
      localStorage.removeItem('chatSessions');
      localStorage.removeItem('chatSessionData');
      this.setState({
        userInfo: {
          ...this.state.userInfo,
          sessionCount: 0
        }
      });
      alert('채팅 기록이 삭제되었습니다.');
    }
  };

  // 설정 창 열기/닫기
  handleOpenSettings = () => {
    this.setState({ showSettings: true });
  };

  handleCloseSettings = () => {
    this.setState({ showSettings: false });
  };

  // 레벨 선택 모달 열기/닫기
  handleOpenLevelSelect = () => {
    this.setState({ showLevelSelect: true });
  };

  handleCloseLevelSelect = () => {
    this.setState({ showLevelSelect: false });
  };

  // 레벨 설정 API 호출
  handleSetLevel = async (level) => {
    const BASE_URL = '';
    this.setState({ levelSetting: true });

    try {
      const response = await fetch(`${BASE_URL}/api/auth/setlevel?level=${level}`, {
        method: 'POST',
        credentials: 'include'
      });

      // 응답이 JSON인지 확인
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('서버 응답 형식이 올바르지 않습니다.');
      }

      const data = await response.json();

      if (response.ok) {
        // 성공 시 사용자 정보 다시 가져오기
        await this.getUserInfo();
        alert(`레벨이 ${this.getLevelDisplayName(level)}(으)로 설정되었습니다.`);
        this.setState({
          showLevelSelect: false,
          levelSetting: false
        });
      } else {
        alert(data.error || '레벨 설정에 실패했습니다.');
        this.setState({ levelSetting: false });
      }
    } catch (error) {
      console.error('레벨 설정 실패:', error);
      alert('레벨 설정 중 오류가 발생했습니다.');
      this.setState({ levelSetting: false });
    }
  };

  // 레벨 표시 이름 가져오기
  getLevelDisplayName = (level) => {
    const levelNames = {
      'novice': '초보자',
      'intermediate': '중급자',
      'expert': '전문가',
      'auto': '자동 조정'
    };
    return levelNames[level] || level;
  };

  // ==================== LoginForm 통합 ====================
  handleLoginChange = (e) => {
    const { name, value } = e.target;
    this.setState(prevState => ({
      loginFormData: {
        ...prevState.loginFormData,
        [name]: value
      },
      loginError: ''
    }));
  };

  handleLoginSubmit = async (e) => {
    e.preventDefault();
    const BASE_URL = ''; // TestPage.js와 동일
    const { loginFormData } = this.state;

    // 입력값 검증
    if (!loginFormData.username.trim()) {
      this.setState({ loginError: '아이디를 입력해주세요.' });
      return;
    }
    if (!loginFormData.password) {
      this.setState({ loginError: '비밀번호를 입력해주세요.' });
      return;
    }

    this.setState({ loginError: '', loginLoading: true });

    try {
      const response = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: loginFormData.username,
          password: loginFormData.password
        }),
        credentials: 'include'
      });

      // 응답이 JSON인지 확인
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('서버 응답 형식이 올바르지 않습니다.');
      }

      const data = await response.json();

      // 로그인 성공 시
      if (response.ok && data.result === 'success') {
        localStorage.setItem('sessionId', data.sessionId);
        localStorage.setItem('userInfo', JSON.stringify(data.user));

        // 상태 업데이트 및 사용자 정보 로드
        this.setState({
          isAuthenticated: true,
          showLogin: false,
          loginFormData: { username: '', password: '' }
        });

        await this.getUserInfo();
        await this.getUserSessionCount(); // 로그인 후 세션 개수 조회
      } else {
        this.setState({ loginError: data.message || '로그인에 실패했습니다.' });
      }
    } catch (err) {
      console.error('로그인 에러:', err);
      this.setState({ loginError: err.message || '로그인 중 오류가 발생했습니다.' });
    } finally {
      this.setState({ loginLoading: false });
    }
  };

  // ==================== SignupForm 통합 ====================
  handleSignupChange = (e) => {
    const { name, value } = e.target;
    this.setState(prevState => ({
      signupFormData: {
        ...prevState.signupFormData,
        [name]: value
      },
      signupErrors: {
        ...prevState.signupErrors,
        [name]: ''
      }
    }));
  };

  // 테스트용 계정 정보 자동 입력
  fillTestAccount = () => {
    this.setState({
      signupFormData: {
        username: 'admin',
        email: 'admin@test.com',
        password: 'admin123',
        confirmPassword: 'admin123',
        name: '관리자'
      },
      signupErrors: {}
    });
  };

  validateSignupForm = () => {
    const { signupFormData } = this.state;
    const newErrors = {};

    if (!signupFormData.username.trim())
      newErrors.username = '아이디를 입력해주세요.';
    else if (signupFormData.username.length < 4)
      newErrors.username = '아이디는 4자 이상이어야 합니다.';

    if (!signupFormData.email.trim())
      newErrors.email = '이메일을 입력해주세요.';
    else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(signupFormData.email))
        newErrors.email = '유효한 이메일 주소가 아닙니다.';
    }

    if (!signupFormData.password)
      newErrors.password = '비밀번호를 입력해주세요.';
    else if (signupFormData.password.length < 6)
      newErrors.password = '비밀번호는 6자 이상이어야 합니다.';

    if (signupFormData.password !== signupFormData.confirmPassword)
      newErrors.confirmPassword = '비밀번호가 일치하지 않습니다.';

    if (!signupFormData.name.trim())
      newErrors.name = '실명을 입력해주세요.';

    return newErrors;
  };

  handleSignupSubmit = async (e) => {
    e.preventDefault();
    const BASE_URL = ''; // TestPage.js와 동일
    const { signupFormData } = this.state;

    const formErrors = this.validateSignupForm();
    if (Object.keys(formErrors).length > 0) {
      this.setState({ signupErrors: formErrors });
      return;
    }

    this.setState({ signupLoading: true });

    try {
      const response = await fetch(`${BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: signupFormData.username,
          password: signupFormData.password,
          email: signupFormData.email,
          name: signupFormData.name
        }),
        credentials: 'include'
      });

      // 응답이 JSON인지 확인
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('서버 응답 형식이 올바르지 않습니다.');
      }

      const data = await response.json();

      if (response.ok && data.result === 'success') {
        alert(`회원가입이 완료되었습니다!\n아이디: ${signupFormData.username}\n이제 로그인할 수 있습니다.`);
        this.setState({
          showSignup: false,
          showLogin: true,
          signupFormData: {
            username: '',
            email: '',
            password: '',
            confirmPassword: '',
            name: ''
          }
        });
      } else {
        alert(data.error || '회원가입에 실패했습니다.');
      }
    } catch (err) {
      console.error('회원가입 에러:', err);
      alert(err.message || '회원가입 도중 오류가 발생했습니다.');
    } finally {
      this.setState({ signupLoading: false });
    }
  };

  // ==================== LogoutButton 통합 ====================
  handleLogoutButton = async () => {
    const BASE_URL = ''; // TestPage.js와 동일
    const { logoutLoading } = this.state;

    if (logoutLoading) return;

    const confirmed = window.confirm('로그아웃 하시겠습니까?');
    if (!confirmed) return;

    this.setState({ logoutLoading: true });

    try {
      const response = await fetch(`${BASE_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });

      // 응답이 JSON인지 확인 (optional, 로그아웃은 실패해도 로컬 상태 정리)
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        await response.json();
      }

      // 로컬스토리지에 저장했던 인증 정보 삭제
      localStorage.removeItem('sessionId');
      localStorage.removeItem('userInfo');

      // 상태 업데이트
      this.setState({
        isAuthenticated: false,
        userInfo: null,
        showLogin: false,
        showSignup: false
      });

      this.loadLocalUserInfo();
    } catch (error) {
      console.error('로그아웃 중 오류 발생:', error);
      alert('로그아웃 중 오류가 발생했습니다.');
    } finally {
      this.setState({ logoutLoading: false });
    }
  };

  // ==================== 렌더링 메서드 ====================
  renderLoginForm = () => {
    const { loginFormData, loginShowPassword, loginError, loginLoading } = this.state;

    return (
      <div className="card border-0 shadow-sm" style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '90%',
        maxWidth: '400px',
        zIndex: 1000
      }}>
        <div className="card-body p-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h5 className="card-title mb-0">로그인</h5>
            <button
              onClick={() => this.setState({ showLogin: false })}
              className="btn btn-link text-secondary p-0"
              style={{ fontSize: '1.5rem', textDecoration: 'none' }}
            >
              <FaTimes />
            </button>
          </div>

          {loginError && (
            <div className="alert alert-danger py-2" role="alert">
              <small>{loginError}</small>
            </div>
          )}

          <form onSubmit={this.handleLoginSubmit}>
            <div className="mb-3">
              <label htmlFor="username" className="form-label">아이디</label>
              <input
                type="text"
                className="form-control"
                id="username"
                name="username"
                value={loginFormData.username}
                onChange={this.handleLoginChange}
                placeholder="아이디를 입력하세요"
                disabled={loginLoading}
              />
            </div>

            <div className="mb-3">
              <label htmlFor="password" className="form-label">비밀번호</label>
              <div className="input-group">
                <input
                  type={loginShowPassword ? "text" : "password"}
                  className="form-control"
                  id="password"
                  name="password"
                  value={loginFormData.password}
                  onChange={this.handleLoginChange}
                  placeholder="비밀번호를 입력하세요"
                  disabled={loginLoading}
                />
                <button
                  className="btn btn-outline-secondary"
                  type="button"
                  onClick={() => this.setState({ loginShowPassword: !loginShowPassword })}
                  disabled={loginLoading}
                >
                  {loginShowPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100 mb-3"
              disabled={loginLoading}
            >
              {loginLoading ? (
                <>
                  <FaSpinner className="spinner-border spinner-border-sm me-2" />
                  로그인 중...
                </>
              ) : '로그인'}
            </button>
          </form>

          <div className="text-center">
            <small className="text-muted">
              계정이 없으신가요?{' '}
              <button
                className="btn btn-link p-0 text-decoration-none"
                onClick={() => this.setState({ showLogin: false, showSignup: true })}
                disabled={loginLoading}
              >
                회원가입
              </button>
            </small>
          </div>
        </div>
      </div>
    );
  };

  renderSignupForm = () => {
    const {
      signupFormData,
      signupShowPassword,
      signupShowConfirmPassword,
      signupErrors,
      signupLoading
    } = this.state;

    return (
      <div className="card border-0 shadow-sm" style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '90%',
        maxWidth: '450px',
        maxHeight: '90vh',
        overflowY: 'auto',
        zIndex: 1000
      }}>
        <div className="card-body p-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h5 className="card-title mb-0">회원가입</h5>
            <button
              onClick={() => this.setState({ showSignup: false })}
              className="btn btn-link text-secondary p-0"
              style={{ fontSize: '1.5rem', textDecoration: 'none' }}
            >
              <FaTimes />
            </button>
          </div>

          <form onSubmit={this.handleSignupSubmit}>
            <div className="mb-3">
              <label htmlFor="signup-username" className="form-label">
                아이디 <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className={`form-control ${signupErrors.username ? 'is-invalid' : ''}`}
                id="signup-username"
                name="username"
                value={signupFormData.username}
                onChange={this.handleSignupChange}
                placeholder="4자 이상의 아이디"
                disabled={signupLoading}
              />
              {signupErrors.username && (
                <div className="invalid-feedback">{signupErrors.username}</div>
              )}
            </div>

            <div className="mb-3">
              <label htmlFor="signup-email" className="form-label">
                이메일 <span className="text-danger">*</span>
              </label>
              <input
                type="email"
                className={`form-control ${signupErrors.email ? 'is-invalid' : ''}`}
                id="signup-email"
                name="email"
                value={signupFormData.email}
                onChange={this.handleSignupChange}
                placeholder="example@email.com"
                disabled={signupLoading}
              />
              {signupErrors.email && (
                <div className="invalid-feedback">{signupErrors.email}</div>
              )}
            </div>

            <div className="mb-3">
              <label htmlFor="signup-password" className="form-label">
                비밀번호 <span className="text-danger">*</span>
              </label>
              <div className="input-group">
                <input
                  type={signupShowPassword ? "text" : "password"}
                  className={`form-control ${signupErrors.password ? 'is-invalid' : ''}`}
                  id="signup-password"
                  name="password"
                  value={signupFormData.password}
                  onChange={this.handleSignupChange}
                  placeholder="6자 이상의 비밀번호"
                  disabled={signupLoading}
                />
                <button
                  className="btn btn-outline-secondary"
                  type="button"
                  onClick={() => this.setState({ signupShowPassword: !signupShowPassword })}
                  disabled={signupLoading}
                >
                  {signupShowPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
                {signupErrors.password && (
                  <div className="invalid-feedback d-block">{signupErrors.password}</div>
                )}
              </div>
            </div>

            <div className="mb-3">
              <label htmlFor="signup-confirmPassword" className="form-label">
                비밀번호 확인 <span className="text-danger">*</span>
              </label>
              <div className="input-group">
                <input
                  type={signupShowConfirmPassword ? "text" : "password"}
                  className={`form-control ${signupErrors.confirmPassword ? 'is-invalid' : ''}`}
                  id="signup-confirmPassword"
                  name="confirmPassword"
                  value={signupFormData.confirmPassword}
                  onChange={this.handleSignupChange}
                  placeholder="비밀번호 재입력"
                  disabled={signupLoading}
                />
                <button
                  className="btn btn-outline-secondary"
                  type="button"
                  onClick={() => this.setState({ signupShowConfirmPassword: !signupShowConfirmPassword })}
                  disabled={signupLoading}
                >
                  {signupShowConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
                {signupErrors.confirmPassword && (
                  <div className="invalid-feedback d-block">{signupErrors.confirmPassword}</div>
                )}
              </div>
            </div>

            <div className="mb-3">
              <label htmlFor="signup-name" className="form-label">
                이름 <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className={`form-control ${signupErrors.name ? 'is-invalid' : ''}`}
                id="signup-name"
                name="name"
                value={signupFormData.name}
                onChange={this.handleSignupChange}
                placeholder="실명을 입력하세요"
                disabled={signupLoading}
              />
              {signupErrors.name && (
                <div className="invalid-feedback">{signupErrors.name}</div>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100 mb-3"
              disabled={signupLoading}
            >
              {signupLoading ? (
                <>
                  <FaSpinner className="spinner-border spinner-border-sm me-2" />
                  가입 중...
                </>
              ) : '회원가입'}
            </button>

            <button
              type="button"
              className="btn btn-outline-secondary w-100 mb-3"
              onClick={this.fillTestAccount}
              disabled={signupLoading}
            >
              테스트 계정 정보 입력
            </button>
          </form>

          <div className="text-center">
            <small className="text-muted">
              이미 계정이 있으신가요?{' '}
              <button
                className="btn btn-link p-0 text-decoration-none"
                onClick={() => this.setState({ showSignup: false, showLogin: true })}
                disabled={signupLoading}
              >
                로그인
              </button>
            </small>
          </div>
        </div>
      </div>
    );
  };

  renderSettingsPanel = () => {
    const { userInfo } = this.state;

    return (
      <div className="card border-0 shadow-sm" style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '90%',
        maxWidth: '500px',
        maxHeight: '90vh',
        overflowY: 'auto',
        zIndex: 1000
      }}>
        <div className="card-body p-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h5 className="card-title mb-0">
              <FaCog className="me-2" />
              설정
            </h5>
            <button
              onClick={this.handleCloseSettings}
              className="btn btn-link text-secondary p-0"
              style={{ fontSize: '1.5rem', textDecoration: 'none' }}
            >
              <FaTimes />
            </button>
          </div>

          <div className="list-group list-group-flush">
            {/* 알림 설정 */}
            <div className="list-group-item px-0 py-3 border-0">
              <div className="d-flex align-items-center">
                <FaBell className="text-primary me-3" size={20} />
                <div className="flex-grow-1">
                  <h6 className="mb-1">알림 설정</h6>
                  <small className="text-muted">새 메시지 알림 받기</small>
                </div>
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="notificationSwitch"
                    defaultChecked
                  />
                </div>
              </div>
            </div>

            {/* 테마 설정 */}
            <div className="list-group-item px-0 py-3 border-0">
              <div className="d-flex align-items-center">
                <FaPalette className="text-primary me-3" size={20} />
                <div className="flex-grow-1">
                  <h6 className="mb-1">테마</h6>
                  <small className="text-muted">다크 모드</small>
                </div>
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="darkModeSwitch"
                  />
                </div>
              </div>
            </div>

            {/* 언어 설정 */}
            <div className="list-group-item px-0 py-3 border-0">
              <div className="d-flex align-items-center">
                <FaGlobe className="text-primary me-3" size={20} />
                <div className="flex-grow-1">
                  <h6 className="mb-1">언어</h6>
                  <small className="text-muted">한국어</small>
                </div>
              </div>
            </div>

            {/* 대화 난이도 설정 (로그인 사용자만) */}
            {userInfo && userInfo.role !== 'guest' && (
              <div className="list-group-item px-0 py-3 border-0">
                <div className="d-flex align-items-center">
                  <FaInfoCircle className="text-primary me-3" size={20} />
                  <div className="flex-grow-1">
                    <h6 className="mb-1">대화 난이도</h6>
                    <small className="text-muted">
                      현재: {this.getLevelDisplayName(userInfo.level || 'auto')}
                    </small>
                  </div>
                  <button
                    className="btn btn-sm btn-outline-primary"
                    onClick={this.handleOpenLevelSelect}
                  >
                    변경
                  </button>
                </div>
              </div>
            )}

            {/* 개인정보 보호 */}
            <div className="list-group-item px-0 py-3 border-0">
              <div className="d-flex align-items-center">
                <FaLock className="text-primary me-3" size={20} />
                <div className="flex-grow-1">
                  <h6 className="mb-1">개인정보 보호</h6>
                  <small className="text-muted">개인정보 처리방침</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  renderLevelSelectModal = () => {
    const { levelSetting } = this.state;

    return (
      <div className="card border-0 shadow-sm" style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '90%',
        maxWidth: '450px',
        zIndex: 1100
      }}>
        <div className="card-body p-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="card-title mb-0">대화 난이도 설정</h5>
            <button
              onClick={this.handleCloseLevelSelect}
              className="btn btn-link text-secondary p-0"
              style={{ fontSize: '1.5rem', textDecoration: 'none' }}
              disabled={levelSetting}
            >
              <FaTimes />
            </button>
          </div>

          <p className="text-muted mb-4">
            대화 난이도를 선택하세요. 선택한 레벨에 따라 AI의 응답 스타일이 조정됩니다.
          </p>

          {/* 레벨 버튼들 */}
          <div className="d-grid gap-2">
            <button
              className="btn btn-outline-primary text-start p-3"
              onClick={() => this.handleSetLevel('novice')}
              disabled={levelSetting}
            >
              <strong>초보자</strong>
              <div className="small text-muted">쉽고 친절한 설명</div>
            </button>

            <button
              className="btn btn-outline-primary text-start p-3"
              onClick={() => this.handleSetLevel('intermediate')}
              disabled={levelSetting}
            >
              <strong>중급자</strong>
              <div className="small text-muted">적당한 수준의 설명</div>
            </button>

            <button
              className="btn btn-outline-primary text-start p-3"
              onClick={() => this.handleSetLevel('expert')}
              disabled={levelSetting}
            >
              <strong>전문가</strong>
              <div className="small text-muted">전문적이고 간결한 설명</div>
            </button>

            <button
              className="btn btn-outline-secondary text-start p-3"
              onClick={() => this.handleSetLevel('auto')}
              disabled={levelSetting}
            >
              <strong>자동 조정</strong>
              <div className="small text-muted">대화 내용에 따라 자동 조정</div>
            </button>
          </div>

          {levelSetting && (
            <div className="text-center mt-3">
              <FaSpinner className="spinner-border spinner-border-sm me-2" />
              <span className="text-muted">설정 중...</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  render() {
    const {
      isAuthenticated,
      userInfo,
      showLogin,
      showSignup,
      showSettings,
      showLevelSelect,
      loading
    } = this.state;
    const { show } = this.props;

    if (!show) return null;

    // 로딩 중일 때
    if (loading) {
      return (
        <div
          className="position-fixed top-0 start-0 w-100 h-100"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1050
          }}
          onClick={this.handleClose}
        >
          <div
            className="card border-0 shadow-lg"
            style={{
              position: 'absolute',
              top: '60px',
              right: '20px',
              width: '350px',
              maxHeight: '80vh',
              overflowY: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="card-body p-4 text-center">
              <FaSpinner className="spinner-border spinner-border-sm me-2" />
              <span>로딩 중...</span>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div
        className="position-fixed top-0 start-0 w-100 h-100"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 1050
        }}
        onClick={this.handleClose}
      >
        {/* 메인 프로필 패널 */}
        <div
          className="card border-0 shadow-lg"
          style={{
            position: 'absolute',
            top: '60px',
            right: '20px',
            width: '350px',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* 헤더 */}
          <div className="card-header bg-primary text-white p-3">
            <div className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                <FaUser className="me-2" />
                프로필
              </h5>
              <button
                onClick={this.handleClose}
                className="btn btn-link text-white p-0"
                style={{ fontSize: '1.5rem', textDecoration: 'none' }}
              >
                <FaTimes />
              </button>
            </div>
          </div>

          {/* 바디 */}
          <div className="card-body p-4">
            {/* 사용자 정보 */}
            <div className="text-center mb-4">
              <div
                className="rounded-circle bg-primary text-white d-inline-flex align-items-center justify-content-center mb-3"
                style={{ width: '80px', height: '80px', fontSize: '2rem' }}
              >
                <FaUser />
              </div>
              <h5 className="mb-1">{userInfo?.name || 'Guest'}</h5>
              <p className="text-muted mb-0">
                {userInfo?.role === 'admin' && '관리자'}
                {userInfo?.role === 'user' && '사용자'}
                {userInfo?.role === 'guest' && '게스트'}
              </p>
              {userInfo?.email && (
                <p className="text-muted small mb-0">
                  <FaEnvelope className="me-1" />
                  {userInfo.email}
                </p>
              )}
            </div>

            {/* 통계 */}
            <div className="row text-center mb-4">
              <div className="col-12">
                <div className="border rounded p-3">
                  <h4 className="mb-0">{userInfo?.sessionCount || 0}</h4>
                  <small className="text-muted">채팅 세션</small>
                </div>
              </div>
            </div>

            {/* 액션 버튼들 */}
            <div className="d-grid gap-2">
              {!isAuthenticated ? (
                <>
                  <button
                    className="btn btn-primary"
                    onClick={() => this.setState({ showLogin: true })}
                  >
                    로그인
                  </button>
                  <button
                    className="btn btn-outline-primary"
                    onClick={() => this.setState({ showSignup: true })}
                  >
                    회원가입
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="btn btn-outline-primary"
                    onClick={this.handleOpenSettings}
                  >
                    <FaCog className="me-2" />
                    설정
                  </button>
                  <button
                    className="btn btn-outline-danger"
                    onClick={this.handleLogoutButton}
                  >
                    <FaSignOutAlt className="me-2" />
                    로그아웃
                  </button>
                </>
              )}

              <button
                className="btn btn-outline-secondary"
                onClick={this.handleClearSessions}
              >
                채팅 기록 삭제
              </button>
            </div>
          </div>
        </div>

        {/* 로그인 폼 */}
        {showLogin && this.renderLoginForm()}

        {/* 회원가입 폼 */}
        {showSignup && this.renderSignupForm()}

        {/* 설정 패널 */}
        {showSettings && this.renderSettingsPanel()}

        {/* 레벨 선택 모달 */}
        {showLevelSelect && this.renderLevelSelectModal()}
      </div>
    );
  }
}

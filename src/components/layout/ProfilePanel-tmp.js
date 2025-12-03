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
  // TestPage.js와 동일한 방식으로 BASE_URL을 클래스 필드로 선언
  BASE_URL = '';

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
      this.setState({
        isAuthenticated: true,
        showLogin: false,
        showSignup: false
      });
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
    // TestPage.js와 동일한 방식으로 BASE_URL 사용
    console.log('[디버깅] ProfilePanel: 인증 상태 확인 시작');
    console.log('[디버깅] ProfilePanel: BASE_URL:', this.BASE_URL);

    try {
      console.log('[디버깅] ProfilePanel: /api/auth/status 요청 시작');
      const response = await fetch(`${this.BASE_URL}/api/auth/status`, {
        method: 'GET',
        credentials: 'include'
      });

      console.log('[디버깅] ProfilePanel: 응답 상태 코드:', response.status);
      console.log('[디버깅] ProfilePanel: 응답 헤더:', Object.fromEntries(response.headers.entries()));

      // 응답이 JSON 형식인지 확인
      const contentType = response.headers.get('content-type');
      console.log('[디버깅] ProfilePanel: Content-Type:', contentType);

      if (!contentType || !contentType.includes('application/json')) {
        console.error('[디버깅] ProfilePanel: 서버 응답이 JSON 형식이 아닙니다:', contentType);
        this.setState({
          isAuthenticated: false,
          userInfo: null,
          loading: false
        });
        this.loadLocalUserInfo();
        return;
      }

      const data = await response.json();
      console.log('[디버깅] ProfilePanel: 서버 응답 데이터:', data);

      if (data.authenticated) {
        console.log('[디버깅] ProfilePanel: ✅ 인증됨 - 사용자:', data.username);
        // 인증된 경우 사용자 정보 가져오기
        await this.getUserInfo();
        // 인증된 사용자의 세션 개수 가져오기
        await this.getUserSessionCount();
        this.setState({
          isAuthenticated: true,
          loading: false
        });
      } else {
        console.log('[디버깅] ProfilePanel: ❌ 인증 안됨');
        // 미인증 상태
        this.setState({
          isAuthenticated: false,
          userInfo: null,
          loading: false
        });
        this.loadLocalUserInfo();
      }
    } catch (error) {
      console.error('[디버깅] ProfilePanel: 인증 상태 확인 실패:', error);
      this.setState({
        isAuthenticated: false,
        userInfo: null,
        loading: false
      });
      this.loadLocalUserInfo();
    }
  };

  // 로그인된 사용자 정보 가져오기
  getUserInfo = async () => {
    try {
      const response = await fetch(`${this.BASE_URL}/api/auth/me`, {
        method: 'GET',
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        this.setState({
          userInfo: data.user,
          isAuthenticated: true
        });
      }
    } catch (error) {
      console.error('사용자 정보 가져오기 실패:', error);
    }
  };

  // 세션 개수 조회
  getUserSessionCount = async () => {
    try {
      const response = await fetch(`${this.BASE_URL}/api/chats-of-user/my-sessions`, {
        method: 'GET',
        credentials: 'include'
      });

      if (response.ok) {
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
    this.setState({ levelSetting: true });

    try {
      const response = await fetch(`${this.BASE_URL}/api/auth/setlevel?level=${level}`, {
        method: 'POST',
        credentials: 'include'
      });

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

    this.setState({
      loginError: '',
      loginLoading: true
    });

    try {
      const response = await fetch(`${this.BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: loginFormData.username,
          password: loginFormData.password
        }),
        credentials: 'include'
      });

      const data = await response.json();

      // 로그인 성공 시
      if (response.ok && data.result === 'success') {
        localStorage.setItem('sessionId', data.sessionId);
        localStorage.setItem('userInfo', JSON.stringify(data.user));

        // 상태 업데이트 및 사용자 정보 로드
        this.setState({
          isAuthenticated: true,
          showLogin: false,
          loginFormData: {
            username: '',
            password: ''
          }
        });

        await this.getUserInfo();
        await this.getUserSessionCount(); // 로그인 후 세션 개수 조회
      } else {
        this.setState({
          loginError: data.message || '로그인에 실패했습니다.'
        });
      }
    } catch (err) {
      console.error('로그인 에러:', err);
      this.setState({
        loginError: err.message || '로그인 중 오류가 발생했습니다.'
      });
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
    const { signupFormData } = this.state;

    const formErrors = this.validateSignupForm();
    if (Object.keys(formErrors).length > 0) {
      this.setState({ signupErrors: formErrors });
      return;
    }

    this.setState({ signupLoading: true });

    try {
      const response = await fetch(`${this.BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: signupFormData.username,
          password: signupFormData.password,
          email: signupFormData.email,
          name: signupFormData.name
        }),
        credentials: 'include'
      });

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
    const { logoutLoading } = this.state;
    if (logoutLoading) return;

    const confirmed = window.confirm('로그아웃 하시겠습니까?');
    if (!confirmed) return;

    this.setState({ logoutLoading: true });

    try {
      const response = await fetch(`${this.BASE_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });

      await response.json();

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
      <div className="card shadow-sm">
        <div className="card-body p-4">
          <h3 className="card-title text-center mb-4">로그인</h3>

          {loginError && (
            <div className="alert alert-danger" role="alert">
              <FaInfoCircle className="me-2" />
              {loginError}
            </div>
          )}

          <form onSubmit={this.handleLoginSubmit}>
            <div className="mb-3">
              <label htmlFor="login-username" className="form-label">
                <FaUser className="me-2" />
                아이디
              </label>
              <input
                type="text"
                className="form-control"
                id="login-username"
                name="username"
                value={loginFormData.username}
                onChange={this.handleLoginChange}
                placeholder="아이디를 입력하세요"
                disabled={loginLoading}
              />
            </div>

            <div className="mb-3">
              <label htmlFor="login-password" className="form-label">
                <FaLock className="me-2" />
                비밀번호
              </label>
              <div className="input-group">
                <input
                  type={loginShowPassword ? 'text' : 'password'}
                  className="form-control"
                  id="login-password"
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
              ) : (
                '로그인'
              )}
            </button>

            <div className="text-center">
              <span className="text-muted">계정이 없으신가요? </span>
              <button
                type="button"
                className="btn btn-link p-0"
                onClick={() => this.setState({ showLogin: false, showSignup: true })}
                disabled={loginLoading}
              >
                회원가입
              </button>
            </div>
          </form>
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
      <div className="card shadow-sm">
        <div className="card-body p-4">
          <h3 className="card-title text-center mb-4">회원가입</h3>

          <form onSubmit={this.handleSignupSubmit}>
            <div className="mb-3">
              <label htmlFor="signup-username" className="form-label">
                <FaUser className="me-2" />
                아이디 (4자 이상)
              </label>
              <input
                type="text"
                className={`form-control ${signupErrors.username ? 'is-invalid' : ''}`}
                id="signup-username"
                name="username"
                value={signupFormData.username}
                onChange={this.handleSignupChange}
                placeholder="아이디를 입력하세요"
                disabled={signupLoading}
              />
              {signupErrors.username && (
                <div className="invalid-feedback">{signupErrors.username}</div>
              )}
            </div>

            <div className="mb-3">
              <label htmlFor="signup-email" className="form-label">
                <FaEnvelope className="me-2" />
                이메일
              </label>
              <input
                type="email"
                className={`form-control ${signupErrors.email ? 'is-invalid' : ''}`}
                id="signup-email"
                name="email"
                value={signupFormData.email}
                onChange={this.handleSignupChange}
                placeholder="이메일을 입력하세요"
                disabled={signupLoading}
              />
              {signupErrors.email && (
                <div className="invalid-feedback">{signupErrors.email}</div>
              )}
            </div>

            <div className="mb-3">
              <label htmlFor="signup-password" className="form-label">
                <FaLock className="me-2" />
                비밀번호 (6자 이상)
              </label>
              <div className="input-group">
                <input
                  type={signupShowPassword ? 'text' : 'password'}
                  className={`form-control ${signupErrors.password ? 'is-invalid' : ''}`}
                  id="signup-password"
                  name="password"
                  value={signupFormData.password}
                  onChange={this.handleSignupChange}
                  placeholder="비밀번호를 입력하세요"
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
              <label htmlFor="signup-confirm-password" className="form-label">
                <FaLock className="me-2" />
                비밀번호 확인
              </label>
              <div className="input-group">
                <input
                  type={signupShowConfirmPassword ? 'text' : 'password'}
                  className={`form-control ${signupErrors.confirmPassword ? 'is-invalid' : ''}`}
                  id="signup-confirm-password"
                  name="confirmPassword"
                  value={signupFormData.confirmPassword}
                  onChange={this.handleSignupChange}
                  placeholder="비밀번호를 다시 입력하세요"
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
                <FaUser className="me-2" />
                실명
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
              className="btn btn-success w-100 mb-3"
              disabled={signupLoading}
            >
              {signupLoading ? (
                <>
                  <FaSpinner className="spinner-border spinner-border-sm me-2" />
                  회원가입 중...
                </>
              ) : (
                '회원가입'
              )}
            </button>

            <button
              type="button"
              className="btn btn-secondary w-100 mb-3"
              onClick={this.fillTestAccount}
              disabled={signupLoading}
            >
              <FaInfoCircle className="me-2" />
              테스트 계정 정보 자동 입력
            </button>

            <div className="text-center">
              <span className="text-muted">이미 계정이 있으신가요? </span>
              <button
                type="button"
                className="btn btn-link p-0"
                onClick={() => this.setState({ showSignup: false, showLogin: true })}
                disabled={signupLoading}
              >
                로그인
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  renderLevelSelectModal = () => {
    const { showLevelSelect, levelSetting, userInfo } = this.state;

    if (!showLevelSelect) return null;

    const currentLevel = userInfo?.level || 'auto';

    return (
      <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                <FaPalette className="me-2" />
                대화 난이도 설정
              </h5>
              <button
                type="button"
                className="btn-close"
                onClick={this.handleCloseLevelSelect}
                disabled={levelSetting}
              ></button>
            </div>
            <div className="modal-body">
              <p className="text-muted mb-3">
                <FaInfoCircle className="me-2" />
                대화 난이도를 선택하세요. 선택한 레벨에 따라 AI의 응답 스타일이 조정됩니다.
              </p>

              {/* 레벨 버튼들 */}
              <div className="d-grid gap-2">
                <button
                  className={`btn ${currentLevel === 'novice' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => this.handleSetLevel('novice')}
                  disabled={levelSetting}
                >
                  {levelSetting && currentLevel === 'novice' ? (
                    <FaSpinner className="spinner-border spinner-border-sm me-2" />
                  ) : null}
                  초보자 (Novice)
                </button>

                <button
                  className={`btn ${currentLevel === 'intermediate' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => this.handleSetLevel('intermediate')}
                  disabled={levelSetting}
                >
                  {levelSetting && currentLevel === 'intermediate' ? (
                    <FaSpinner className="spinner-border spinner-border-sm me-2" />
                  ) : null}
                  중급자 (Intermediate)
                </button>

                <button
                  className={`btn ${currentLevel === 'expert' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => this.handleSetLevel('expert')}
                  disabled={levelSetting}
                >
                  {levelSetting && currentLevel === 'expert' ? (
                    <FaSpinner className="spinner-border spinner-border-sm me-2" />
                  ) : null}
                  전문가 (Expert)
                </button>

                <button
                  className={`btn ${currentLevel === 'auto' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => this.handleSetLevel('auto')}
                  disabled={levelSetting}
                >
                  {levelSetting && currentLevel === 'auto' ? (
                    <FaSpinner className="spinner-border spinner-border-sm me-2" />
                  ) : null}
                  자동 조정 (Auto)
                </button>
              </div>

              <div className="mt-3 text-muted small">
                <strong>현재 레벨:</strong> {this.getLevelDisplayName(currentLevel)}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  renderSettingsModal = () => {
    const { showSettings, userInfo } = this.state;

    if (!showSettings) return null;

    return (
      <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                <FaCog className="me-2" />
                설정
              </h5>
              <button
                type="button"
                className="btn-close"
                onClick={this.handleCloseSettings}
              ></button>
            </div>
            <div className="modal-body">
              <div className="list-group">
                <button
                  className="list-group-item list-group-item-action"
                  onClick={() => {
                    this.handleCloseSettings();
                    this.handleOpenLevelSelect();
                  }}
                >
                  <FaPalette className="me-2" />
                  대화 난이도 설정
                  <span className="badge bg-primary ms-2">
                    {this.getLevelDisplayName(userInfo?.level || 'auto')}
                  </span>
                </button>

                <button
                  className="list-group-item list-group-item-action"
                  onClick={this.handleClearSessions}
                >
                  <FaBell className="me-2" />
                  채팅 기록 삭제
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  render() {
    const { isOpen } = this.props;
    const {
      isAuthenticated,
      userInfo,
      showLogin,
      showSignup,
      loading,
      logoutLoading
    } = this.state;

    if (!isOpen) return null;

    return (
      <>
        <div style={panelStyle}>
          {/* 헤더 */}
          <div style={headerStyle}>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>프로필</h2>
            <button 
              onClick={this.handleClose}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '20px',
                color: '#718096'
              }}
            >
              <FaTimes />
            </button>
          </div>

          {/* 콘텐츠 */}
          <div style={contentStyle}>
            {/* 사용자 정보 섹션 */}
            <div style={sectionStyle}>
              <div style={{
                padding: '16px',
                background: '#f7fafc',
                borderRadius: '8px',
                border: '1px solid #e2e8f0'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <FaUser style={{ fontSize: '24px', color: '#4a5568' }} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '16px' }}>{displayUserInfo.name}</div>
                    <div style={{ fontSize: '12px', color: '#718096' }}>{displayUserInfo.role}</div>
                  </div>
                </div>
                <div style={{ fontSize: '14px', color: '#4a5568' }}>
                  채팅 세션: {displayUserInfo.sessionCount}개
                </div>
                {isAuthenticated && userInfo?.level && (
                  <div style={{ fontSize: '14px', color: '#4a5568', marginTop: '4px' }}>
                    대화 수준: {this.getLevelDisplayName(userInfo.level)}
                  </div>
                )}
              </div>
            </div>

            {/* 인증 버튼들 */}
            <div style={sectionStyle}>
              {!isAuthenticated ? (
                <>
                  <button 
                    style={{...buttonStyle, background: '#3182ce', color: '#ffffff', border: 'none'}}
                    onClick={() => this.setState({ showLogin: true })}
                  >
                    <FaUser /> 로그인
                  </button>
                  <button 
                    style={{...buttonStyle, background: '#38a169', color: '#ffffff', border: 'none'}}
                    onClick={() => this.setState({ showSignup: true })}
                  >
                    <FaUser /> 회원가입
                  </button>
                </>
              ) : (
                <button 
                  style={{
                    ...buttonStyle, 
                    background: logoutLoading ? '#cbd5e0' : '#e53e3e', 
                    color: '#ffffff', 
                    border: 'none',
                    cursor: logoutLoading ? 'not-allowed' : 'pointer'
                  }}
                  onClick={this.handleLogoutButton}
                  disabled={logoutLoading}
                >
                  {logoutLoading ? <FaSpinner className="fa-spin" /> : <FaSignOutAlt />}
                  {logoutLoading ? '로그아웃 중...' : '로그아웃'}
                </button>
              )}
            </div>

            {/* 기능 버튼들 */}
            <div style={sectionStyle}>
              <button style={buttonStyle} onClick={this.handleOpenSettings}>
                <FaCog /> 설정
              </button>
              <button style={buttonStyle} onClick={this.handleClearSessions}>
                <FaBell /> 채팅 기록 삭제
              </button>
              {isAuthenticated && (
                <button style={buttonStyle} onClick={this.handleOpenLevelSelect}>
                  <FaPalette /> 대화 난이도 설정
                </button>
              )}
            </div>
          </div>

          {/* LoginForm 렌더링 */}
          {showLogin && this.renderLoginForm()}

          {/* SignupForm 렌더링 */}
          {showSignup && this.renderSignupForm()}
        </div>

        {/* 설정 창 모달 */}
        {showSettings && (
          <div style={overlayStyle} onClick={this.handleCloseSettings}>
            <div style={settingsModalStyle} onClick={(e) => e.stopPropagation()}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px'
              }}>
                <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 600 }}>설정</h3>
                <button 
                  onClick={this.handleCloseSettings}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '20px',
                    color: '#718096'
                  }}
                >
                  <FaTimes />
                </button>
              </div>

              {/* 설정 항목들 */}
              <div style={settingItemStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FaPalette />
                  <span>테마</span>
                </div>
                <span style={{ color: '#718096' }}>라이트</span>
              </div>

              <div style={settingItemStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FaGlobe />
                  <span>언어</span>
                </div>
                <span style={{ color: '#718096' }}>한국어</span>
              </div>

              <div style={settingItemStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FaLock />
                  <span>개인정보 보호</span>
                </div>
                <span style={{ color: '#718096' }}>활성화</span>
              </div>
            </div>
          </div>
        )}

        {/* 레벨 선택 모달 */}
        {showLevelSelect && (
          <div style={overlayStyle} onClick={this.handleCloseLevelSelect}>
            <div style={{...settingsModalStyle, width: '400px'}} onClick={(e) => e.stopPropagation()}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px'
              }}>
                <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 600 }}>대화 난이도 선택</h3>
                <button 
                  onClick={this.handleCloseLevelSelect}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '20px',
                    color: '#718096'
                  }}
                >
                  <FaTimes />
                </button>
              </div>

              <p style={{ marginBottom: '20px', color: '#718096', fontSize: '14px' }}>
                대화 난이도를 선택하세요. 선택한 레벨에 따라 AI의 응답 스타일이 조정됩니다.
              </p>

              {/* 레벨 버튼들 */}
              <button
                onClick={() => this.handleSetLevel('novice')}
                disabled={levelSetting}
                style={{
                  width: '100%',
                  padding: '16px',
                  marginBottom: '12px',
                  background: levelSetting ? '#e2e8f0' : '#f7fafc',
                  border: '2px solid #e2e8f0',
                  borderRadius: '8px',
                  cursor: levelSetting ? 'not-allowed' : 'pointer',
                  textAlign: 'left'
                }}
              >
                <div style={{ fontWeight: 600, fontSize: '16px', marginBottom: '4px' }}>초보자</div>
                <div style={{ fontSize: '14px', color: '#718096' }}>
                  쉽고 자세한 설명으로 대화합니다.
                </div>
              </button>

              <button
                onClick={() => this.handleSetLevel('intermediate')}
                disabled={levelSetting}
                style={{
                  width: '100%',
                  padding: '16px',
                  marginBottom: '12px',
                  background: levelSetting ? '#e2e8f0' : '#f7fafc',
                  border: '2px solid #e2e8f0',
                  borderRadius: '8px',
                  cursor: levelSetting ? 'not-allowed' : 'pointer',
                  textAlign: 'left'
                }}
              >
                <div style={{ fontWeight: 600, fontSize: '16px', marginBottom: '4px' }}>중급자</div>
                <div style={{ fontSize: '14px', color: '#718096' }}>
                  적당한 수준의 설명으로 대화합니다.
                </div>
              </button>

              <button
                onClick={() => this.handleSetLevel('expert')}
                disabled={levelSetting}
                style={{
                  width: '100%',
                  padding: '16px',
                  marginBottom: '12px',
                  background: levelSetting ? '#e2e8f0' : '#f7fafc',
                  border: '2px solid #e2e8f0',
                  borderRadius: '8px',
                  cursor: levelSetting ? 'not-allowed' : 'pointer',
                  textAlign: 'left'
                }}
              >
                <div style={{ fontWeight: 600, fontSize: '16px', marginBottom: '4px' }}>전문가</div>
                <div style={{ fontSize: '14px', color: '#718096' }}>
                  전문적인 용어와 간결한 설명을 사용합니다.
                </div>
              </button>

              <button
                onClick={() => this.handleSetLevel('auto')}
                disabled={levelSetting}
                style={{
                  width: '100%',
                  padding: '16px',
                  background: levelSetting ? '#e2e8f0' : '#f7fafc',
                  border: '2px solid #e2e8f0',
                  borderRadius: '8px',
                  cursor: levelSetting ? 'not-allowed' : 'pointer',
                  textAlign: 'left'
                }}
              >
                <div style={{ fontWeight: 600, fontSize: '16px', marginBottom: '4px' }}>자동 조정</div>
                <div style={{ fontSize: '14px', color: '#718096' }}>
                  대화 내용에 따라 자동으로 난이도가 조정됩니다.
                </div>
              </button>
            </div>
          </div>
        )}
      </>
    );
  }
}

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
    isAuthenticated: false,    // 서버에서 확인한 실제 인증 상태
    userInfo: null,            // 서버에서 가져온 사용자 정보
    showLogin: false,
    showSignup: false,
    showSettings: false,       // 설정 창 표시 여부
    showLevelSelect: false,    // 레벨 선택 모달 표시 여부
    levelSetting: false,       // 레벨 설정 중 표시
    loading: true,             // 로딩 상태

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
    this.setState({ isAuthenticated: false, userInfo: null, showLogin: false, showSignup: false });
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

      // 응답이 JSON 형식인지 확인
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('서버 응답이 JSON 형식이 아닙니다:', contentType);
        this.setState({ isAuthenticated: false, userInfo: null, loading: false });
        this.loadLocalUserInfo();
        return;
      }

      const data = await response.json();

      if (data.authenticated) {
        // 인증된 경우 사용자 정보 가져오기
        await this.getUserInfo();
        // 인증된 사용자의 세션 개수 가져오기
        await this.getUserSessionCount();
        this.setState({ isAuthenticated: true, loading: false });
      } else {
        // 미인증 상태
        this.setState({ isAuthenticated: false, userInfo: null, loading: false });
        this.loadLocalUserInfo();
      }
    } catch (error) {
      console.error('인증 상태 확인 실패:', error);
      this.setState({ isAuthenticated: false, userInfo: null, loading: false });
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
        // 응답이 JSON 형식인지 확인
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          this.setState({ userInfo: data.user, isAuthenticated: true });
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
        // 응답이 JSON 형식인지 확인
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

      // 응답이 JSON 형식인지 확인
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        alert('서버 응답 오류가 발생했습니다.');
        this.setState({ levelSetting: false });
        return;
      }

      const data = await response.json();

      if (response.ok) {
        // 성공 시 사용자 정보 다시 가져오기
        await this.getUserInfo();
        alert(`레벨이 ${this.getLevelDisplayName(level)}(으)로 설정되었습니다.`);
        this.setState({ showLevelSelect: false, levelSetting: false });
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
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: loginFormData.username,
          password: loginFormData.password
        }),
        credentials: 'include'
      });

      // 응답이 JSON 형식인지 확인
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        this.setState({ loginError: '서버 응답 오류가 발생했습니다.' });
        return;
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

      // 응답이 JSON 형식인지 확인
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        alert('서버 응답 오류가 발생했습니다.');
        return;
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

      // 응답이 JSON 형식인지 확인 (선택 사항)
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
      <div className="modal-overlay" onClick={() => this.setState({ showLogin: false })}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2 className="modal-title">로그인</h2>
            <button className="close-button" onClick={() => this.setState({ showLogin: false })}>
              <FaTimes />
            </button>
          </div>

          <form onSubmit={this.handleLoginSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="username">아이디</label>
              <input
                type="text"
                id="username"
                name="username"
                value={loginFormData.username}
                onChange={this.handleLoginChange}
                className="form-control"
                placeholder="아이디를 입력하세요"
                disabled={loginLoading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">비밀번호</label>
              <div className="password-input-wrapper">
                <input
                  type={loginShowPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={loginFormData.password}
                  onChange={this.handleLoginChange}
                  className="form-control"
                  placeholder="비밀번호를 입력하세요"
                  disabled={loginLoading}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => this.setState({ loginShowPassword: !loginShowPassword })}
                  disabled={loginLoading}
                >
                  {loginShowPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {loginError && (
              <div className="alert alert-danger">
                {loginError}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary w-100"
              disabled={loginLoading}
            >
              {loginLoading ? (
                <>
                  <FaSpinner className="spinner-icon" />
                  로그인 중...
                </>
              ) : (
                '로그인'
              )}
            </button>

            <div className="form-footer">
              <p>
                계정이 없으신가요?{' '}
                <button
                  type="button"
                  className="link-button"
                  onClick={() => this.setState({ showLogin: false, showSignup: true })}
                  disabled={loginLoading}
                >
                  회원가입
                </button>
              </p>
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
      <div className="modal-overlay" onClick={() => this.setState({ showSignup: false })}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2 className="modal-title">회원가입</h2>
            <button className="close-button" onClick={() => this.setState({ showSignup: false })}>
              <FaTimes />
            </button>
          </div>

          <form onSubmit={this.handleSignupSubmit} className="signup-form">
            {/* 테스트용 자동 입력 버튼 */}
            <button
              type="button"
              className="btn btn-secondary w-100 mb-3"
              onClick={this.fillTestAccount}
              disabled={signupLoading}
            >
              <FaInfoCircle className="me-2" />
              테스트 계정 정보 자동 입력
            </button>

            <div className="form-group">
              <label htmlFor="signup-username">아이디</label>
              <input
                type="text"
                id="signup-username"
                name="username"
                value={signupFormData.username}
                onChange={this.handleSignupChange}
                className={`form-control ${signupErrors.username ? 'is-invalid' : ''}`}
                placeholder="아이디를 입력하세요 (4자 이상)"
                disabled={signupLoading}
              />
              {signupErrors.username && (
                <div className="invalid-feedback">{signupErrors.username}</div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="signup-email">이메일</label>
              <input
                type="email"
                id="signup-email"
                name="email"
                value={signupFormData.email}
                onChange={this.handleSignupChange}
                className={`form-control ${signupErrors.email ? 'is-invalid' : ''}`}
                placeholder="이메일을 입력하세요"
                disabled={signupLoading}
              />
              {signupErrors.email && (
                <div className="invalid-feedback">{signupErrors.email}</div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="signup-password">비밀번호</label>
              <div className="password-input-wrapper">
                <input
                  type={signupShowPassword ? 'text' : 'password'}
                  id="signup-password"
                  name="password"
                  value={signupFormData.password}
                  onChange={this.handleSignupChange}
                  className={`form-control ${signupErrors.password ? 'is-invalid' : ''}`}
                  placeholder="비밀번호를 입력하세요 (6자 이상)"
                  disabled={signupLoading}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => this.setState({ signupShowPassword: !signupShowPassword })}
                  disabled={signupLoading}
                >
                  {signupShowPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {signupErrors.password && (
                <div className="invalid-feedback d-block">{signupErrors.password}</div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="signup-confirmPassword">비밀번호 확인</label>
              <div className="password-input-wrapper">
                <input
                  type={signupShowConfirmPassword ? 'text' : 'password'}
                  id="signup-confirmPassword"
                  name="confirmPassword"
                  value={signupFormData.confirmPassword}
                  onChange={this.handleSignupChange}
                  className={`form-control ${signupErrors.confirmPassword ? 'is-invalid' : ''}`}
                  placeholder="비밀번호를 다시 입력하세요"
                  disabled={signupLoading}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => this.setState({ signupShowConfirmPassword: !signupShowConfirmPassword })}
                  disabled={signupLoading}
                >
                  {signupShowConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {signupErrors.confirmPassword && (
                <div className="invalid-feedback d-block">{signupErrors.confirmPassword}</div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="signup-name">실명</label>
              <input
                type="text"
                id="signup-name"
                name="name"
                value={signupFormData.name}
                onChange={this.handleSignupChange}
                className={`form-control ${signupErrors.name ? 'is-invalid' : ''}`}
                placeholder="실명을 입력하세요"
                disabled={signupLoading}
              />
              {signupErrors.name && (
                <div className="invalid-feedback">{signupErrors.name}</div>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100"
              disabled={signupLoading}
            >
              {signupLoading ? (
                <>
                  <FaSpinner className="spinner-icon" />
                  가입 중...
                </>
              ) : (
                '회원가입'
              )}
            </button>

            <div className="form-footer">
              <p>
                이미 계정이 있으신가요?{' '}
                <button
                  type="button"
                  className="link-button"
                  onClick={() => this.setState({ showSignup: false, showLogin: true })}
                  disabled={signupLoading}
                >
                  로그인
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>
    );
  };

  renderSettings = () => {
    const { userInfo } = this.state;

    return (
      <div className="modal-overlay" onClick={this.handleCloseSettings}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2 className="modal-title">설정</h2>
            <button className="close-button" onClick={this.handleCloseSettings}>
              <FaTimes />
            </button>
          </div>

          <div className="settings-content">
            <div className="settings-section">
              <h3 className="settings-section-title">
                <FaPalette className="me-2" />
                대화 난이도
              </h3>
              <p className="settings-description">
                현재 레벨: <strong>{userInfo?.level ? this.getLevelDisplayName(userInfo.level) : '설정 안 됨'}</strong>
              </p>
              <button
                className="btn btn-outline-primary w-100"
                onClick={this.handleOpenLevelSelect}
              >
                레벨 변경
              </button>
            </div>

            <div className="settings-section">
              <h3 className="settings-section-title">
                <FaBell className="me-2" />
                알림 설정
              </h3>
              <p className="settings-description">알림 기능은 준비 중입니다.</p>
            </div>

            <div className="settings-section">
              <h3 className="settings-section-title">
                <FaGlobe className="me-2" />
                언어 설정
              </h3>
              <p className="settings-description">언어 설정 기능은 준비 중입니다.</p>
            </div>

            <div className="settings-section">
              <h3 className="settings-section-title">
                <FaLock className="me-2" />
                개인정보 보호
              </h3>
              <p className="settings-description">개인정보 설정은 준비 중입니다.</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  renderLevelSelect = () => {
    const { levelSetting } = this.state;

    return (
      <div className="modal-overlay" onClick={this.handleCloseLevelSelect}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2 className="modal-title">대화 난이도 선택</h2>
            <button className="close-button" onClick={this.handleCloseLevelSelect}>
              <FaTimes />
            </button>
          </div>

          <div className="level-select-content">
            <p className="level-select-description">
              대화 난이도를 선택하세요. 선택한 레벨에 따라 AI의 응답 스타일이 조정됩니다.
            </p>

            {/* 레벨 버튼들 */}
            <div className="level-buttons">
              <button
                className="level-button"
                onClick={() => this.handleSetLevel('novice')}
                disabled={levelSetting}
              >
                <div className="level-button-content">
                  <h4>초보자</h4>
                  <p>쉽고 친절한 설명</p>
                </div>
              </button>

              <button
                className="level-button"
                onClick={() => this.handleSetLevel('intermediate')}
                disabled={levelSetting}
              >
                <div className="level-button-content">
                  <h4>중급자</h4>
                  <p>균형잡힌 설명</p>
                </div>
              </button>

              <button
                className="level-button"
                onClick={() => this.handleSetLevel('expert')}
                disabled={levelSetting}
              >
                <div className="level-button-content">
                  <h4>전문가</h4>
                  <p>전문적이고 심화된 설명</p>
                </div>
              </button>

              <button
                className="level-button"
                onClick={() => this.handleSetLevel('auto')}
                disabled={levelSetting}
              >
                <div className="level-button-content">
                  <h4>자동 조정</h4>
                  <p>상황에 따라 자동 조정</p>
                </div>
              </button>
            </div>

            {levelSetting && (
              <div className="text-center mt-3">
                <FaSpinner className="spinner-icon" />
                <span className="ms-2">레벨 설정 중...</span>
              </div>
            )}
          </div>
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
      loading,
      logoutLoading
    } = this.state;

    if (loading) {
      return (
        <div className="profile-panel">
          <div className="profile-loading">
            <FaSpinner className="spinner-icon" />
            <p>로딩 중...</p>
          </div>
        </div>
      );
    }

    return (
      <div className="profile-panel">
        <div className="profile-header">
          <h2 className="profile-title">프로필</h2>
          <button className="close-button" onClick={this.handleClose}>
            <FaTimes />
          </button>
        </div>

        <div className="profile-content">
          {/* 사용자 정보 섹션 */}
          <div className="profile-info">
            <div className="profile-avatar">
              <FaUser />
            </div>
            <div className="profile-details">
              <h3 className="profile-name">{userInfo?.name || 'Guest'}</h3>
              <p className="profile-role">{userInfo?.role || 'guest'}</p>
              {userInfo?.email && (
                <p className="profile-email">
                  <FaEnvelope className="me-2" />
                  {userInfo.email}
                </p>
              )}
            </div>
          </div>

          {/* 통계 섹션 */}
          <div className="profile-stats">
            <div className="stat-item">
              <span className="stat-label">채팅 세션</span>
              <span className="stat-value">{userInfo?.sessionCount || 0}</span>
            </div>
          </div>

          {/* 액션 버튼들 */}
          <div className="profile-actions">
            {isAuthenticated ? (
              <>
                <button className="action-button" onClick={this.handleOpenSettings}>
                  <FaCog className="me-2" />
                  설정
                </button>
                <button
                  className="action-button logout-button"
                  onClick={this.handleLogoutButton}
                  disabled={logoutLoading}
                >
                  {logoutLoading ? (
                    <>
                      <FaSpinner className="spinner-icon me-2" />
                      로그아웃 중...
                    </>
                  ) : (
                    <>
                      <FaSignOutAlt className="me-2" />
                      로그아웃
                    </>
                  )}
                </button>
              </>
            ) : (
              <>
                <button
                  className="action-button login-button"
                  onClick={() => this.setState({ showLogin: true })}
                >
                  로그인
                </button>
                <button
                  className="action-button signup-button"
                  onClick={() => this.setState({ showSignup: true })}
                >
                  회원가입
                </button>
              </>
            )}

            <button className="action-button danger-button" onClick={this.handleClearSessions}>
              채팅 기록 삭제
            </button>
          </div>
        </div>

        {/* 모달들 */}
        {showLogin && this.renderLoginForm()}
        {showSignup && this.renderSignupForm()}
        {showSettings && this.renderSettings()}
        {showLevelSelect && this.renderLevelSelect()}

        <style jsx>{`
          .profile-panel {
            width: 100%;
            height: 100%;
            background: white;
            display: flex;
            flex-direction: column;
          }

          .profile-loading {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100%;
            color: #666;
          }

          .spinner-icon {
            animation: spin 1s linear infinite;
            font-size: 24px;
            margin-bottom: 10px;
          }

          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }

          .profile-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px;
            border-bottom: 1px solid #e0e0e0;
          }

          .profile-title {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
            color: #333;
          }

          .close-button {
            background: none;
            border: none;
            font-size: 24px;
            color: #666;
            cursor: pointer;
            padding: 5px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: color 0.2s;
          }

          .close-button:hover {
            color: #333;
          }

          .profile-content {
            flex: 1;
            overflow-y: auto;
            padding: 20px;
          }

          .profile-info {
            display: flex;
            align-items: center;
            gap: 15px;
            margin-bottom: 30px;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 10px;
          }

          .profile-avatar {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 28px;
          }

          .profile-details {
            flex: 1;
          }

          .profile-name {
            margin: 0 0 5px 0;
            font-size: 20px;
            font-weight: 600;
            color: #333;
          }

          .profile-role {
            margin: 0 0 5px 0;
            font-size: 14px;
            color: #666;
            text-transform: capitalize;
          }

          .profile-email {
            margin: 0;
            font-size: 14px;
            color: #666;
            display: flex;
            align-items: center;
          }

          .profile-stats {
            display: grid;
            grid-template-columns: 1fr;
            gap: 15px;
            margin-bottom: 30px;
          }

          .stat-item {
            padding: 15px;
            background: #f8f9fa;
            border-radius: 8px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .stat-label {
            font-size: 14px;
            color: #666;
          }

          .stat-value {
            font-size: 24px;
            font-weight: 600;
            color: #667eea;
          }

          .profile-actions {
            display: flex;
            flex-direction: column;
            gap: 10px;
          }

          .action-button {
            padding: 12px;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #f8f9fa;
            color: #333;
          }

          .action-button:hover {
            background: #e9ecef;
          }

          .login-button {
            background: #667eea;
            color: white;
          }

          .login-button:hover {
            background: #5568d3;
          }

          .signup-button {
            background: #764ba2;
            color: white;
          }

          .signup-button:hover {
            background: #63408a;
          }

          .logout-button {
            background: #dc3545;
            color: white;
          }

          .logout-button:hover {
            background: #c82333;
          }

          .logout-button:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }

          .danger-button {
            background: #ff6b6b;
            color: white;
          }

          .danger-button:hover {
            background: #ff5252;
          }

          /* 모달 스타일 */
          .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            padding: 20px;
          }

          .modal-content {
            background: white;
            border-radius: 10px;
            max-width: 500px;
            width: 100%;
            max-height: 90vh;
            overflow-y: auto;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
          }

          .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px;
            border-bottom: 1px solid #e0e0e0;
          }

          .modal-title {
            margin: 0;
            font-size: 20px;
            font-weight: 600;
            color: #333;
          }

          /* 폼 스타일 */
          .login-form,
          .signup-form {
            padding: 20px;
          }

          .form-group {
            margin-bottom: 20px;
          }

          .form-group label {
            display: block;
            margin-bottom: 8px;
            font-weight: 500;
            color: #333;
            font-size: 14px;
          }

          .form-control {
            width: 100%;
            padding: 10px 12px;
            border: 1px solid #ddd;
            border-radius: 6px;
            font-size: 14px;
            transition: border-color 0.2s;
          }

          .form-control:focus {
            outline: none;
            border-color: #667eea;
          }

          .form-control.is-invalid {
            border-color: #dc3545;
          }

          .invalid-feedback {
            display: block;
            color: #dc3545;
            font-size: 12px;
            margin-top: 5px;
          }

          .password-input-wrapper {
            position: relative;
            display: flex;
            align-items: center;
          }

          .password-toggle {
            position: absolute;
            right: 10px;
            background: none;
            border: none;
            color: #666;
            cursor: pointer;
            padding: 5px;
            display: flex;
            align-items: center;
            font-size: 16px;
          }

          .password-toggle:hover {
            color: #333;
          }

          .alert {
            padding: 12px;
            border-radius: 6px;
            margin-bottom: 15px;
          }

          .alert-danger {
            background: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
          }

          .form-footer {
            margin-top: 20px;
            text-align: center;
            font-size: 14px;
            color: #666;
          }

          .link-button {
            background: none;
            border: none;
            color: #667eea;
            cursor: pointer;
            font-weight: 500;
            padding: 0;
          }

          .link-button:hover {
            text-decoration: underline;
          }

          /* 설정 스타일 */
          .settings-content {
            padding: 20px;
          }

          .settings-section {
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 1px solid #e0e0e0;
          }

          .settings-section:last-child {
            border-bottom: none;
          }

          .settings-section-title {
            font-size: 16px;
            font-weight: 600;
            color: #333;
            margin-bottom: 10px;
            display: flex;
            align-items: center;
          }

          .settings-description {
            font-size: 14px;
            color: #666;
            margin-bottom: 15px;
          }

          /* 레벨 선택 스타일 */
          .level-select-content {
            padding: 20px;
          }

          .level-select-description {
            font-size: 14px;
            color: #666;
            margin-bottom: 20px;
            text-align: center;
          }

          .level-buttons {
            display: grid;
            grid-template-columns

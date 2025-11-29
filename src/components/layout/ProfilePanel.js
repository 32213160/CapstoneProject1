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
    loginFormData: { username: '', password: '' },
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
    // Azure Static Web Apps의 리버스 프록시를 사용하므로 상대 경로 사용
    const BASE_URL = ''; // 프로덕션/로컬 모두 상대 경로로 통일

    try {
      const response = await fetch(`${BASE_URL}/api/auth/status`, {
        method: 'GET',
        credentials: 'include',
        mode: 'cors', // CORS 모드 명시
        headers: {
          'Accept': 'application/json'
        }
      });

      // JSON 파싱 전에 체크
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('text/html')) {
        console.error('HTML 응답 수신 - API 라우팅 실패');
        this.setState({
          isAuthenticated: false,
          userInfo: null,
          loading: false
        });
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

  // 로그인된 사용자 정보 가져오기
  getUserInfo = async () => {
    // Azure Static Web Apps의 리버스 프록시를 사용하므로 상대 경로 사용
    const BASE_URL = ''; // 프로덕션/로컬 모두 상대 경로로 통일

    try {
      const response = await fetch(`${BASE_URL}/api/auth/me`, {
        method: 'GET',
        credentials: 'include',
        mode: 'cors', // CORS 모드 명시
        headers: {
          'Accept': 'application/json'
        }
      });

      // JSON 파싱 전에 체크
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('text/html')) {
        console.error('HTML 응답 수신 - API 라우팅 실패');
        this.setState({
          isAuthenticated: false,
          userInfo: null,
          loading: false
        });
        this.loadLocalUserInfo();
        return;
      }

      if (response.ok) {
        const data = await response.json();
        this.setState({ userInfo: data.user, isAuthenticated: true });
      }
    } catch (error) {
      console.error('사용자 정보 가져오기 실패:', error);
    }
  };

  // 세션 개수 조회
  getUserSessionCount = async () => {
    // Azure Static Web Apps의 리버스 프록시를 사용하므로 상대 경로 사용
    const BASE_URL = ''; // 프로덕션/로컬 모두 상대 경로로 통일

    try {
      const response = await fetch(`${BASE_URL}/api/chats-of-user/my-sessions`, {
        method: 'GET',
        credentials: 'include',
        mode: 'cors', // CORS 모드 명시
        headers: {
          'Accept': 'application/json'
        }
      });

      // JSON 파싱 전에 체크
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('text/html')) {
        console.error('HTML 응답 수신 - API 라우팅 실패');
        this.setState({
          isAuthenticated: false,
          userInfo: null,
          loading: false
        });
        this.loadLocalUserInfo();
        return;
      }

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
    // Azure Static Web Apps의 리버스 프록시를 사용하므로 상대 경로 사용
    const BASE_URL = ''; // 프로덕션/로컬 모두 상대 경로로 통일

    this.setState({ levelSetting: true });

    try {
      const response = await fetch(`${BASE_URL}/api/auth/setlevel?level=${level}`, {
        method: 'POST',
        credentials: 'include',
        mode: 'cors', // CORS 모드 명시
        headers: {
          'Accept': 'application/json'
        }
      });

      // JSON 파싱 전에 체크
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('text/html')) {
        console.error('HTML 응답 수신 - API 라우팅 실패');
        alert('레벨 설정 중 오류가 발생했습니다.');
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

    // Azure Static Web Apps의 리버스 프록시를 사용하므로 상대 경로 사용
    const BASE_URL = ''; // 프로덕션/로컬 모두 상대 경로로 통일
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
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          username: loginFormData.username,
          password: loginFormData.password
        }),
        credentials: 'include',
        mode: 'cors' // CORS 모드 명시
      });

      // JSON 파싱 전에 체크
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('text/html')) {
        console.error('HTML 응답 수신 - API 라우팅 실패');
        this.setState({
          loginError: '로그인 서버에 연결할 수 없습니다.',
          loginLoading: false
        });
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

    // Azure Static Web Apps의 리버스 프록시를 사용하므로 상대 경로 사용
    const BASE_URL = ''; // 프로덕션/로컬 모두 상대 경로로 통일
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
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          username: signupFormData.username,
          password: signupFormData.password,
          email: signupFormData.email,
          name: signupFormData.name
        }),
        credentials: 'include',
        mode: 'cors' // CORS 모드 명시
      });

      // JSON 파싱 전에 체크
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('text/html')) {
        console.error('HTML 응답 수신 - API 라우팅 실패');
        alert('회원가입 서버에 연결할 수 없습니다.');
        this.setState({ signupLoading: false });
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
    // Azure Static Web Apps의 리버스 프록시를 사용하므로 상대 경로 사용
    const BASE_URL = ''; // 프로덕션/로컬 모두 상대 경로로 통일
    const { logoutLoading } = this.state;

    if (logoutLoading) return;

    const confirmed = window.confirm('로그아웃 하시겠습니까?');
    if (!confirmed) return;

    this.setState({ logoutLoading: true });

    try {
      const response = await fetch(`${BASE_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
        mode: 'cors', // CORS 모드 명시
        headers: {
          'Accept': 'application/json'
        }
      });

      // JSON 파싱 전에 체크
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('text/html')) {
        console.error('HTML 응답 수신 - API 라우팅 실패');
        // 로그아웃은 로컬에서도 처리
        localStorage.removeItem('sessionId');
        localStorage.removeItem('userInfo');
        this.setState({
          isAuthenticated: false,
          userInfo: null,
          showLogin: false,
          showSignup: false,
          logoutLoading: false
        });
        this.loadLocalUserInfo();
        return;
      }

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
      <div className="login-form">
        <h3 className="text-center mb-4">로그인</h3>
        {loginError && (
          <div className="alert alert-danger" role="alert">
            {loginError}
          </div>
        )}
        <form onSubmit={this.handleLoginSubmit}>
          <div className="mb-3">
            <label htmlFor="username" className="form-label">
              아이디
            </label>
            <input
              type="text"
              className="form-control"
              id="username"
              name="username"
              value={loginFormData.username}
              onChange={this.handleLoginChange}
              disabled={loginLoading}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="password" className="form-label">
              비밀번호
            </label>
            <div className="input-group">
              <input
                type={loginShowPassword ? 'text' : 'password'}
                className="form-control"
                id="password"
                name="password"
                value={loginFormData.password}
                onChange={this.handleLoginChange}
                disabled={loginLoading}
              />
              <button
                className="btn btn-outline-secondary"
                type="button"
                onClick={() => this.setState(prev => ({ loginShowPassword: !prev.loginShowPassword }))}
                disabled={loginLoading}
              >
                {loginShowPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>
          <button type="submit" className="btn btn-primary w-100 mb-3" disabled={loginLoading}>
            {loginLoading ? <><FaSpinner className="spinner-icon me-2" />로그인 중...</> : '로그인'}
          </button>
        </form>
        <div className="text-center">
          <p className="mb-0">
            계정이 없으신가요?{' '}
            <button
              className="btn btn-link p-0"
              onClick={() => this.setState({ showLogin: false, showSignup: true })}
              disabled={loginLoading}
            >
              회원가입
            </button>
          </p>
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
      <div className="signup-form">
        <h3 className="text-center mb-4">회원가입</h3>
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
              disabled={signupLoading}
            />
            {signupErrors.username && <div className="invalid-feedback">{signupErrors.username}</div>}
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
              disabled={signupLoading}
            />
            {signupErrors.email && <div className="invalid-feedback">{signupErrors.email}</div>}
          </div>

          <div className="mb-3">
            <label htmlFor="signup-password" className="form-label">
              비밀번호 <span className="text-danger">*</span>
            </label>
            <div className="input-group">
              <input
                type={signupShowPassword ? 'text' : 'password'}
                className={`form-control ${signupErrors.password ? 'is-invalid' : ''}`}
                id="signup-password"
                name="password"
                value={signupFormData.password}
                onChange={this.handleSignupChange}
                disabled={signupLoading}
              />
              <button
                className="btn btn-outline-secondary"
                type="button"
                onClick={() => this.setState(prev => ({ signupShowPassword: !prev.signupShowPassword }))}
                disabled={signupLoading}
              >
                {signupShowPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
              {signupErrors.password && <div className="invalid-feedback">{signupErrors.password}</div>}
            </div>
          </div>

          <div className="mb-3">
            <label htmlFor="signup-confirmPassword" className="form-label">
              비밀번호 확인 <span className="text-danger">*</span>
            </label>
            <div className="input-group">
              <input
                type={signupShowConfirmPassword ? 'text' : 'password'}
                className={`form-control ${signupErrors.confirmPassword ? 'is-invalid' : ''}`}
                id="signup-confirmPassword"
                name="confirmPassword"
                value={signupFormData.confirmPassword}
                onChange={this.handleSignupChange}
                disabled={signupLoading}
              />
              <button
                className="btn btn-outline-secondary"
                type="button"
                onClick={() => this.setState(prev => ({ signupShowConfirmPassword: !prev.signupShowConfirmPassword }))}
                disabled={signupLoading}
              >
                {signupShowConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
              {signupErrors.confirmPassword && (
                <div className="invalid-feedback">{signupErrors.confirmPassword}</div>
              )}
            </div>
          </div>

          <div className="mb-3">
            <label htmlFor="signup-name" className="form-label">
              실명 <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              className={`form-control ${signupErrors.name ? 'is-invalid' : ''}`}
              id="signup-name"
              name="name"
              value={signupFormData.name}
              onChange={this.handleSignupChange}
              disabled={signupLoading}
            />
            {signupErrors.name && <div className="invalid-feedback">{signupErrors.name}</div>}
          </div>

          <button type="submit" className="btn btn-success w-100 mb-3" disabled={signupLoading}>
            {signupLoading ? <><FaSpinner className="spinner-icon me-2" />가입 중...</> : '회원가입'}
          </button>

          <button
            type="button"
            className="btn btn-secondary w-100 mb-3"
            onClick={this.fillTestAccount}
            disabled={signupLoading}
          >
            <FaInfoCircle className="me-2" />
            테스트 계정 자동 입력
          </button>
        </form>

        <div className="text-center">
          <p className="mb-0">
            이미 계정이 있으신가요?{' '}
            <button
              className="btn btn-link p-0"
              onClick={() => this.setState({ showSignup: false, showLogin: true })}
              disabled={signupLoading}
            >
              로그인
            </button>
          </p>
        </div>
      </div>
    );
  };

  renderLevelSelectModal = () => {
    const { showLevelSelect, levelSetting, userInfo } = this.state;

    if (!showLevelSelect) return null;

    return (
      <div className="modal-overlay" onClick={this.handleCloseLevelSelect}>
        <div className="modal-content level-select-modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h4>난이도 선택</h4>
            <button className="close-btn" onClick={this.handleCloseLevelSelect} disabled={levelSetting}>
              <FaTimes />
            </button>
          </div>
          <div className="modal-body">
            <p className="text-muted mb-4">
              대화 난이도를 선택하세요. 선택한 레벨에 따라 AI의 응답 스타일이 조정됩니다.
            </p>

            {/* 레벨 버튼들 */}
            <div className="level-buttons">
              <button
                className={`level-btn ${userInfo?.level === 'novice' ? 'active' : ''}`}
                onClick={() => this.handleSetLevel('novice')}
                disabled={levelSetting}
              >
                <div className="level-icon">🌱</div>
                <div className="level-name">초보자</div>
                <div className="level-desc">쉽고 자세한 설명</div>
              </button>

              <button
                className={`level-btn ${userInfo?.level === 'intermediate' ? 'active' : ''}`}
                onClick={() => this.handleSetLevel('intermediate')}
                disabled={levelSetting}
              >
                <div className="level-icon">📚</div>
                <div className="level-name">중급자</div>
                <div className="level-desc">적절한 깊이의 설명</div>
              </button>

              <button
                className={`level-btn ${userInfo?.level === 'expert' ? 'active' : ''}`}
                onClick={() => this.handleSetLevel('expert')}
                disabled={levelSetting}
              >
                <div className="level-icon">🎓</div>
                <div className="level-name">전문가</div>
                <div className="level-desc">전문적이고 상세한 설명</div>
              </button>

              <button
                className={`level-btn ${userInfo?.level === 'auto' ? 'active' : ''}`}
                onClick={() => this.handleSetLevel('auto')}
                disabled={levelSetting}
              >
                <div className="level-icon">🤖</div>
                <div className="level-name">자동 조정</div>
                <div className="level-desc">상황에 맞게 자동 조정</div>
              </button>
            </div>

            {levelSetting && (
              <div className="text-center mt-3">
                <FaSpinner className="spinner-icon" /> 설정 중...
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
      loading,
      logoutLoading
    } = this.state;

    return (
      <>
        <div className="profile-panel-overlay" onClick={this.handleClose}>
          <div className="profile-panel" onClick={(e) => e.stopPropagation()}>
            <div className="profile-header">
              <h3>프로필</h3>
              <button className="close-btn" onClick={this.handleClose}>
                <FaTimes />
              </button>
            </div>

            <div className="profile-content">
              {loading ? (
                <div className="text-center py-5">
                  <FaSpinner className="spinner-icon" /> 로딩 중...
                </div>
              ) : !isAuthenticated ? (
                showLogin ? (
                  this.renderLoginForm()
                ) : showSignup ? (
                  this.renderSignupForm()
                ) : (
                  <div className="guest-info">
                    <div className="user-avatar">
                      <FaUser size={48} />
                    </div>
                    <h4>게스트 모드</h4>
                    <p className="text-muted">로그인하지 않은 상태입니다</p>
                    <div className="user-stats">
                      <div className="stat-item">
                        <span className="stat-label">채팅 세션</span>
                        <span className="stat-value">{userInfo?.sessionCount || 0}개</span>
                      </div>
                    </div>
                    <div className="action-buttons">
                      <button
                        className="btn btn-primary w-100 mb-2"
                        onClick={() => this.setState({ showLogin: true })}
                      >
                        로그인
                      </button>
                      <button
                        className="btn btn-outline-primary w-100"
                        onClick={() => this.setState({ showSignup: true })}
                      >
                        회원가입
                      </button>
                    </div>
                  </div>
                )
              ) : (
                <div className="user-info">
                  <div className="user-avatar">
                    <FaUser size={48} />
                  </div>
                  <h4>{userInfo?.name || '사용자'}</h4>
                  <p className="text-muted">@{userInfo?.username}</p>

                  <div className="user-stats">
                    <div className="stat-item">
                      <span className="stat-label">채팅 세션</span>
                      <span className="stat-value">{userInfo?.sessionCount || 0}개</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">등급</span>
                      <span className="stat-value">{userInfo?.role || 'USER'}</span>
                    </div>
                  </div>

                  <div className="action-buttons">
                    <button className="btn btn-outline-primary w-100 mb-2" onClick={this.handleOpenSettings}>
                      <FaCog className="me-2" />
                      설정
                    </button>
                    <button className="btn btn-outline-danger w-100 mb-2" onClick={this.handleClearSessions}>
                      채팅 기록 삭제
                    </button>
                    <button
                      className="btn btn-danger w-100"
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
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {showSettings && (
          <div className="modal-overlay" onClick={this.handleCloseSettings}>
            <div className="modal-content settings-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h4>설정</h4>
                <button className="close-btn" onClick={this.handleCloseSettings}>
                  <FaTimes />
                </button>
              </div>
              <div className="modal-body">
                <div className="settings-section">
                  <h5>
                    <FaUser className="me-2" />
                    사용자 정보
                  </h5>
                  <div className="info-item">
                    <span className="label">이름:</span>
                    <span className="value">{userInfo?.name}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">아이디:</span>
                    <span className="value">{userInfo?.username}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">이메일:</span>
                    <span className="value">{userInfo?.email}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">등급:</span>
                    <span className="value">{userInfo?.role}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">레벨:</span>
                    <span className="value">{this.getLevelDisplayName(userInfo?.level)}</span>
                    <button className="btn btn-sm btn-outline-primary" onClick={this.handleOpenLevelSelect}>
                      변경
                    </button>
                  </div>
                </div>

                <div className="settings-section">
                  <h5>
                    <FaPalette className="me-2" />
                    테마
                  </h5>
                  <p className="text-muted">곧 지원 예정</p>
                </div>

                <div className="settings-section">
                  <h5>
                    <FaGlobe className="me-2" />
                    언어
                  </h5>
                  <p className="text-muted">곧 지원 예정</p>
                </div>

                <div className="settings-section">
                  <h5>
                    <FaBell className="me-2" />
                    알림
                  </h5>
                  <p className="text-muted">곧 지원 예정</p>
                </div>

                <div className="settings-section">
                  <h5>
                    <FaLock className="me-2" />
                    개인정보
                  </h5>
                  <p className="text-muted">곧 지원 예정</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {this.renderLevelSelectModal()}
      </>
    );
  }
}

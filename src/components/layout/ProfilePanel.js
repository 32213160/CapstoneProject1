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
    signupFormData: { username: '', email: '', password: '', confirmPassword: '', name: '' },
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
        const data = await response.json();
        this.setState({ userInfo: data.user, isAuthenticated: true });
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
        const data = await response.json();
        // sessions 배열의 길이를 세션 개수로 사용
        const sessionCount = data.chatSessions ? data.chatSessions.length : 0;
        this.setState(prevState => ({
          userInfo: { ...prevState.userInfo, sessionCount: sessionCount }
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
      this.setState({ userInfo: { name: 'guest', role: 'guest', sessionCount: sessions.length } });
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
      this.setState({ userInfo: { ...this.state.userInfo, sessionCount: 0 } });
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
      loginFormData: { ...prevState.loginFormData, [name]: value },
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

      const data = await response.json();

      // 로그인 성공 시
      if (response.ok && data.result === 'success') {
        localStorage.setItem('sessionId', data.sessionId);
        localStorage.setItem('userInfo', JSON.stringify(data.user));
        // 상태 업데이트 및 사용자 정보 로드
        this.setState({ isAuthenticated: true, showLogin: false, loginFormData: { username: '', password: '' } });
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
      signupFormData: { ...prevState.signupFormData, [name]: value },
      signupErrors: { ...prevState.signupErrors, [name]: '' }
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

    if (!signupFormData.username.trim()) newErrors.username = '아이디를 입력해주세요.';
    else if (signupFormData.username.length < 4) newErrors.username = '아이디는 4자 이상이어야 합니다.';

    if (!signupFormData.email.trim()) newErrors.email = '이메일을 입력해주세요.';
    else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(signupFormData.email)) newErrors.email = '유효한 이메일 주소가 아닙니다.';
    }

    if (!signupFormData.password) newErrors.password = '비밀번호를 입력해주세요.';
    else if (signupFormData.password.length < 6) newErrors.password = '비밀번호는 6자 이상이어야 합니다.';

    if (signupFormData.password !== signupFormData.confirmPassword) newErrors.confirmPassword = '비밀번호가 일치하지 않습니다.';

    if (!signupFormData.name.trim()) newErrors.name = '실명을 입력해주세요.';

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

      const data = await response.json();

      if (response.ok && data.result === 'success') {
        alert(`회원가입이 완료되었습니다!\n아이디: ${signupFormData.username}\n이제 로그인할 수 있습니다.`);
        this.setState({
          showSignup: false,
          showLogin: true,
          signupFormData: { username: '', email: '', password: '', confirmPassword: '', name: '' }
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

      await response.json();

      // 로컬스토리지에 저장했던 인증 정보 삭제
      localStorage.removeItem('sessionId');
      localStorage.removeItem('userInfo');

      // 상태 업데이트
      this.setState({ isAuthenticated: false, userInfo: null, showLogin: false, showSignup: false });
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
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '28px',
          borderRadius: '12px',
          width: '90%',
          maxWidth: '400px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 600 }}>로그인</h3>
            <button onClick={() => this.setState({ showLogin: false })} 
              style={{
                background: 'none',
                border: 'none',
                fontSize: '20px',
                cursor: 'pointer',
                color: '#666'
              }}>
              <FaTimes />
            </button>
          </div>

          <form onSubmit={this.handleLoginSubmit}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                fontSize: '14px',
                marginBottom: '6px',
                fontWeight: 500
              }}>
                <FaUser style={{ marginRight: '6px' }} />
                아이디
              </label>
              <input
                type="text"
                name="username"
                value={loginFormData.username}
                onChange={this.handleLoginChange}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
                placeholder="아이디를 입력하세요"
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                fontSize: '14px',
                marginBottom: '6px',
                fontWeight: 500
              }}>
                <FaLock style={{ marginRight: '6px' }} />
                비밀번호
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={loginShowPassword ? 'text' : 'password'}
                  name="password"
                  value={loginFormData.password}
                  onChange={this.handleLoginChange}
                  style={{
                    width: '100%',
                    padding: '10px',
                    paddingRight: '40px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                  placeholder="비밀번호를 입력하세요"
                />
                <button
                  type="button"
                  onClick={() => this.setState({ loginShowPassword: !loginShowPassword })}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#666'
                  }}
                >
                  {loginShowPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {loginError && (
              <div style={{
                backgroundColor: '#fee',
                color: '#c33',
                padding: '10px',
                borderRadius: '6px',
                marginBottom: '16px',
                fontSize: '13px'
              }}>
                {loginError}
              </div>
            )}

            <button
              type="submit"
              disabled={loginLoading}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: loginLoading ? '#ccc' : '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '15px',
                fontWeight: 600,
                cursor: loginLoading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {loginLoading ? <><FaSpinner style={{ marginRight: '8px', animation: 'spin 1s linear infinite' }} /> 로그인 중...</> : '로그인'}
            </button>
          </form>

          <div style={{ marginTop: '16px', textAlign: 'center', fontSize: '13px' }}>
            계정이 없으신가요?{' '}
            <button
              onClick={() => this.setState({ showLogin: false, showSignup: true })}
              style={{
                background: 'none',
                border: 'none',
                color: '#007bff',
                cursor: 'pointer',
                textDecoration: 'underline',
                fontSize: '13px'
              }}
            >
              회원가입
            </button>
          </div>
        </div>
      </div>
    );
  };

  renderSignupForm = () => {
    const { signupFormData, signupShowPassword, signupShowConfirmPassword, signupErrors, signupLoading } = this.state;

    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '28px',
          borderRadius: '12px',
          width: '90%',
          maxWidth: '450px',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 600 }}>회원가입</h3>
            <button onClick={() => this.setState({ showSignup: false })}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '20px',
                cursor: 'pointer',
                color: '#666'
              }}>
              <FaTimes />
            </button>
          </div>

          <form onSubmit={this.handleSignupSubmit}>
            {/* 아이디 */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                fontSize: '14px',
                marginBottom: '6px',
                fontWeight: 500
              }}>
                <FaUser style={{ marginRight: '6px' }} />
                아이디
              </label>
              <input
                type="text"
                name="username"
                value={signupFormData.username}
                onChange={this.handleSignupChange}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: signupErrors.username ? '1px solid #c33' : '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
                placeholder="4자 이상의 아이디"
              />
              {signupErrors.username && (
                <div style={{ color: '#c33', fontSize: '12px', marginTop: '4px' }}>
                  {signupErrors.username}
                </div>
              )}
            </div>

            {/* 이메일 */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                fontSize: '14px',
                marginBottom: '6px',
                fontWeight: 500
              }}>
                <FaEnvelope style={{ marginRight: '6px' }} />
                이메일
              </label>
              <input
                type="email"
                name="email"
                value={signupFormData.email}
                onChange={this.handleSignupChange}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: signupErrors.email ? '1px solid #c33' : '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
                placeholder="example@email.com"
              />
              {signupErrors.email && (
                <div style={{ color: '#c33', fontSize: '12px', marginTop: '4px' }}>
                  {signupErrors.email}
                </div>
              )}
            </div>

            {/* 비밀번호 */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                fontSize: '14px',
                marginBottom: '6px',
                fontWeight: 500
              }}>
                <FaLock style={{ marginRight: '6px' }} />
                비밀번호
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={signupShowPassword ? 'text' : 'password'}
                  name="password"
                  value={signupFormData.password}
                  onChange={this.handleSignupChange}
                  style={{
                    width: '100%',
                    padding: '10px',
                    paddingRight: '40px',
                    border: signupErrors.password ? '1px solid #c33' : '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                  placeholder="6자 이상의 비밀번호"
                />
                <button
                  type="button"
                  onClick={() => this.setState({ signupShowPassword: !signupShowPassword })}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#666'
                  }}
                >
                  {signupShowPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {signupErrors.password && (
                <div style={{ color: '#c33', fontSize: '12px', marginTop: '4px' }}>
                  {signupErrors.password}
                </div>
              )}
            </div>

            {/* 비밀번호 확인 */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                fontSize: '14px',
                marginBottom: '6px',
                fontWeight: 500
              }}>
                <FaLock style={{ marginRight: '6px' }} />
                비밀번호 확인
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={signupShowConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={signupFormData.confirmPassword}
                  onChange={this.handleSignupChange}
                  style={{
                    width: '100%',
                    padding: '10px',
                    paddingRight: '40px',
                    border: signupErrors.confirmPassword ? '1px solid #c33' : '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                  placeholder="비밀번호 재입력"
                />
                <button
                  type="button"
                  onClick={() => this.setState({ signupShowConfirmPassword: !signupShowConfirmPassword })}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#666'
                  }}
                >
                  {signupShowConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {signupErrors.confirmPassword && (
                <div style={{ color: '#c33', fontSize: '12px', marginTop: '4px' }}>
                  {signupErrors.confirmPassword}
                </div>
              )}
            </div>

            {/* 이름 */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                fontSize: '14px',
                marginBottom: '6px',
                fontWeight: 500
              }}>
                <FaInfoCircle style={{ marginRight: '6px' }} />
                실명
              </label>
              <input
                type="text"
                name="name"
                value={signupFormData.name}
                onChange={this.handleSignupChange}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: signupErrors.name ? '1px solid #c33' : '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
                placeholder="실명을 입력하세요"
              />
              {signupErrors.name && (
                <div style={{ color: '#c33', fontSize: '12px', marginTop: '4px' }}>
                  {signupErrors.name}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={signupLoading}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: signupLoading ? '#ccc' : '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '15px',
                fontWeight: 600,
                cursor: signupLoading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {signupLoading ? <><FaSpinner style={{ marginRight: '8px', animation: 'spin 1s linear infinite' }} /> 회원가입 중...</> : '회원가입'}
            </button>

            {/* 테스트 버튼 (개발용) */}
            <button
              type="button"
              onClick={this.fillTestAccount}
              style={{
                width: '100%',
                padding: '10px',
                marginTop: '10px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '13px',
                cursor: 'pointer'
              }}
            >
              테스트 계정 정보 채우기
            </button>
          </form>

          <div style={{ marginTop: '16px', textAlign: 'center', fontSize: '13px' }}>
            이미 계정이 있으신가요?{' '}
            <button
              onClick={() => this.setState({ showSignup: false, showLogin: true })}
              style={{
                background: 'none',
                border: 'none',
                color: '#007bff',
                cursor: 'pointer',
                textDecoration: 'underline',
                fontSize: '13px'
              }}
            >
              로그인
            </button>
          </div>
        </div>
      </div>
    );
  };

  renderSettings = () => {
    const { userInfo } = this.state;

    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '28px',
          borderRadius: '12px',
          width: '90%',
          maxWidth: '500px',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 600 }}>설정</h3>
            <button onClick={this.handleCloseSettings}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '20px',
                cursor: 'pointer',
                color: '#666'
              }}>
              <FaTimes />
            </button>
          </div>

          {/* 설정 항목들 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '14px',
                backgroundColor: '#f8f9fa',
                border: '1px solid #ddd',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '15px'
              }}
            >
              <FaBell style={{ marginRight: '12px', color: '#007bff' }} />
              알림 설정
            </button>

            <button
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '14px',
                backgroundColor: '#f8f9fa',
                border: '1px solid #ddd',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '15px'
              }}
            >
              <FaPalette style={{ marginRight: '12px', color: '#28a745' }} />
              테마 설정
            </button>

            <button
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '14px',
                backgroundColor: '#f8f9fa',
                border: '1px solid #ddd',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '15px'
              }}
            >
              <FaGlobe style={{ marginRight: '12px', color: '#ffc107' }} />
              언어 설정
            </button>

            {userInfo && userInfo.role !== 'guest' && (
              <button
                onClick={this.handleOpenLevelSelect}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '14px',
                  backgroundColor: '#f8f9fa',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '15px'
                }}
              >
                <FaCog style={{ marginRight: '12px', color: '#6c757d' }} />
                대화 난이도 설정
              </button>
            )}

            <button
              onClick={this.handleClearSessions}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '14px',
                backgroundColor: '#fff3cd',
                border: '1px solid #ffc107',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '15px',
                color: '#856404'
              }}
            >
              <FaInfoCircle style={{ marginRight: '12px' }} />
              채팅 기록 삭제
            </button>
          </div>
        </div>
      </div>
    );
  };

  renderLevelSelect = () => {
    const { userInfo, levelSetting } = this.state;
    const currentLevel = userInfo?.level || 'auto';

    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1001
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '28px',
          borderRadius: '12px',
          width: '90%',
          maxWidth: '450px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 600 }}>대화 난이도 설정</h3>
            <button onClick={this.handleCloseLevelSelect}
              disabled={levelSetting}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '20px',
                cursor: levelSetting ? 'not-allowed' : 'pointer',
                color: '#666'
              }}>
              <FaTimes />
            </button>
          </div>

          <p style={{ marginBottom: '20px', color: '#666', fontSize: '14px' }}>
            대화 난이도를 선택하세요. 선택한 레벨에 따라 AI의 응답 스타일이 조정됩니다.
          </p>

          {/* 레벨 버튼들 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { value: 'novice', label: '초보자', desc: '쉽고 간단한 설명', color: '#28a745' },
              { value: 'intermediate', label: '중급자', desc: '적절한 난이도의 설명', color: '#007bff' },
              { value: 'expert', label: '전문가', desc: '전문적이고 상세한 설명', color: '#6f42c1' },
              { value: 'auto', label: '자동 조정', desc: '대화 내용에 따라 자동 조정', color: '#6c757d' }
            ].map(level => (
              <button
                key={level.value}
                onClick={() => this.handleSetLevel(level.value)}
                disabled={levelSetting}
                style={{
                  padding: '16px',
                  backgroundColor: currentLevel === level.value ? level.color : '#f8f9fa',
                  color: currentLevel === level.value ? 'white' : '#333',
                  border: currentLevel === level.value ? `2px solid ${level.color}` : '1px solid #ddd',
                  borderRadius: '8px',
                  cursor: levelSetting ? 'not-allowed' : 'pointer',
                  textAlign: 'left',
                  fontSize: '15px',
                  fontWeight: currentLevel === level.value ? 600 : 400,
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ fontWeight: 600, marginBottom: '4px' }}>{level.label}</div>
                <div style={{ fontSize: '13px', opacity: 0.8 }}>{level.desc}</div>
              </button>
            ))}
          </div>

          {levelSetting && (
            <div style={{
              marginTop: '16px',
              textAlign: 'center',
              color: '#666',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <FaSpinner style={{ marginRight: '8px', animation: 'spin 1s linear infinite' }} />
              설정 중...
            </div>
          )}
        </div>
      </div>
    );
  };

  render() {
    const { isOpen } = this.props;
    const { isAuthenticated, userInfo, showLogin, showSignup, showSettings, showLevelSelect, loading } = this.state;

    if (!isOpen) return null;

    return (
      <>
        <div style={{
          position: 'fixed',
          top: 0,
          right: 0,
          width: '320px',
          height: '100vh',
          backgroundColor: '#f8f9fa',
          boxShadow: '-2px 0 8px rgba(0,0,0,0.1)',
          zIndex: 100,
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* 헤더 */}
          <div style={{
            padding: '20px',
            borderBottom: '1px solid #dee2e6',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>프로필</h2>
            <button onClick={this.handleClose}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '20px',
                cursor: 'pointer',
                color: '#666'
              }}>
              <FaTimes />
            </button>
          </div>

          {/* 본문 */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <FaSpinner style={{ fontSize: '32px', color: '#007bff', animation: 'spin 1s linear infinite' }} />
                <p style={{ marginTop: '16px', color: '#666' }}>로딩 중...</p>
              </div>
            ) : (
              <>
                {/* 사용자 정보 카드 */}
                <div style={{
                  backgroundColor: 'white',
                  padding: '20px',
                  borderRadius: '12px',
                  marginBottom: '20px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '16px'
                  }}>
                    <div style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '50%',
                      backgroundColor: isAuthenticated ? '#007bff' : '#6c757d',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: '16px'
                    }}>
                      <FaUser style={{ fontSize: '28px', color: 'white' }} />
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>
                        {userInfo?.name || 'Guest'}
                      </h3>
                      <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#666' }}>
                        {userInfo?.role === 'guest' ? '게스트' : userInfo?.role || '사용자'}
                      </p>
                    </div>
                  </div>

                  {userInfo && (
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-around',
                      paddingTop: '16px',
                      borderTop: '1px solid #dee2e6'
                    }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '18px', fontWeight: 600, color: '#007bff' }}>
                          {userInfo.sessionCount || 0}
                        </div>
                        <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                          채팅 세션
                        </div>
                      </div>
                      {isAuthenticated && userInfo.level && (
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '18px', fontWeight: 600, color: '#28a745' }}>
                            {this.getLevelDisplayName(userInfo.level)}
                          </div>
                          <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                            대화 레벨
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* 로그인/로그아웃 버튼 */}
                {!isAuthenticated ? (
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                    <button
                      onClick={() => this.setState({ showLogin: true })}
                      style={{
                        flex: 1,
                        padding: '12px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: 600
                      }}
                    >
                      로그인
                    </button>
                    <button
                      onClick={() => this.setState({ showSignup: true })}
                      style={{
                        flex: 1,
                        padding: '12px',
                        backgroundColor: '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: 600
                      }}
                    >
                      회원가입
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={this.handleLogoutButton}
                    disabled={this.state.logoutLoading}
                    style={{
                      width: '100%',
                      padding: '12px',
                      backgroundColor: this.state.logoutLoading ? '#ccc' : '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: this.state.logoutLoading ? 'not-allowed' : 'pointer',
                      fontSize: '14px',
                      fontWeight: 600,
                      marginBottom: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {this.state.logoutLoading ? (
                      <>
                        <FaSpinner style={{ marginRight: '8px', animation: 'spin 1s linear infinite' }} />
                        로그아웃 중...
                      </>
                    ) : (
                      <>
                        <FaSignOutAlt style={{ marginRight: '8px' }} />
                        로그아웃
                      </>
                    )}
                  </button>
                )}

                {/* 설정 버튼 */}
                <button
                  onClick={this.handleOpenSettings}
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: 'white',
                    color: '#333',
                    border: '1px solid #dee2e6',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <FaCog style={{ marginRight: '8px' }} />
                  설정
                </button>

                {/* 게스트 안내 메시지 */}
                {!isAuthenticated && (
                  <div style={{
                    marginTop: '20px',
                    padding: '16px',
                    backgroundColor: '#fff3cd',
                    borderRadius: '8px',
                    fontSize: '13px',
                    color: '#856404'
                  }}>
                    <FaInfoCircle style={{ marginRight: '8px' }} />
                    로그인하지 않은 상태입니다. 일부 기능이 제한될 수 있습니다.
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* 모달들 */}
        {showLogin && this.renderLoginForm()}
        {showSignup && this.renderSignupForm()}
        {showSettings && this.renderSettings()}
        {showLevelSelect && this.renderLevelSelect()}

        {/* 스피너 애니메이션 */}
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </>
    );
  }
}

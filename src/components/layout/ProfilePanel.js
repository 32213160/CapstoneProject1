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
    const BASE_URL = 'https://torytestsv.kro.kr';
    
    console.log('[디버깅] ProfilePanel: 인증 상태 확인 시작');
    console.log('[디버깅] ProfilePanel: BASE_URL:', BASE_URL);
    
    try {
      console.log('[디버깅] ProfilePanel: /api/auth/status 요청 시작');
      
      const response = await fetch(`${BASE_URL}/api/auth/status`, {
        method: 'GET',
        credentials: 'include'
      });

      console.log('[디버깅] ProfilePanel: 응답 상태 코드:', response.status);

      // ✅ 1단계: response.ok 먼저 확인 (가장 중요!)
      // 이 부분이 기존 코드에 없었음!
      if (!response.ok) {
        console.error('[디버깅] ProfilePanel: HTTP 에러 - 상태 코드:', response.status);
        this.setState({
          isAuthenticated: false,
          userInfo: null,
          loading: false
        });
        this.loadLocalUserInfo();
        return;
      }

      // ✅ 2단계: Content-Type 검증
      const contentType = response.headers.get('content-type');
      console.log('[디버깅] ProfilePanel: Content-Type:', contentType);

      if (!contentType || !contentType.includes('application/json')) {
        console.error('[디버깅] ProfilePanel: ⚠️ 응답이 JSON이 아님 -', contentType);
        this.setState({
          isAuthenticated: false,
          userInfo: null,
          loading: false
        });
        this.loadLocalUserInfo();
        return;
      }

      // ✅ 3단계: JSON 파싱 에러 처리 (이 부분도 추가!)
      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error('[디버깅] ProfilePanel: JSON 파싱 에러:', parseError);
        this.setState({
          isAuthenticated: false,
          userInfo: null,
          loading: false
        });
        this.loadLocalUserInfo();
        return;
      }

      console.log('[디버깅] ProfilePanel: 서버 응답 데이터:', data);

      // ✅ 4단계: 정상 처리
      if (data.authenticated) {
        console.log('[디버깅] ProfilePanel: ✅ 인증됨 - 사용자:', data.username);
        await this.getUserInfo();
        await this.getUserSessionCount();
        this.setState({
          isAuthenticated: true,
          loading: false
        });
      } else {
        console.log('[디버깅] ProfilePanel: ❌ 인증 안됨');
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
    const BASE_URL = 'https://torytestsv.kro.kr';
    
    try {
      const response = await fetch(`${BASE_URL}/api/auth/me`, {
        method: 'GET',
        credentials: 'include'
      });

      // ✅ 1단계: response.ok 검증
      if (!response.ok) {
        console.error('[디버깅] ProfilePanel: getUserInfo 요청 실패 - 상태 코드:', response.status);
        return;
      }

      // ✅ 2단계: JSON 파싱 에러 처리
      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error('[디버깅] ProfilePanel: getUserInfo JSON 파싱 에러:', parseError);
        return;
      }

      console.log('[디버깅] ProfilePanel: 사용자 정보 로드 성공:', data.user);
      
      this.setState({
        userInfo: data.user,
        isAuthenticated: true
      });

    } catch (error) {
      console.error('[디버깅] ProfilePanel: 사용자 정보 가져오기 실패:', error);
    }
  };

  // 세션 개수 조회
  getUserSessionCount = async () => {
    const BASE_URL = 'https://torytestsv.kro.kr';
    
    try {
      const response = await fetch(`${BASE_URL}/api/chats-of-user/my-sessions`, {
        method: 'GET',
        credentials: 'include'
      });

      // ✅ 1단계: response.ok 검증
      if (!response.ok) {
        console.error('[디버깅] ProfilePanel: getUserSessionCount 요청 실패 - 상태 코드:', response.status);
        return;
      }

      // ✅ 2단계: JSON 파싱 에러 처리
      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error('[디버깅] ProfilePanel: getUserSessionCount JSON 파싱 에러:', parseError);
        return;
      }

      // chatSessions 배열의 길이를 세션 개수로 사용
      const sessionCount = data.chatSessions ? data.chatSessions.length : 0;
      
      console.log('[디버깅] ProfilePanel: 세션 개수:', sessionCount);
      
      this.setState(prevState => ({
        userInfo: {
          ...prevState.userInfo,
          sessionCount: sessionCount
        }
      }));

    } catch (error) {
      console.error('[디버깅] ProfilePanel: 세션 개수 가져오기 실패:', error);
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

/*  handleClearSessions = () => {
    if (window.confirm('모든 채팅 기록을 삭제하시겠습니까?')) {
      localStorage.removeItem('chatSessions');
      localStorage.removeItem('chatSessionData');
      this.setState({ 
        userInfo: { ...this.state.userInfo, sessionCount: 0 } 
      });
      alert('채팅 기록이 삭제되었습니다.');
    }
  };*/

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
    const BASE_URL = 'https://torytestsv.kro.kr';
    
    this.setState({ levelSetting: true });

    try {
      console.log('[디버깅] ProfilePanel: 레벨 설정 시작 -', level);
      
      const response = await fetch(`${BASE_URL}/api/auth/setlevel?level=${level}`, {
        method: 'POST',
        credentials: 'include'
      });

      console.log('[디버깅] ProfilePanel: 레벨 설정 응답 상태:', response.status);

      // ✅ 1단계: JSON 파싱 에러 처리
      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error('[디버깅] ProfilePanel: handleSetLevel JSON 파싱 에러:', parseError);
        alert('레벨 설정 중 오류가 발생했습니다.');
        this.setState({ levelSetting: false });
        return;
      }

      // ✅ 2단계: response.ok 검증
      if (!response.ok) {
        console.error('[디버깅] ProfilePanel: 레벨 설정 실패:', data.error);
        alert(data.error || '레벨 설정에 실패했습니다.');
        this.setState({ levelSetting: false });
        return;
      }

      // ✅ 3단계: 성공 처리
      console.log('[디버깅] ProfilePanel: ✅ 레벨 설정 성공');
      await this.getUserInfo();
      alert(`레벨이 ${this.getLevelDisplayName(level)}(으)로 설정되었습니다.`);
      this.setState({
        showLevelSelect: false,
        levelSetting: false
      });

    } catch (error) {
      console.error('[디버깅] ProfilePanel: 레벨 설정 실패:', error);
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
    const BASE_URL = 'https://torytestsv.kro.kr';
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
      console.log('[디버깅] ProfilePanel: 로그인 시작 -', loginFormData.username);
      
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

      console.log('[디버깅] ProfilePanel: 로그인 응답 상태:', response.status);

      // ✅ 1단계: JSON 파싱 에러 처리
      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error('[디버깅] ProfilePanel: handleLoginSubmit JSON 파싱 에러:', parseError);
        this.setState({
          loginError: '로그인 처리 중 오류가 발생했습니다.',
          loginLoading: false
        });
        return;
      }

      // ✅ 2단계: 성공 여부 확인
      if (response.ok && data.result === 'success') {
        console.log('[디버깅] ProfilePanel: ✅ 로그인 성공');
        
        localStorage.setItem('sessionId', data.sessionId);
        localStorage.setItem('userInfo', JSON.stringify(data.user));

        this.setState({
          isAuthenticated: true,
          showLogin: false,
          loginFormData: {
            username: '',
            password: ''
          },
          loginLoading: false
        });

        await this.getUserInfo();
        await this.getUserSessionCount();

      } else {
        console.error('[디버깅] ProfilePanel: ❌ 로그인 실패:', data.message);
        this.setState({
          loginError: data.message || '로그인에 실패했습니다.',
          loginLoading: false
        });
      }

    } catch (err) {
      console.error('[디버깅] ProfilePanel: 로그인 에러:', err);
      this.setState({
        loginError: err.message || '로그인 중 오류가 발생했습니다.',
        loginLoading: false
      });
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
    const BASE_URL = 'https://torytestsv.kro.kr';
    const { signupFormData } = this.state;

    const formErrors = this.validateSignupForm();
    if (Object.keys(formErrors).length > 0) {
      this.setState({ signupErrors: formErrors });
      return;
    }

    this.setState({ signupLoading: true });

    try {
      console.log('[디버깅] ProfilePanel: 회원가입 시작 -', signupFormData.username);
      
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

      console.log('[디버깅] ProfilePanel: 회원가입 응답 상태:', response.status);

      // ✅ 1단계: JSON 파싱 에러 처리
      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error('[디버깅] ProfilePanel: handleSignupSubmit JSON 파싱 에러:', parseError);
        alert('회원가입 처리 중 오류가 발생했습니다.');
        this.setState({ signupLoading: false });
        return;
      }

      // ✅ 2단계: 성공 여부 확인
      if (response.ok && data.result === 'success') {
        console.log('[디버깅] ProfilePanel: ✅ 회원가입 성공');
        
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
          },
          signupLoading: false
        });

      } else {
        console.error('[디버깅] ProfilePanel: ❌ 회원가입 실패:', data.error);
        alert(data.error || '회원가입에 실패했습니다.');
        this.setState({ signupLoading: false });
      }

    } catch (err) {
      console.error('[디버깅] ProfilePanel: 회원가입 에러:', err);
      alert(err.message || '회원가입 도중 오류가 발생했습니다.');
      this.setState({ signupLoading: false });
    }
  };

  // ==================== LogoutButton 통합 ====================
  handleLogoutButton = async () => {
    const BASE_URL = 'https://torytestsv.kro.kr';
    const { logoutLoading } = this.state;

    if (logoutLoading) return;

    const confirmed = window.confirm('로그아웃 하시겠습니까?');
    if (!confirmed) return;

    this.setState({ logoutLoading: true });

    try {
      console.log('[디버깅] ProfilePanel: 로그아웃 시작');
      
      const response = await fetch(`${BASE_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });

      console.log('[디버깅] ProfilePanel: 로그아웃 응답 상태:', response.status);

      // ✅ JSON 파싱 에러 처리 (하지만 결과는 무시)
      try {
        await response.json();
      } catch (parseError) {
        console.error('[디버깅] ProfilePanel: handleLogoutButton JSON 파싱 에러:', parseError);
        // 로그아웃은 계속 진행
      }

      // ✅ 로컬 정보 정리
      localStorage.removeItem('sessionId');
      localStorage.removeItem('userInfo');

      console.log('[디버깅] ProfilePanel: ✅ 로그아웃 성공');

      this.setState({
        isAuthenticated: false,
        userInfo: null,
        showLogin: false,
        showSignup: false,
        logoutLoading: false
      });

      this.loadLocalUserInfo();

    } catch (error) {
      console.error('[디버깅] ProfilePanel: 로그아웃 중 오류 발생:', error);
      alert('로그아웃 중 오류가 발생했습니다.');
      this.setState({ logoutLoading: false });
    }
  };

  // ==================== 렌더링 메서드 ====================
  renderLoginForm = () => {
    const { loginFormData, loginShowPassword, loginError, loginLoading } = this.state;

    return (
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: '#ffffff',
        zIndex: 10,
        padding: '24px',
        overflowY: 'auto'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px'
        }}>
          <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 600 }}>로그인</h3>
          <button 
            onClick={() => this.setState({ showLogin: false })}
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

        <form onSubmit={this.handleLoginSubmit}>
          {/* 아이디 입력 */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: 500,
              color: '#2d3748'
            }}>
              <FaUser style={{ marginRight: '6px' }} />
              아이디
            </label>
            <input
              type="text"
              name="username"
              value={loginFormData.username}
              onChange={this.handleLoginChange}
              placeholder="아이디를 입력하세요"
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            />
          </div>

          {/* 비밀번호 입력 */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: 500,
              color: '#2d3748'
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
                placeholder="비밀번호를 입력하세요"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  paddingRight: '40px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
              <button
                type="button"
                onClick={() => this.setState(prev => ({ loginShowPassword: !prev.loginShowPassword }))}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#718096'
                }}
              >
                {loginShowPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          {/* 에러 메시지 */}
          {loginError && (
            <div style={{
              padding: '12px',
              marginBottom: '16px',
              background: '#fed7d7',
              border: '1px solid #fc8181',
              borderRadius: '6px',
              color: '#c53030',
              fontSize: '14px'
            }}>
              <FaInfoCircle style={{ marginRight: '6px' }} />
              {loginError}
            </div>
          )}

          {/* 로그인 버튼 */}
          <button
            type="submit"
            disabled={loginLoading}
            style={{
              width: '100%',
              padding: '12px',
              background: loginLoading ? '#cbd5e0' : '#3182ce',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: 600,
              cursor: loginLoading ? 'not-allowed' : 'pointer',
              marginBottom: '12px'
            }}
          >
            {loginLoading ? '로그인 중...' : '로그인'}
          </button>

          {/* 회원가입 링크 */}
          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <span style={{ fontSize: '14px', color: '#718096' }}>
              계정이 없으신가요?{' '}
            </span>
            <button
              type="button"
              onClick={() => this.setState({ showLogin: false, showSignup: true })}
              style={{
                background: 'none',
                border: 'none',
                color: '#3182ce',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              회원가입
            </button>
          </div>
        </form>
      </div>
    );
  };

  renderSignupForm = () => {
    const { signupFormData, signupShowPassword, signupShowConfirmPassword, signupErrors, signupLoading } = this.state;

    return (
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: '#ffffff',
        zIndex: 10,
        padding: '24px',
        overflowY: 'auto'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px'
        }}>
          <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 600 }}>회원가입</h3>
          <button 
            onClick={() => this.setState({ showSignup: false })}
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

        <form onSubmit={this.handleSignupSubmit}>
          {/* 아이디 입력 */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: 500,
              color: '#2d3748'
            }}>
              <FaUser style={{ marginRight: '6px' }} />
              아이디
            </label>
            <input
              type="text"
              name="username"
              value={signupFormData.username}
              onChange={this.handleSignupChange}
              placeholder="4자 이상의 아이디"
              style={{
                width: '100%',
                padding: '10px 12px',
                border: `1px solid ${signupErrors.username ? '#fc8181' : '#e2e8f0'}`,
                borderRadius: '6px',
                fontSize: '14px'
              }}
            />
            {signupErrors.username && (
              <div style={{ marginTop: '4px', fontSize: '12px', color: '#c53030' }}>
                {signupErrors.username}
              </div>
            )}
          </div>

          {/* 이메일 입력 */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: 500,
              color: '#2d3748'
            }}>
              <FaEnvelope style={{ marginRight: '6px' }} />
              이메일
            </label>
            <input
              type="email"
              name="email"
              value={signupFormData.email}
              onChange={this.handleSignupChange}
              placeholder="example@domain.com"
              style={{
                width: '100%',
                padding: '10px 12px',
                border: `1px solid ${signupErrors.email ? '#fc8181' : '#e2e8f0'}`,
                borderRadius: '6px',
                fontSize: '14px'
              }}
            />
            {signupErrors.email && (
              <div style={{ marginTop: '4px', fontSize: '12px', color: '#c53030' }}>
                {signupErrors.email}
              </div>
            )}
          </div>

          {/* 비밀번호 입력 */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: 500,
              color: '#2d3748'
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
                placeholder="6자 이상의 비밀번호"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  paddingRight: '40px',
                  border: `1px solid ${signupErrors.password ? '#fc8181' : '#e2e8f0'}`,
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
              <button
                type="button"
                onClick={() => this.setState(prev => ({ signupShowPassword: !prev.signupShowPassword }))}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#718096'
                }}
              >
                {signupShowPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {signupErrors.password && (
              <div style={{ marginTop: '4px', fontSize: '12px', color: '#c53030' }}>
                {signupErrors.password}
              </div>
            )}
          </div>

          {/* 비밀번호 확인 입력 */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: 500,
              color: '#2d3748'
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
                placeholder="비밀번호를 다시 입력하세요"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  paddingRight: '40px',
                  border: `1px solid ${signupErrors.confirmPassword ? '#fc8181' : '#e2e8f0'}`,
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
              <button
                type="button"
                onClick={() => this.setState(prev => ({ signupShowConfirmPassword: !prev.signupShowConfirmPassword }))}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#718096'
                }}
              >
                {signupShowConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {signupErrors.confirmPassword && (
              <div style={{ marginTop: '4px', fontSize: '12px', color: '#c53030' }}>
                {signupErrors.confirmPassword}
              </div>
            )}
          </div>

          {/* 실명 입력 */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: 500,
              color: '#2d3748'
            }}>
              <FaUser style={{ marginRight: '6px' }} />
              실명
            </label>
            <input
              type="text"
              name="name"
              value={signupFormData.name}
              onChange={this.handleSignupChange}
              placeholder="실명을 입력하세요"
              style={{
                width: '100%',
                padding: '10px 12px',
                border: `1px solid ${signupErrors.name ? '#fc8181' : '#e2e8f0'}`,
                borderRadius: '6px',
                fontSize: '14px'
              }}
            />
            {signupErrors.name && (
              <div style={{ marginTop: '4px', fontSize: '12px', color: '#c53030' }}>
                {signupErrors.name}
              </div>
            )}
          </div>

          {/* 테스트 계정 자동 입력 버튼 */}
          <button
            type="button"
            onClick={this.fillTestAccount}
            style={{
              width: '100%',
              padding: '10px',
              background: '#edf2f7',
              color: '#2d3748',
              border: '1px solid #cbd5e0',
              borderRadius: '6px',
              fontSize: '14px',
              cursor: 'pointer',
              marginBottom: '12px'
            }}
          >
            <FaInfoCircle style={{ marginRight: '6px' }} />
            테스트 계정 정보 자동 입력
          </button>

          {/* 회원가입 버튼 */}
          <button
            type="submit"
            disabled={signupLoading}
            style={{
              width: '100%',
              padding: '12px',
              background: signupLoading ? '#cbd5e0' : '#38a169',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: 600,
              cursor: signupLoading ? 'not-allowed' : 'pointer',
              marginBottom: '12px'
            }}
          >
            {signupLoading ? '가입 중...' : '회원가입'}
          </button>

          {/* 로그인 링크 */}
          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <span style={{ fontSize: '14px', color: '#718096' }}>
              이미 계정이 있으신가요?{' '}
            </span>
            <button
              type="button"
              onClick={() => this.setState({ showSignup: false, showLogin: true })}
              style={{
                background: 'none',
                border: 'none',
                color: '#3182ce',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              로그인
            </button>
          </div>
        </form>
      </div>
    );
  };

  render() {
    const { 
      isAuthenticated, 
      showLogin, 
      showSignup, 
      showSettings, 
      showLevelSelect, 
      levelSetting, 
      userInfo,
      logoutLoading
    } = this.state;
    
    const displayUserInfo = userInfo || { name: 'guest', role: 'guest', sessionCount: 0 };

    const panelStyle = {
      position: 'fixed',
      top: 0,
      right: 0,
      width: '320px',
      height: '100vh',
      background: '#ffffff',
      zIndex: 9999,
      boxShadow: '-2px 0 12px rgba(0,0,0,0.15)',
      display: 'flex',
      flexDirection: 'column'
    };

    const headerStyle = {
      padding: '16px',
      borderBottom: '1px solid #e2e8f0',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    };

    const contentStyle = {
      padding: '24px',
      flex: 1,
      display: 'flex',
      flexDirection: 'column'
    };

    const sectionStyle = {
      marginBottom: '24px'
    };

    const buttonStyle = {
      width: '100%',
      padding: '12px',
      marginBottom: '8px',
      borderRadius: '6px',
      border: '1px solid #e2e8f0',
      background: '#f7fafc',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    };

    // 설정 창 오버레이 스타일
    const overlayStyle = {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(0, 0, 0, 0.5)', // 반투명 배경
      zIndex: 10000,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    };

    const settingsModalStyle = {
      width: '500px',
      maxHeight: '80vh',
      overflowY: 'auto',
      background: '#ffffff',
      borderRadius: '12px',
      padding: '24px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
    };

    const settingItemStyle = {
      padding: '16px',
      borderBottom: '1px solid #e2e8f0',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    };

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
              {/*<button style={buttonStyle} onClick={this.handleClearSessions}>
                <FaBell /> 채팅 기록 삭제
              </button>*/}
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

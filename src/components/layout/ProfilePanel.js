// src/components/layout/ProfilePanel/ProfilePanel.js
import React from 'react';
import BaseComponent from '../../core/BaseComponent';
import { FaUserCircle, FaUser, FaCog, FaPalette, FaGlobe, FaLock, FaEye, FaEyeSlash, FaInfoCircle, FaEnvelope, FaSignOutAlt, FaSpinner } from 'react-icons/fa';
//import { FaTimes, FaUser, FaCog, FaBell, FaPalette, FaGlobe, FaLock, FaEye, FaEyeSlash, FaInfoCircle, FaEnvelope, FaSignOutAlt, FaSpinner } from 'react-icons/fa';
import { Badge } from 'react-bootstrap';
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
        this.setState({ isAuthenticated: false, userInfo: null, loading: false });
        this.loadLocalUserInfo();
        return;
      }

      // ✅ 2단계: Content-Type 검증
      const contentType = response.headers.get('content-type');
      console.log('[디버깅] ProfilePanel: Content-Type:', contentType);

      if (!contentType || !contentType.includes('application/json')) {
        console.error('[디버깅] ProfilePanel: ⚠️ 응답이 JSON이 아님 -', contentType);
        this.setState({ isAuthenticated: false, userInfo: null, loading: false });
        this.loadLocalUserInfo();
        return;
      }

      // ✅ 3단계: JSON 파싱 에러 처리 (이 부분도 추가!)
      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error('[디버깅] ProfilePanel: JSON 파싱 에러:', parseError);
        this.setState({ isAuthenticated: false, userInfo: null, loading: false });
        this.loadLocalUserInfo();
        return;
      }

      console.log('[디버깅] ProfilePanel: 서버 응답 데이터:', data);

      // ✅ 4단계: 정상 처리
      if (data.authenticated) {
        console.log('[디버깅] ProfilePanel: ✅ 인증됨 - 사용자:', data.username);
        await this.getUserInfo();
        await this.getUserSessionCount();
        this.setState({ isAuthenticated: true, loading: false });
      } else {
        console.log('[디버깅] ProfilePanel: ❌ 인증 안됨');
        this.setState({ isAuthenticated: false, userInfo: null, loading: false });
        this.loadLocalUserInfo();
      }
    } catch (error) {
      console.error('[디버깅] ProfilePanel: 인증 상태 확인 실패:', error);
      this.setState({ isAuthenticated: false, userInfo: null, loading: false });
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
      this.setState({ userInfo: data.user, isAuthenticated: true });
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

  /* handleClearSessions = () => {
    if (window.confirm('모든 채팅 기록을 삭제하시겠습니까?')) {
      localStorage.removeItem('chatSessions');
      localStorage.removeItem('chatSessionData');
      this.setState({ userInfo: { ...this.state.userInfo, sessionCount: 0 } });
      alert('채팅 기록이 삭제되었습니다.');
    }
  };*/

  // 설정 창 열기/닫기
  handleOpenSettings = () => {
    console.log('[디버깅] ProfilePanel: 설정 모달 열기');
    this.setState({ showSettings: true });
  };

  handleCloseSettings = () => {
    console.log('[디버깅] ProfilePanel: 설정 모달 닫기');
    this.setState({ showSettings: false });
  };

  // 레벨 선택 모달 열기/닫기
  handleOpenLevelSelect = () => {
    console.log('[디버깅] ProfilePanel: 레벨 선택 모달 열기');
    this.setState({ showLevelSelect: true });
  };

  handleCloseLevelSelect = () => {
    console.log('[디버깅] ProfilePanel: 레벨 선택 모달 닫기');
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
      this.setState({ showLevelSelect: false, levelSetting: false });
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
        headers: { 'Content-Type': 'application/json' },
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
        this.setState({ loginError: '로그인 처리 중 오류가 발생했습니다.', loginLoading: false });
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
          loginFormData: { username: '', password: '' },
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
        headers: { 'Content-Type': 'application/json' },
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
      <div className="p-4">
        <h4 className="mb-4 text-center">로그인</h4>
        <form onSubmit={this.handleLoginSubmit}>
          {/* 아이디 입력 */}
          <div className="mb-3">
            <label className="form-label">
              <FaUser className="me-2" />
              아이디
            </label>
            <input
              type="text"
              name="username"
              className="form-control"
              placeholder="아이디를 입력하세요"
              value={loginFormData.username}
              onChange={this.handleLoginChange}
              disabled={loginLoading}
            />
          </div>

          {/* 비밀번호 입력 */}
          <div className="mb-3">
            <label className="form-label">
              <FaLock className="me-2" />
              비밀번호
            </label>
            <div className="input-group">
              <input
                type={loginShowPassword ? 'text' : 'password'}
                name="password"
                className="form-control"
                placeholder="비밀번호를 입력하세요"
                value={loginFormData.password}
                onChange={this.handleLoginChange}
                disabled={loginLoading}
              />
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => this.setState({ loginShowPassword: !loginShowPassword })}
                disabled={loginLoading}
              >
                {loginShowPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          {/* 에러 메시지 */}
          {loginError && (
            <div className="alert alert-danger" role="alert">
              {loginError}
            </div>
          )}

          {/* 로그인 버튼 */}
          <button
            type="submit"
            className="btn btn-primary w-100 mb-3"
            disabled={loginLoading}
          >
            {loginLoading ? (
              <>
                <FaSpinner className="fa-spin me-2" />
                로그인 중...
              </>
            ) : (
              '로그인'
            )}
          </button>

          {/* 회원가입 링크 */}
          <div className="text-center">
            <button
              type="button"
              className="btn btn-link"
              onClick={() => this.setState({ showLogin: false, showSignup: true })}
              disabled={loginLoading}
            >
              회원가입하기
            </button>
          </div>
        </form>
      </div>
    );
  };

  renderSignupForm = () => {
    const { signupFormData, signupShowPassword, signupShowConfirmPassword, signupErrors, signupLoading } = this.state;

    return (
      <div className="p-4">
        <h4 className="mb-4 text-center">회원가입</h4>
        <form onSubmit={this.handleSignupSubmit}>
          {/* 아이디 */}
          <div className="mb-3">
            <label className="form-label">
              <FaUser className="me-2" />
              아이디
            </label>
            <input
              type="text"
              name="username"
              className={`form-control ${signupErrors.username ? 'is-invalid' : ''}`}
              placeholder="아이디 (4자 이상)"
              value={signupFormData.username}
              onChange={this.handleSignupChange}
              disabled={signupLoading}
            />
            {signupErrors.username && <div className="invalid-feedback">{signupErrors.username}</div>}
          </div>

          {/* 이메일 */}
          <div className="mb-3">
            <label className="form-label">
              <FaEnvelope className="me-2" />
              이메일
            </label>
            <input
              type="email"
              name="email"
              className={`form-control ${signupErrors.email ? 'is-invalid' : ''}`}
              placeholder="email@example.com"
              value={signupFormData.email}
              onChange={this.handleSignupChange}
              disabled={signupLoading}
            />
            {signupErrors.email && <div className="invalid-feedback">{signupErrors.email}</div>}
          </div>

          {/* 비밀번호 */}
          <div className="mb-3">
            <label className="form-label">
              <FaLock className="me-2" />
              비밀번호
            </label>
            <div className="input-group">
              <input
                type={signupShowPassword ? 'text' : 'password'}
                name="password"
                className={`form-control ${signupErrors.password ? 'is-invalid' : ''}`}
                placeholder="비밀번호 (6자 이상)"
                value={signupFormData.password}
                onChange={this.handleSignupChange}
                disabled={signupLoading}
              />
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => this.setState({ signupShowPassword: !signupShowPassword })}
                disabled={signupLoading}
              >
                {signupShowPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
              {signupErrors.password && <div className="invalid-feedback d-block">{signupErrors.password}</div>}
            </div>
          </div>

          {/* 비밀번호 확인 */}
          <div className="mb-3">
            <label className="form-label">
              <FaLock className="me-2" />
              비밀번호 확인
            </label>
            <div className="input-group">
              <input
                type={signupShowConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                className={`form-control ${signupErrors.confirmPassword ? 'is-invalid' : ''}`}
                placeholder="비밀번호 재입력"
                value={signupFormData.confirmPassword}
                onChange={this.handleSignupChange}
                disabled={signupLoading}
              />
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => this.setState({ signupShowConfirmPassword: !signupShowConfirmPassword })}
                disabled={signupLoading}
              >
                {signupShowConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
              {signupErrors.confirmPassword && <div className="invalid-feedback d-block">{signupErrors.confirmPassword}</div>}
            </div>
          </div>

          {/* 실명 */}
          <div className="mb-3">
            <label className="form-label">
              <FaInfoCircle className="me-2" />
              실명
            </label>
            <input
              type="text"
              name="name"
              className={`form-control ${signupErrors.name ? 'is-invalid' : ''}`}
              placeholder="실명을 입력하세요"
              value={signupFormData.name}
              onChange={this.handleSignupChange}
              disabled={signupLoading}
            />
            {signupErrors.name && <div className="invalid-feedback">{signupErrors.name}</div>}
          </div>

          {/* 회원가입 버튼 */}
          <button
            type="submit"
            className="btn btn-primary w-100 mb-3"
            disabled={signupLoading}
          >
            {signupLoading ? (
              <>
                <FaSpinner className="fa-spin me-2" />
                회원가입 중...
              </>
            ) : (
              '회원가입'
            )}
          </button>

          {/* 로그인 링크 */}
          <div className="text-center">
            <button
              type="button"
              className="btn btn-link"
              onClick={() => this.setState({ showSignup: false, showLogin: true })}
              disabled={signupLoading}
            >
              이미 계정이 있으신가요? 로그인하기
            </button>
          </div>
        </form>
      </div>
    );
  };

  renderUserProfile = () => {
    const { userInfo, logoutLoading } = this.state;

    return (
      <div className="p-4">
        {/* 프로필 정보 */}
        <div className="text-center mb-4">
          <FaUserCircle size={80} className="text-primary mb-3" />
          <h5 className="mb-1">{userInfo?.name || 'Unknown'}</h5>
          <p className="text-muted small mb-0">@{userInfo?.username || 'user'}</p>
          <Badge bg="secondary" className="mt-2">{userInfo?.role || 'guest'}</Badge>
        </div>

        {/* 사용자 정보 */}
        <div className="list-group list-group-flush mb-3">
          <div className="list-group-item d-flex justify-content-between align-items-center">
            <span>
              <FaEnvelope className="me-2" />
              이메일
            </span>
            <span className="text-muted">{userInfo?.email || 'N/A'}</span>
          </div>
          <div className="list-group-item d-flex justify-content-between align-items-center">
            <span>
              <FaInfoCircle className="me-2" />
              세션 수
            </span>
            <Badge bg="primary">{userInfo?.sessionCount || 0}</Badge>
          </div>
          <div className="list-group-item d-flex justify-content-between align-items-center">
            <span>
              <FaCog className="me-2" />
              현재 레벨
            </span>
            <Badge bg="info">{this.getLevelDisplayName(userInfo?.level || 'auto')}</Badge>
          </div>
        </div>

        {/* 로그아웃 버튼 */}
        <button
          className="btn btn-danger w-100"
          onClick={this.handleLogoutButton}
          disabled={logoutLoading}
        >
          {logoutLoading ? (
            <>
              <FaSpinner className="fa-spin me-2" />
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
    );
  };

  renderGuestProfile = () => {
    const { userInfo } = this.state;

    return (
      <div className="p-4">
        <div className="text-center mb-4">
          <FaUserCircle size={80} className="text-muted mb-3" />
          <h5 className="mb-1">Guest</h5>
          <p className="text-muted small">로그인하여 더 많은 기능을 이용하세요</p>
          <Badge bg="secondary">비회원</Badge>
        </div>

        <div className="list-group list-group-flush mb-3">
          <div className="list-group-item d-flex justify-content-between align-items-center">
            <span>
              <FaInfoCircle className="me-2" />
              로컬 세션 수
            </span>
            <Badge bg="secondary">{userInfo?.sessionCount || 0}</Badge>
          </div>
        </div>
      </div>
    );
  };

  render() {
    const { isAuthenticated, userInfo, loading, showLogin, showSignup, showSettings, showLevelSelect, levelSetting } = this.state;

    return (
      <>
        {/* 프로필 패널 본체 */}
        <div className="h-100 d-flex flex-column bg-white" style={{ position: 'relative' }}>
          {/* 헤더 */}
          <div className="p-3 border-bottom d-flex justify-content-between align-items-center">
            <h5 className="mb-0">프로필</h5>
            <button
              className="btn-close"
              onClick={this.handleClose}
              aria-label="Close"
            ></button>
          </div>

          {/* 본문 */}
          <div className="flex-grow-1 overflow-auto">
            {loading ? (
              <div className="text-center py-5">
                <FaSpinner className="fa-spin" size={32} />
                <p className="mt-3">로딩 중...</p>
              </div>
            ) : isAuthenticated && userInfo ? (
              /* 로그인 상태 */
              <>
                {this.renderUserProfile()}

                {/* 설정 버튼들 */}
                <div className="p-4 border-top">
                  <button
                    className="btn btn-outline-secondary w-100 mb-2 py-2"
                    onClick={this.handleOpenSettings}
                  >
                    <FaCog className="me-2" />
                    설정
                  </button>

                  <button
                    className="btn btn-outline-primary w-100 mt-1 py-2"
                    onClick={this.handleOpenLevelSelect}
                  >
                    <FaCog className="me-2" />
                    대화 난이도 설정
                  </button>
                </div>
              </>
            ) : showLogin ? (
              this.renderLoginForm()
            ) : showSignup ? (
              this.renderSignupForm()
            ) : (
              /* 비로그인 상태 */
              <>
                {this.renderGuestProfile()}
                <div className="p-3 border-top">
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
              </>
            )}
          </div>
        </div>

        {/* ✅ 설정 모달 - Portal을 사용하여 최상단에 렌더링 */}
        {showSettings && (
          <>
            {/* 모달 backdrop */}
            <div
              className="modal-backdrop fade show"
              style={{ zIndex: 2050 }}
              onClick={this.handleCloseSettings}
            ></div>

            {/* 모달 본체 */}
            <div
              className="modal fade show d-block"
              style={{ zIndex: 2051 }}
              tabIndex="-1"
              role="dialog"
            >
              <div className="modal-dialog modal-dialog-centered" role="document">
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
                      aria-label="Close"
                    ></button>
                  </div>

                  <div className="modal-body">
                    <div className="list-group list-group-flush">
                      {/* 대화 난이도 설정 */}
                      <button
                        className="list-group-item list-group-item-action d-flex align-items-center"
                        onClick={() => {
                          this.handleCloseSettings();
                          this.handleOpenLevelSelect();
                        }}
                      >
                        <FaCog className="me-3" size={20} />
                        <div className="flex-grow-1">
                          <strong>대화 난이도 설정</strong>
                          <small className="d-block text-muted">AI 응답 스타일 조정</small>
                        </div>
                      </button>

                      {/* 테마 설정 (추후 구현) */}
                      <button
                        className="list-group-item list-group-item-action d-flex align-items-center"
                        disabled
                      >
                        <FaPalette className="me-3" size={20} />
                        <div className="flex-grow-1">
                          <strong>테마 설정</strong>
                          <small className="d-block text-muted">다크 모드 / 라이트 모드</small>
                        </div>
                      </button>

                      {/* 언어 설정 (추후 구현) */}
                      <button
                        className="list-group-item list-group-item-action d-flex align-items-center"
                        disabled
                      >
                        <FaGlobe className="me-3" size={20} />
                        <div className="flex-grow-1">
                          <strong>언어 설정</strong>
                          <small className="d-block text-muted">한국어 / English</small>
                        </div>
                      </button>
                    </div>
                  </div>

                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={this.handleCloseSettings}
                    >
                      닫기
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

                {/* ✅ 대화 난이도 선택 모달 - Portal을 사용하여 최상단에 렌더링 */}
        {showLevelSelect && (
          <>
            {/* 모달 backdrop */}
            <div
              className="modal-backdrop fade show"
              style={{ zIndex: 2050 }}
              onClick={!levelSetting ? this.handleCloseLevelSelect : undefined}
            ></div>

            {/* 모달 본체 */}
            <div
              className="modal fade show d-block"
              style={{ zIndex: 2051 }}
              tabIndex="-1"
              role="dialog"
            >
              <div className="modal-dialog modal-dialog-centered" role="document">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">
                      <FaCog className="me-2" />
                      대화 난이도 설정
                    </h5>
                    <button
                      type="button"
                      className="btn-close"
                      onClick={this.handleCloseLevelSelect}
                      disabled={levelSetting}
                      aria-label="Close"
                    ></button>
                  </div>

                  <div className="modal-body">
                    <p className="text-muted mb-3 small">
                      대화 난이도를 선택하세요. AI의 응답 스타일이 조정됩니다.
                    </p>

                    {/* 현재 레벨 표시 */}
                    <div className="alert alert-info mb-3 py-2">
                      <small><strong>현재 레벨:</strong> {this.getLevelDisplayName(userInfo?.level || 'auto')}</small>
                    </div>

                    {/* 레벨 버튼들 */}
                    <div className="d-grid gap-2">
                      <button
                        className={`btn ${(userInfo?.level || 'auto') === 'novice' ? 'btn-primary' : 'btn-outline-secondary'}`}
                        onClick={() => this.handleSetLevel('novice')}
                        disabled={levelSetting}
                        style={{ textAlign: 'left', padding: '0.5rem 1rem' }}
                      >
                        <div className="d-flex align-items-center justify-content-between">
                          <div>
                            <div><strong>초보자</strong></div>
                            <small className="d-block" style={{ fontSize: '0.75rem' }}>쉬운 용어와 간단한 설명</small>
                          </div>
                          {(userInfo?.level || 'auto') === 'novice' && <Badge bg="success" className="ms-2">현재</Badge>}
                        </div>
                      </button>

                      <button
                        className={`btn ${(userInfo?.level || 'auto') === 'intermediate' ? 'btn-primary' : 'btn-outline-secondary'}`}
                        onClick={() => this.handleSetLevel('intermediate')}
                        disabled={levelSetting}
                        style={{ textAlign: 'left', padding: '0.5rem 1rem' }}
                      >
                        <div className="d-flex align-items-center justify-content-between">
                          <div>
                            <div><strong>중급자</strong></div>
                            <small className="d-block" style={{ fontSize: '0.75rem' }}>기술 용어와 상세한 설명</small>
                          </div>
                          {(userInfo?.level || 'auto') === 'intermediate' && <Badge bg="success" className="ms-2">현재</Badge>}
                        </div>
                      </button>

                      <button
                        className={`btn ${(userInfo?.level || 'auto') === 'expert' ? 'btn-primary' : 'btn-outline-secondary'}`}
                        onClick={() => this.handleSetLevel('expert')}
                        disabled={levelSetting}
                        style={{ textAlign: 'left', padding: '0.5rem 1rem' }}
                      >
                        <div className="d-flex align-items-center justify-content-between">
                          <div>
                            <div><strong>전문가</strong></div>
                            <small className="d-block" style={{ fontSize: '0.75rem' }}>전문 용어와 깊이 있는 분석</small>
                          </div>
                          {(userInfo?.level || 'auto') === 'expert' && <Badge bg="success" className="ms-2">현재</Badge>}
                        </div>
                      </button>

                      <button
                        className={`btn ${(userInfo?.level || 'auto') === 'auto' ? 'btn-primary' : 'btn-outline-secondary'}`}
                        onClick={() => this.handleSetLevel('auto')}
                        disabled={levelSetting}
                        style={{ textAlign: 'left', padding: '0.5rem 1rem' }}
                      >
                        <div className="d-flex align-items-center justify-content-between">
                          <div>
                            <div><strong>자동 조정</strong></div>
                            <small className="d-block" style={{ fontSize: '0.75rem' }}>대화 맥락에 따라 자동 선택</small>
                          </div>
                          {(userInfo?.level || 'auto') === 'auto' && <Badge bg="success" className="ms-2">현재</Badge>}
                        </div>
                      </button>
                    </div>

                    {levelSetting && (
                      <div className="text-center mt-3">
                        <FaSpinner className="fa-spin me-2" />
                        <small>레벨 설정 중...</small>
                      </div>
                    )}
                  </div>

                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={this.handleCloseLevelSelect}
                      disabled={levelSetting}
                    >
                      닫기
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </>
    );
  }
}

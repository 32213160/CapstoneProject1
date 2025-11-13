// src/components/layout/ProfilePanel/ProfilePanel.js
import React from 'react';
import BaseComponent from '../../core/BaseComponent';
import { FaTimes, FaUser, FaCog, FaBell, FaPalette, FaGlobe, FaLock } from 'react-icons/fa';
import LoginForm from '../auth/LoginForm';
import SignupForm from '../auth/SignupForm';
import LogoutButton from '../auth/LogoutButton';

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

  // TestPage.js의 인증 상태 조회 API 활용
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
        this.getUserInfo();
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
    const BASE_URL = ''; // TestPage.js와 동일
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

  render() {
    const { isAuthenticated, showLogin, showSignup, showSettings, showLevelSelect, levelSetting, loading, userInfo } = this.state;
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
        <div style={panelStyle} className="profile-panel">
          <div style={headerStyle} className="profile-header">
            <h5 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>프로필</h5>
            <FaTimes 
              onClick={this.handleClose} 
              style={{ cursor: 'pointer', fontSize: '20px', color: '#718096' }} 
            />
          </div>

          <div style={contentStyle} className="profile-content">
            {loading ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>로딩 중...</div>
            ) : (
              <>
                {/* 인증 상태에 따른 UI 분기 */}
                {isAuthenticated ? (
                  <>
                    {/* 로그인 상태 - 회원 정보 표시 */}
                    <div style={sectionStyle} className="user-info-section">
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '12px', 
                        marginBottom: '16px' 
                      }}>
                        <FaUser style={{ fontSize: '48px', color: '#4299e1' }} />
                        <div>
                          <div style={{ fontSize: '18px', fontWeight: 600 }}>
                            {displayUserInfo.name || displayUserInfo.username || 'User'}
                          </div>
                          <div style={{ fontSize: '14px', color: '#718096' }}>
                            {displayUserInfo.username || displayUserInfo.role || 'Member'}
                          </div>
                          <div style={{ fontSize: '13px', color: '#4299e1', marginTop: '4px', fontWeight: '500' }}>
                            레벨: {this.getLevelDisplayName(displayUserInfo.level || 'auto')}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 메뉴 항목들 */}
                    <div style={sectionStyle} className="menu-section">
                      <button style={buttonStyle} className="menu-button" onClick={this.handleOpenSettings}>
                        <FaCog /> 설정
                      </button>
                      <button style={buttonStyle} className="menu-button" onClick={this.handleOpenLevelSelect}>
                        <FaUser /> 레벨 선택
                      </button>
                      <button style={buttonStyle} className="menu-button" onClick={this.handleClearSessions}>
                        <FaUser /> 채팅 기록 삭제
                      </button>
                    </div>

                    {/* 로그아웃 버튼 */}
                    <div style={{ marginTop: 'auto' }}>
                      <LogoutButton onLogout={this.handleAuthChange} />
                    </div>
                  </>
                ) : (
                  <>
                    {/* 비로그인 상태 - 로그인/회원가입 버튼 */}
                    {!showLogin && !showSignup && (
                      <div style={sectionStyle} className="auth-buttons-section">
                        <button 
                          style={buttonStyle} 
                          className="login-button"
                          onClick={() => this.setState({ showLogin: true })}
                        >
                          <FaUser /> 로그인
                        </button>
                        <button 
                          style={buttonStyle} 
                          className="signup-button"
                          onClick={() => this.setState({ showSignup: true })}
                        >
                          <FaUser /> 회원가입
                        </button>
                      </div>
                    )}

                    {/* 로그인 폼 */}
                    {showLogin && (
                      <LoginForm 
                        onAuthenticated={this.handleAuthChange}
                        onGoSignup={() => this.setState({ showLogin: false, showSignup: true })}
                      />
                    )}

                    {/* 회원가입 폼 */}
                    {showSignup && (
                      <SignupForm 
                        onSignupSuccess={this.handleAuthChange}
                        onGoLogin={() => this.setState({ showSignup: false, showLogin: true })}
                      />
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>

        {/* 설정 창 오버레이 */}
        {showSettings && (
          <div style={overlayStyle} className="settings-overlay" onClick={this.handleCloseSettings}>
            <div style={settingsModalStyle} className="settings-modal" onClick={(e) => e.stopPropagation()}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '20px'
              }}>
                <h4 style={{ margin: 0, fontSize: '20px', fontWeight: 600 }}>설정</h4>
                <FaTimes 
                  onClick={this.handleCloseSettings} 
                  style={{ cursor: 'pointer', fontSize: '20px', color: '#718096' }} 
                />
              </div>

              {/* 설정 항목들 */}
              <div>
                {/* 테마 설정 */}
                <div style={settingItemStyle} className="setting-item">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <FaPalette style={{ fontSize: '20px', color: '#4299e1' }} />
                    <div>
                      <div style={{ fontWeight: 600 }}>테마</div>
                      <div style={{ fontSize: '12px', color: '#718096' }}>다크 모드 / 라이트 모드</div>
                    </div>
                  </div>
                  <select className="form-select form-select-sm" style={{ width: '120px' }}>
                    <option>라이트</option>
                    <option>다크</option>
                    <option>시스템</option>
                  </select>
                </div>

                {/* 알림 설정 */}
                <div style={settingItemStyle} className="setting-item">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <FaBell style={{ fontSize: '20px', color: '#48bb78' }} />
                    <div>
                      <div style={{ fontWeight: 600 }}>알림</div>
                      <div style={{ fontSize: '12px', color: '#718096' }}>푸시 알림 설정</div>
                    </div>
                  </div>
                  <input type="checkbox" className="form-check-input" defaultChecked />
                </div>

                {/* 언어 설정 */}
                <div style={settingItemStyle} className="setting-item">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <FaGlobe style={{ fontSize: '20px', color: '#ed8936' }} />
                    <div>
                      <div style={{ fontWeight: 600 }}>언어</div>
                      <div style={{ fontSize: '12px', color: '#718096' }}>인터페이스 언어</div>
                    </div>
                  </div>
                  <select className="form-select form-select-sm" style={{ width: '120px' }}>
                    <option>한국어</option>
                    <option>English</option>
                    <option>日本語</option>
                  </select>
                </div>

                {/* 개인정보 설정 */}
                <div style={settingItemStyle} className="setting-item">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <FaLock style={{ fontSize: '20px', color: '#e53e3e' }} />
                    <div>
                      <div style={{ fontWeight: 600 }}>개인정보</div>
                      <div style={{ fontSize: '12px', color: '#718096' }}>데이터 보안 및 개인정보 설정</div>
                    </div>
                  </div>
                  <button className="btn btn-sm btn-outline-secondary">관리</button>
                </div>
              </div>

              <div style={{ marginTop: '24px', textAlign: 'right' }}>
                <button 
                  className="btn btn-primary" 
                  onClick={this.handleCloseSettings}
                  style={{ padding: '8px 24px' }}
                >
                  확인
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 레벨 선택 모달 */}
        {showLevelSelect && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        zIndex: 10001, display: 'flex', justifyContent: 'center', alignItems: 'center' }} onClick={this.handleCloseLevelSelect}>
            <div style={{ width: '400px', background: '#ffffff', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }} onClick={(e) => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h4 style={{ margin: 0, fontSize: '20px', fontWeight: 600 }}>레벨 선택</h4>
                <button onClick={this.handleCloseLevelSelect} style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '20px' }}>
                  <FaTimes />
                </button>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <p style={{ fontSize: '14px', color: '#718096', margin: 0 }}>
                  대화 난이도를 선택하세요. 선택한 레벨에 따라 AI의 응답 스타일이 조정됩니다.
                </p>
              </div>

              <div>
                <button 
                  style={{ width: '100%', padding: '16px', marginBottom: '12px', borderRadius: '8px', border: '2px solid #e2e8f0', background: '#ffffff', cursor: 'pointer', fontSize: '16px', fontWeight: '500', transition: 'all 0.2s', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}
                  onClick={() => this.handleSetLevel('novice')}
                  disabled={levelSetting}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#4299e1';
                    e.currentTarget.style.backgroundColor = '#f0f9ff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#e2e8f0';
                    e.currentTarget.style.backgroundColor = '#ffffff';
                  }}
                >
                  <span style={{ fontSize: '16px', fontWeight: '600' }}>초보자</span>
                  <span style={{ fontSize: '13px', color: '#718096' }}>기초적이고 쉬운 설명</span>
                </button>

                <button 
                  style={{ width: '100%', padding: '16px', marginBottom: '12px', borderRadius: '8px', border: '2px solid #e2e8f0', background: '#ffffff', cursor: 'pointer', fontSize: '16px', fontWeight: '500', transition: 'all 0.2s', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}
                  onClick={() => this.handleSetLevel('intermediate')}
                  disabled={levelSetting}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#4299e1';
                    e.currentTarget.style.backgroundColor = '#f0f9ff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#e2e8f0';
                    e.currentTarget.style.backgroundColor = '#ffffff';
                  }}
                >
                  <span style={{ fontSize: '16px', fontWeight: '600' }}>중급자</span>
                  <span style={{ fontSize: '13px', color: '#718096' }}>균형잡힌 수준의 설명</span>
                </button>

                <button 
                  style={{ width: '100%', padding: '16px', marginBottom: '12px', borderRadius: '8px', border: '2px solid #e2e8f0', background: '#ffffff', cursor: 'pointer', fontSize: '16px', fontWeight: '500', transition: 'all 0.2s', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}
                  onClick={() => this.handleSetLevel('expert')}
                  disabled={levelSetting}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#4299e1';
                    e.currentTarget.style.backgroundColor = '#f0f9ff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#e2e8f0';
                    e.currentTarget.style.backgroundColor = '#ffffff';
                  }}
                >
                  <span style={{ fontSize: '16px', fontWeight: '600' }}>전문가</span>
                  <span style={{ fontSize: '13px', color: '#718096' }}>전문적이고 상세한 설명</span>
                </button>

                <button 
                  style={{ width: '100%', padding: '16px', marginBottom: '12px', borderRadius: '8px', border: '2px solid #e2e8f0', background: '#ffffff', cursor: 'pointer', fontSize: '16px', fontWeight: '500', transition: 'all 0.2s', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}
                  onClick={() => this.handleSetLevel('auto')}
                  disabled={levelSetting}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#4299e1';
                    e.currentTarget.style.backgroundColor = '#f0f9ff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#e2e8f0';
                    e.currentTarget.style.backgroundColor = '#ffffff';
                  }}
                >
                  <span style={{ fontSize: '16px', fontWeight: '600' }}>자동 조정</span>
                  <span style={{ fontSize: '13px', color: '#718096' }}>대화 내용에 따라 자동으로 조정</span>
                </button>
              </div>

              <div style={{ marginTop: '20px', textAlign: 'right' }}>
                <button 
                  className="btn btn-outline-secondary" 
                  onClick={this.handleCloseLevelSelect}
                  style={{ padding: '8px 24px' }}
                  disabled={levelSetting}
                >
                  {levelSetting ? '설정 중...' : '취소'}
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }
}
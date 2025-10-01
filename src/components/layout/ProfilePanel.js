// src/components/layout/ProfilePanel/ProfilePanel.js
import React from 'react';
import BaseComponent from '../../core/BaseComponent';
import { FaTimes, FaUser, FaCode, FaCog } from 'react-icons/fa';

/**
 * 상속: BaseComponent를 상속받은 프로필 패널 컴포넌트
 * 캡슐화: 프로필 관련 상태와 동작을 내부에 캡슐화
 */
export default class ProfilePanel extends BaseComponent {
  constructor(props) {
    super(props);
    this.state = {
      ...this.state,
      userInfo: {
        name: '사용자',
        role: '파일 분석 · 챗봇 사용',
        sessionCount: 0
      }
    };
  }

  onMount() {
    super.onMount();
    this.loadUserInfo();
  }

  // 캡슐화된 사용자 정보 로딩
  loadUserInfo = () => {
    try {
      const sessions = JSON.parse(localStorage.getItem('chatSessions') || '[]');
      this.setState({
        userInfo: {
          ...this.state.userInfo,
          sessionCount: sessions.length
        }
      });
    } catch (error) {
      console.error('사용자 정보 로딩 실패:', error);
    }
  }

  handleClose = () => {
    const { onClose } = this.props;
    if (onClose) {
      onClose();
    }
  }

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
  }

  render() {
    const { userInfo } = this.state;

    const panelStyle = {
      position: 'fixed',
      top: 0,
      right: 0,
      width: '320px',
      height: '100vh',
      background: '#ffffff',
      zIndex: 1000,
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

    return (
      <div className="profile-panel" style={panelStyle}>
        <div className="panel-header" style={headerStyle}>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>
            프로필
          </h3>
          <button 
            onClick={this.handleClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '18px',
              cursor: 'pointer',
              color: '#4a5568'
            }}
          >
            <FaTimes />
          </button>
        </div>
        
        <div className="panel-content" style={contentStyle}>
          <div className="user-info" style={sectionStyle}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: '#3182ce',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '20px',
                marginRight: '12px'
              }}>
                <FaUser />
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '16px' }}>
                  {userInfo.name}
                </div>
                <div style={{ color: '#718096', fontSize: '14px' }}>
                  {userInfo.role}
                </div>
              </div>
            </div>
            
            <div style={{ 
              background: '#f7fafc', 
              padding: '12px', 
              borderRadius: '6px',
              fontSize: '14px'
            }}>
              <div>총 채팅 세션: {userInfo.sessionCount}개</div>
            </div>
          </div>
          
          <div className="actions" style={sectionStyle}>
            <h4 style={{ marginBottom: '12px', fontSize: '16px' }}>설정</h4>
            
            <button style={buttonStyle}>
              <FaCode />
              개발자 정보
            </button>
            
            <button style={buttonStyle}>
              <FaCog />
              설정
            </button>
            
            <button 
              onClick={this.handleClearSessions}
              style={{
                ...buttonStyle,
                color: '#e53e3e',
                borderColor: '#fed7d7'
              }}
            >
              채팅 기록 삭제
            </button>
          </div>
          
          <div className="footer" style={{ marginTop: 'auto', fontSize: '12px', color: '#a0aec0' }}>
            Malware Analyzer v1.0.0
          </div>
        </div>
      </div>
    );
  }
}

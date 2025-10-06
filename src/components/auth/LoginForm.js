// src/components/auth/LoginForm.js
import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaUser, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';

function LoginForm({ onAuthenticated, onGoSignup }) {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // 입력 시 에러 메시지 초기화
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 간단한 테스트 로그인 (실제로는 API 호출)
      if (formData.username === 'admin' && formData.password === 'password') {
        // 토큰을 localStorage에 저장 (임시)
        localStorage.setItem('userToken', 'dummy_token_' + Date.now());
        localStorage.setItem('userInfo', JSON.stringify({
          username: formData.username,
          name: '관리자',
          role: '파일 분석 전문가'
        }));
        
        if (onAuthenticated) {
          onAuthenticated();
        }
      } else {
        setError('아이디 또는 비밀번호가 올바르지 않습니다.');
      }
    } catch (err) {
      setError('로그인 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-form" style={{ padding: '16px 0' }}>
      <h5 className="mb-3 text-center" style={{ fontWeight: 600, color: '#2d3748' }}>
        로그인
      </h5>
      
      <form onSubmit={handleSubmit}>
        {/* 아이디 입력 */}
        <div className="mb-3">
          <div className="input-group">
            <span className="input-group-text" style={{ background: '#f7fafc', border: '1px solid #e2e8f0' }}>
              <FaUser style={{ color: '#718096' }} />
            </span>
            <input
              type="text"
              name="username"
              className="form-control"
              placeholder="아이디"
              value={formData.username}
              onChange={handleChange}
              required
              style={{ border: '1px solid #e2e8f0', borderLeft: 'none' }}
            />
          </div>
        </div>

        {/* 비밀번호 입력 */}
        <div className="mb-3">
          <div className="input-group">
            <span className="input-group-text" style={{ background: '#f7fafc', border: '1px solid #e2e8f0' }}>
              <FaLock style={{ color: '#718096' }} />
            </span>
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              className="form-control"
              placeholder="비밀번호"
              value={formData.password}
              onChange={handleChange}
              required
              style={{ border: '1px solid #e2e8f0', borderLeft: 'none', borderRight: 'none' }}
            />
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => setShowPassword(!showPassword)}
              style={{ border: '1px solid #e2e8f0', borderLeft: 'none' }}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="alert alert-danger py-2" style={{ fontSize: '14px' }}>
            {error}
          </div>
        )}

        {/* 로그인 버튼 */}
        <button
          type="submit"
          className="btn btn-primary w-100 mb-3"
          disabled={loading}
          style={{ 
            padding: '12px',
            fontWeight: 600,
            background: '#3182ce',
            border: 'none'
          }}
        >
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              로그인 중...
            </>
          ) : (
            '로그인'
          )}
        </button>

        {/* 회원가입 링크 */}
        <div className="text-center">
          <span className="text-muted" style={{ fontSize: '14px' }}>
            계정이 없으신가요?{' '}
          </span>
          <button
            type="button"
            className="btn btn-link p-0"
            onClick={onGoSignup}
            style={{ fontSize: '14px', textDecoration: 'none' }}
          >
            회원가입
          </button>
        </div>
      </form>

      {/* 테스트 안내 */}
      <div className="mt-3 p-2" style={{ background: '#f0f8ff', border: '1px solid #bee5eb', borderRadius: '4px', fontSize: '12px', color: '#0c5460' }}>
        <strong>테스트 계정:</strong> admin / password
      </div>
    </div>
  );
}

export default LoginForm;

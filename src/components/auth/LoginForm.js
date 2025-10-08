import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaUser, FaLock, FaEye, FaEyeSlash, FaInfoCircle } from 'react-icons/fa';
import { login } from '../../services/ApiService';

function LoginForm({ onAuthenticated, onGoSignup }) {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 입력값 검증
    if (!formData.username.trim()) {
      setError('아이디를 입력해주세요.');
      return;
    }
    if (!formData.password) {
      setError('비밀번호를 입력해주세요.');
      return;
    }

    setError('');
    setLoading(true);
    
    try {
      const data = await login(formData.username, formData.password);
      
      // 로그인 성공 시
      if (data.result === 'success') {
        localStorage.setItem('sessionId', data.sessionId);
        localStorage.setItem('userInfo', JSON.stringify(data.user));
        
        if (onAuthenticated) {
          onAuthenticated(data.user);
        }
      } else {
        setError(data.message || '로그인에 실패했습니다.');
      }
    } catch (err) {
      console.error('로그인 에러:', err);
      setError(err.message || '로그인 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-form" style={{ padding: '16px 0' }}>
      <h5 className="mb-3 text-center">로그인</h5>
      
      {/* 안내 메시지 추가 */}
      <div className="alert alert-info d-flex align-items-center mb-3" role="alert">
        <FaInfoCircle className="me-2" />
        <small>
          처음 사용하시나요? 먼저 회원가입을 진행해주세요.
        </small>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="username" className="form-label">
            <FaUser style={{ marginRight: 8 }} /> 아이디
          </label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            className="form-control"
            autoComplete="username"
            placeholder="아이디를 입력하세요"
            disabled={loading}
          />
        </div>
        <div className="mb-3 position-relative">
          <label htmlFor="password" className="form-label">
            <FaLock style={{ marginRight: 8 }} /> 비밀번호
          </label>
          <input
            type={showPassword ? 'text' : 'password'}
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="form-control"
            autoComplete="current-password"
            placeholder="비밀번호를 입력하세요"
            disabled={loading}
          />
          <span
            style={{ 
              position: 'absolute', 
              right: 10, 
              top: 38, 
              cursor: 'pointer',
              color: '#6c757d'
            }}
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
            {error.includes('계정이 존재하지 않을') && (
              <div className="mt-2">
                <small>
                  <button 
                    type="button"
                    className="btn btn-sm btn-outline-primary"
                    onClick={onGoSignup}
                  >
                    회원가입 하러 가기
                  </button>
                </small>
              </div>
            )}
          </div>
        )}
        <button 
          type="submit" 
          className="btn btn-primary w-100 mb-2" 
          disabled={loading}
        >
          {loading ? '로그인 중...' : '로그인'}
        </button>
      </form>
      
      <div className="text-center">
        <button 
          className="btn btn-success w-100" 
          onClick={onGoSignup}
          disabled={loading}
        >
          회원가입 하러 가기
        </button>
      </div>
    </div>
  );
}

export default LoginForm;

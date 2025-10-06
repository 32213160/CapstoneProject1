// src/components/auth/SignupForm.js
import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaUser, FaLock, FaEye, FaEyeSlash, FaEnvelope } from 'react-icons/fa';

function SignupForm({ onSignedUp, onGoLogin }) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // 입력 시 해당 필드의 에러 메시지 초기화
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // 아이디 검증
    if (!formData.username.trim()) {
      newErrors.username = '아이디를 입력해주세요.';
    } else if (formData.username.length < 4) {
      newErrors.username = '아이디는 4자 이상이어야 합니다.';
    }

    // 이메일 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = '이메일을 입력해주세요.';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = '올바른 이메일 형식이 아닙니다.';
    }

    // 비밀번호 검증
    if (!formData.password) {
      newErrors.password = '비밀번호를 입력해주세요.';
    } else if (formData.password.length < 6) {
      newErrors.password = '비밀번호는 6자 이상이어야 합니다.';
    }

    // 비밀번호 확인 검증
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = '비밀번호 확인을 입력해주세요.';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = '비밀번호가 일치하지 않습니다.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // 실제로는 회원가입 API 호출
      // 여기서는 간단히 localStorage에 저장
      await new Promise(resolve => setTimeout(resolve, 1000)); // 로딩 시뮬레이션
      
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      
      // 중복 아이디 검사
      if (users.find(user => user.username === formData.username)) {
        setErrors({ username: '이미 사용중인 아이디입니다.' });
        return;
      }

      // 새 사용자 추가
      const newUser = {
        id: Date.now(),
        username: formData.username,
        email: formData.email,
        password: formData.password, // 실제로는 해시화해야 함
        name: formData.username,
        role: '일반 사용자',
        createdAt: new Date().toISOString()
      };

      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));

      alert('회원가입이 완료되었습니다!');
      
      if (onSignedUp) {
        onSignedUp();
      }
    } catch (error) {
      setErrors({ general: '회원가입 중 오류가 발생했습니다.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-form" style={{ padding: '16px 0' }}>
      <h5 className="mb-3 text-center" style={{ fontWeight: 600, color: '#2d3748' }}>
        회원가입
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
              className={`form-control ${errors.username ? 'is-invalid' : ''}`}
              placeholder="아이디 (4자 이상)"
              value={formData.username}
              onChange={handleChange}
              style={{ border: '1px solid #e2e8f0', borderLeft: 'none' }}
            />
          </div>
          {errors.username && <div className="text-danger" style={{ fontSize: '12px', marginTop: '4px' }}>{errors.username}</div>}
        </div>

        {/* 이메일 입력 */}
        <div className="mb-3">
          <div className="input-group">
            <span className="input-group-text" style={{ background: '#f7fafc', border: '1px solid #e2e8f0' }}>
              <FaEnvelope style={{ color: '#718096' }} />
            </span>
            <input
              type="email"
              name="email"
              className={`form-control ${errors.email ? 'is-invalid' : ''}`}
              placeholder="이메일"
              value={formData.email}
              onChange={handleChange}
              style={{ border: '1px solid #e2e8f0', borderLeft: 'none' }}
            />
          </div>
          {errors.email && <div className="text-danger" style={{ fontSize: '12px', marginTop: '4px' }}>{errors.email}</div>}
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
              className={`form-control ${errors.password ? 'is-invalid' : ''}`}
              placeholder="비밀번호 (6자 이상)"
              value={formData.password}
              onChange={handleChange}
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
          {errors.password && <div className="text-danger" style={{ fontSize: '12px', marginTop: '4px' }}>{errors.password}</div>}
        </div>

        {/* 비밀번호 확인 입력 */}
        <div className="mb-3">
          <div className="input-group">
            <span className="input-group-text" style={{ background: '#f7fafc', border: '1px solid #e2e8f0' }}>
              <FaLock style={{ color: '#718096' }} />
            </span>
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
              placeholder="비밀번호 확인"
              value={formData.confirmPassword}
              onChange={handleChange}
              style={{ border: '1px solid #e2e8f0', borderLeft: 'none', borderRight: 'none' }}
            />
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              style={{ border: '1px solid #e2e8f0', borderLeft: 'none' }}
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          {errors.confirmPassword && <div className="text-danger" style={{ fontSize: '12px', marginTop: '4px' }}>{errors.confirmPassword}</div>}
        </div>

        {/* 일반 에러 메시지 */}
        {errors.general && (
          <div className="alert alert-danger py-2" style={{ fontSize: '14px' }}>
            {errors.general}
          </div>
        )}

        {/* 회원가입 버튼 */}
        <button
          type="submit"
          className="btn btn-success w-100 mb-3"
          disabled={loading}
          style={{ 
            padding: '12px',
            fontWeight: 600,
            background: '#38a169',
            border: 'none'
          }}
        >
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              가입 중...
            </>
          ) : (
            '회원가입'
          )}
        </button>

        {/* 로그인 링크 */}
        <div className="text-center">
          <span className="text-muted" style={{ fontSize: '14px' }}>
            이미 계정이 있으신가요?{' '}
          </span>
          <button
            type="button"
            className="btn btn-link p-0"
            onClick={onGoLogin}
            style={{ fontSize: '14px', textDecoration: 'none' }}
          >
            로그인
          </button>
        </div>
      </form>
    </div>
  );
}

export default SignupForm;

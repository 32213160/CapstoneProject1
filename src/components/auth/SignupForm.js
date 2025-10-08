import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaUser, FaLock, FaEye, FaEyeSlash, FaEnvelope, FaInfoCircle } from 'react-icons/fa';
import { register } from '../../services/ApiService';

function SignupForm({ onSignedUp, onGoLogin }) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    name: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  // 테스트용 계정 정보 자동 입력
  const fillTestAccount = () => {
    setFormData({
      username: 'admin',
      email: 'admin@test.com',
      password: 'admin123',
      confirmPassword: 'admin123',
      name: '관리자'
    });
    setErrors({});
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.username.trim()) newErrors.username = '아이디를 입력해주세요.';
    else if (formData.username.length < 4) newErrors.username = '아이디는 4자 이상이어야 합니다.';
    if (!formData.email.trim()) newErrors.email = '이메일을 입력해주세요.';
    else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) newErrors.email = '유효한 이메일 주소가 아닙니다.';
    }
    if (!formData.password) newErrors.password = '비밀번호를 입력해주세요.';
    else if (formData.password.length < 6) newErrors.password = '비밀번호는 6자 이상이어야 합니다.';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = '비밀번호가 일치하지 않습니다.';
    if (!formData.name.trim()) newErrors.name = '실명을 입력해주세요.';

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }
    setLoading(true);
    try {
      const data = await register(
        formData.username,
        formData.password,
        formData.email,
        formData.name
      );
      if (data.result === 'success') {
        alert(`회원가입이 완료되었습니다!\n아이디: ${formData.username}\n이제 로그인할 수 있습니다.`);
        if (onSignedUp) onSignedUp();
      } else {
        alert(data.error || '회원가입에 실패했습니다.');
      }
    } catch (err) {
      console.error('회원가입 에러:', err);
      alert(err.message || '회원가입 도중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-form" style={{ padding: '16px 0' }}>
      <h5 className="mb-3 text-center">회원가입</h5>
      
      {/* 테스트용 계정 생성 도움말 */}
      <div className="alert alert-info d-flex align-items-center mb-3" role="alert">
        <FaInfoCircle className="me-2" />
        <div className="flex-grow-1">
          <small>테스트용 계정 정보를 자동으로 입력하려면</small>
        </div>
        <button 
          type="button" 
          className="btn btn-sm btn-outline-primary ms-2"
          onClick={fillTestAccount}
          disabled={loading}
        >
          자동 입력
        </button>
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
            className={`form-control ${errors.username ? 'is-invalid' : ''}`}
            disabled={loading}
            placeholder="4자 이상 입력하세요"
          />
          {errors.username && <div className="invalid-feedback">{errors.username}</div>}
        </div>
        <div className="mb-3">
          <label htmlFor="email" className="form-label">
            <FaEnvelope style={{ marginRight: 8 }} /> 이메일
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`form-control ${errors.email ? 'is-invalid' : ''}`}
            disabled={loading}
            placeholder="example@domain.com"
          />
          {errors.email && <div className="invalid-feedback">{errors.email}</div>}
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
            className={`form-control ${errors.password ? 'is-invalid' : ''}`}
            disabled={loading}
            placeholder="6자 이상 입력하세요"
          />
          <span
            style={{ position: 'absolute', right: 10, top: 38, cursor: 'pointer' }}
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
          {errors.password && <div className="invalid-feedback">{errors.password}</div>}
        </div>
        <div className="mb-3 position-relative">
          <label htmlFor="confirmPassword" className="form-label">
            <FaLock style={{ marginRight: 8 }} /> 비밀번호 확인
          </label>
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
            disabled={loading}
            placeholder="비밀번호를 다시 입력하세요"
          />
          <span
            style={{ position: 'absolute', right: 10, top: 38, cursor: 'pointer' }}
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
          {errors.confirmPassword && <div className="invalid-feedback">{errors.confirmPassword}</div>}
        </div>
        <div className="mb-3">
          <label htmlFor="name" className="form-label">
            실명
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`form-control ${errors.name ? 'is-invalid' : ''}`}
            disabled={loading}
            placeholder="실명을 입력하세요"
          />
          {errors.name && <div className="invalid-feedback">{errors.name}</div>}
        </div>
        <button type="submit" className="btn btn-success w-100 mb-2" disabled={loading}>
          {loading ? '회원가입 중...' : '회원가입'}
        </button>
      </form>
      <div className="text-center">
        <button 
          className="btn btn-link" 
          onClick={onGoLogin}
          disabled={loading}
        >
          이미 계정이 있나요? 로그인 하러 가기
        </button>
      </div>
    </div>
  );
}

export default SignupForm;

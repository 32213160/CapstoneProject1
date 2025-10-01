// src/core/BaseComponent.js
import React, { Component } from 'react';

/**
 * 추상화: 모든 컴포넌트의 기본이 되는 베이스 클래스
 * 캡슐화: 공통 상태 관리와 에러 처리 로직을 내부에 캡슐화
 */
export default class BaseComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      error: null,
      data: null
    };
  }

  // 캡슐화된 공통 메서드들
  setLoading = (loading) => {
    this.setState({ loading });
  }

  setError = (error) => {
    this.setState({ error });
  }

  setData = (data) => {
    this.setState({ data });
  }

  // 에러 처리 (공통 기능)
  componentDidCatch(error, errorInfo) {
    console.error('Component Error:', error, errorInfo);
    this.setError(error.message);
  }

  // 추상 메서드 - 하위 클래스에서 구현해야 함
  render() {
    throw new Error('render() method must be implemented by subclass');
    // eslint-disable-next-line
    return null;
  }

  // 공통 라이프사이클 관리
  componentDidMount() {
    this.onMount();
  }

  componentWillUnmount() {
    this.onUnmount();
  }

  // 하위 클래스에서 오버라이드 가능
  onMount() {}
  onUnmount() {}
}

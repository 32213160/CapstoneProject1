// src/components/ErrorBoundary/ErrorBoundary.js

import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // 다음 렌더링에서 폴백 UI가 보이도록 상태를 업데이트합니다.
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // 에러 정보를 기록합니다
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // 여기에 에러 로깅 서비스에 에러를 보내는 코드를 추가할 수 있습니다
  }

  render() {
    if (this.state.hasError) {
      // 폴백 UI를 커스터마이징할 수 있습니다
      return this.props.fallback || (
        <div className="error-boundary">
          <h2>오류가 발생했습니다</h2>
          <p>컴포넌트 렌더링 중 문제가 발생했습니다.</p>
          {this.props.showDetails && (
            <details style={{ whiteSpace: 'pre-wrap' }}>
              {this.state.error && this.state.error.toString()}
              <br />
              {this.state.errorInfo && this.state.errorInfo.componentStack}
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

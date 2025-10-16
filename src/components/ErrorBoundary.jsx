import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('==========================================');
    console.error('ErrorBoundary caught an error!');
    console.error('Error:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Component stack:', errorInfo.componentStack);
    console.error('==========================================');
  }

  render() {
    if (this.state.hasError) {
      console.warn('ErrorBoundary: Rendering fallback because hasError is true');
      return this.props.fallback || null;
    }

    return this.props.children;
  }
}

export default ErrorBoundary;


import React from 'react';

/**
 * Error Boundary Component
 * Catches React errors and displays a fallback UI
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error Boundary caught:', error, errorInfo);
    this.setState(prevState => ({
      ...prevState,
      errorInfo
    }));
  }

  handleReset = () => {
    this.setState({ 
      hasError: false, 
      error: null,
      errorInfo: null 
    });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
            <div className="text-6xl text-center mb-4">⚠️</div>
            
            <h1 className="text-2xl font-bold text-red-600 text-center mb-2">
              Oops! Something went wrong
            </h1>
            
            <p className="text-gray-600 text-sm text-center mb-6">
              An unexpected error occurred. Our team has been notified.
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-xs">
                <summary className="font-semibold text-red-700 cursor-pointer mb-2">
                  Error Details (Development Only)
                </summary>
                <pre className="text-red-600 overflow-auto max-h-40 whitespace-pre-wrap break-words">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}

            <div className="space-y-2">
              <button
                onClick={this.handleReset}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg transition duration-200"
              >
                🔄 Return to Login
              </button>
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-4 rounded-lg transition duration-200"
              >
                🔃 Reload Page
              </button>
            </div>

            <p className="text-xs text-gray-500 text-center mt-6">
              Error ID: {Date.now()}
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

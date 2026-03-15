import React from 'react';
import { AlertTriangle } from 'lucide-react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Error caught by boundary:', error, errorInfo);
        this.setState({
            error,
            errorInfo
        });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
                    <div className="max-w-md w-full glass-card p-8 text-center">
                        <AlertTriangle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
                        <h1 className="text-2xl font-bold text-slate-900 mb-2">
                            Oops! Something went wrong
                        </h1>
                        <p className="text-slate-600 mb-6">
                            We're sorry for the inconvenience. Please try refreshing the page.
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-sky-600 transition-colors font-medium shadow-lg shadow-sky-200"
                        >
                            Refresh Page
                        </button>
                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <details className="mt-6 text-left">
                                <summary className="cursor-pointer text-sm text-slate-500 hover:text-slate-700">
                                    Error Details (Dev Mode)
                                </summary>
                                <pre className="mt-2 p-4 bg-slate-100 rounded text-xs overflow-auto max-h-48">
                                    {this.state.error.toString()}
                                    {this.state.errorInfo && this.state.errorInfo.componentStack}
                                </pre>
                            </details>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;

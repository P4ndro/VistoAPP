import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import LoadingSpinner from '../components/LoadingSpinner';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const Login = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { isAuthenticated, isLoading, checkAuth, logout } = useAuthStore();

   
    const errorParam = searchParams.get('error');


    const getErrorMessage = (error) => {
        const errorMap = {
            'no_code': 'Authentication cancelled. Please try again.',
            'no_token': 'Failed to get access token. Please try again.',
            'auth_failed': 'Authentication failed. Please try again.',
        };
        return errorMap[error] || 'An error occurred during authentication. Please try again.';
    };

 
    useEffect(() => {
        checkAuth()
            .then((result) => {
                if (result.success) {
                    navigate('/dashboard', { replace: true });
                }
            })
            .catch((err) => {
               
                console.error('Auth check error:', err);
            });
    }, [checkAuth, navigate]);


    useEffect(() => {
        if (!isLoading && isAuthenticated) {
            navigate('/dashboard', { replace: true });
        }
    }, [isAuthenticated, isLoading, navigate]);

    
    const handleLogin = () => {
      
        window.location.href = `${API_URL}/auth/github`;
    };


    const handleClearSession = async () => {
        await logout();
      
        window.location.reload();
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <LoadingSpinner size="lg" text="Checking authentication..." />
            </div>
        );
    }

    // Show login UI
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
            <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Welcome to VistoAPP
                    </h1>
                    <p className="text-gray-600">
                        Sign in with GitHub to get started
                    </p>
                </div>

                {}
                {errorParam && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-sm text-red-800">
                            {getErrorMessage(errorParam)}
                        </p>
                    </div>
                )}

                {/* GitHub Login Button */}
                <button
                    onClick={handleLogin}
                    className="w-full flex items-center justify-center gap-3 bg-gray-900 hover:bg-gray-800 text-white font-medium py-3 px-4 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                    <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                    >
                        <path
                            fillRule="evenodd"
                            d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z"
                            clipRule="evenodd"
                        />
                    </svg>
                    <span>Continue with GitHub</span>
                </button>

                <p className="mt-6 text-center text-sm text-gray-500">
                    By signing in, you agree to our terms of service
                </p>

                {/* Clear session button (for troubleshooting) */}
                <div className="mt-4 text-center">
                    <button
                        onClick={handleClearSession}
                        className="text-sm text-gray-500 hover:text-gray-700 underline"
                    >
                        Clear session / Having issues?
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Login;

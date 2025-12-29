import { useEffect, useState } from 'react';
import { api } from '../utils/api';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import useAuthStore from '../store/authStore';

function Home() {
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [serverStatus, setServerStatus] = useState(null);
    const { isAuthenticated } = useAuthStore();

    useEffect(() => {
        api.get('/')
            .then(res => {
                setMessage(res.data.message || res.data);
                setServerStatus('connected');
                setLoading(false);
            })
            .catch(err => {
                console.error('Error fetching:', err);
                setMessage('Unable to connect to server');
                setServerStatus('disconnected');
                setLoading(false);
            });
    }, []);

    const isProduction = import.meta.env.PROD;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center mb-16">
                <div className="mb-6">
                    <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                        Welcome to VistoAPP
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
                        Transform your GitHub activity into a beautiful, customizable developer portfolio
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                    {isAuthenticated ? (
                        <Link
                            to="/dashboard"
                            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200"
                        >
                            Dashboard
                        </Link>
                    ) : (
                        <Link
                            to="/login"
                            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200"
                        >
                            Get Started
                        </Link>
                    )}
                    <Link
                        to="/about"
                        className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200"
                    >
                        Learn More
                    </Link>
                </div>
            </div>

            {/* Features Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">GitHub Integration</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                        Seamlessly connect your GitHub account and sync your repositories with one click
                    </p>
                </div>
                <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Statistics Dashboard</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                        View detailed insights about your coding activity, commits, and contributions
                    </p>
                </div>
                <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Custom Portfolio</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                        Design and customize your portfolio with themes, layouts, and export options
                    </p>
                </div>
            </div>

            {/* Server Status (only show in development) */}
            {!isProduction && (
                <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-semibold text-gray-700">Server Status</h2>
                        {loading ? (
                            <LoadingSpinner size="sm" />
                        ) : (
                            <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${serverStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                <span className={`text-sm font-medium ${serverStatus === 'connected' ? 'text-green-600' : 'text-red-600'}`}>
                                    {serverStatus === 'connected' ? 'Connected' : 'Disconnected'}
                                </span>
                            </div>
                        )}
                    </div>
                    {!loading && (
                        <p className={`text-sm mt-2 ${serverStatus === 'connected' ? 'text-green-700' : 'text-red-700'}`}>
                            {message}
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}

export default Home;


import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import ProtectedRoute from '../components/ProtectedRoute';

const Dashboard = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuthStore();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <ProtectedRoute>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            {user?.avatarUrl && (
                                <img
                                    src={user.avatarUrl}
                                    alt={user.username}
                                    className="w-16 h-16 rounded-full border-2 border-gray-200"
                                />
                            )}
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">
                                    Welcome, {user?.username || 'User'}!
                                </h1>
                                <p className="text-gray-600 mt-1">
                                    GitHub Statistics Overview
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Link
                                to="/dashboard/design"
                                className="px-4 py-2 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                            >
                                Design Portfolio
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-2">
                            Repositories
                        </h2>
                        <p className="text-3xl font-bold text-gray-900">-</p>
                        <p className="text-sm text-gray-500 mt-1">
                            GitHub repositories
                        </p>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-2">
                            Languages
                        </h2>
                        <p className="text-3xl font-bold text-gray-900">-</p>
                        <p className="text-sm text-gray-500 mt-1">
                            Programming languages
                        </p>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-2">
                            Activity
                        </h2>
                        <p className="text-3xl font-bold text-gray-900">-</p>
                        <p className="text-sm text-gray-500 mt-1">
                            Recent commits
                        </p>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                        GitHub Statistics
                    </h2>
                    <p className="text-gray-600 mb-4">
                        Your GitHub statistics will appear here after we sync your data from GitHub.
                    </p>
                    <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                        <p className="text-sm text-blue-800">
                            <strong>Next step:</strong> Sync your GitHub data to view your statistics, then design your portfolio.
                        </p>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
};

export default Dashboard;


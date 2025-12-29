import { useNavigate, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import useAuthStore from '../store/authStore';
import useStatsStore from '../store/statsStore';
import useExportsStore from '../store/exportsStore';
import ProtectedRoute from '../components/ProtectedRoute';
import LoadingSpinner from '../components/LoadingSpinner';
import RepoCard from '../components/RepoCard';
import ViewExportModal from '../components/ViewExportModal';
import SyncModal from '../components/SyncModal';

const Dashboard = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuthStore();
    const { stats, isLoading, isSyncing, error, fetchStats, syncStats } = useStatsStore();
    const { exports: savedExports, isLoading: exportsLoading, error: exportsError, fetchExports, deleteExport } = useExportsStore();
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [viewingExportId, setViewingExportId] = useState(null);

    
    const repositories = stats?.repositories || [];
    const hasRepositories = Array.isArray(repositories) && repositories.length > 0;

    
    const last6Repos = hasRepositories
        ? [...repositories]
            .sort((a, b) => {
                // Use pushedAt if available, fallback to updatedAt
                const dateA = a.pushedAt ? new Date(a.pushedAt) : new Date(a.updatedAt);
                const dateB = b.pushedAt ? new Date(b.pushedAt) : new Date(b.updatedAt);
               
                return dateB - dateA;
            })
            .slice(0, 6)
        : [];

    useEffect(() => {
        fetchStats();
        fetchExports();
    }, [fetchStats, fetchExports]);

    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Logout error:', error);
            setIsLoggingOut(false);
        }
    };

    const handleSync = async () => {
        const result = await syncStats();
        if (result.success) {
            // Stats updated, no need to refetch since syncStats updates the store
        }
    };

    const formatLanguages = (languages) => {
        if (!languages || typeof languages !== 'object') return null;
        const langArray = Object.entries(languages)
            .sort((a, b) => parseFloat(b[1]) - parseFloat(a[1]))
            .slice(0, 5)
            .map(([lang, pct]) => `${lang} (${pct}%)`);
        return langArray.join(', ');
    };

    const StatCard = ({ title, value, description, icon }) => (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-gray-900">
                    {title}
                </h2>
                {icon && (
                    <div className="text-gray-400">
                        {icon}
                    </div>
                )}
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">
                {value || '-'}
            </p>
            <p className="text-sm text-gray-500">
                {description}
            </p>
        </div>
    );

    return (
        <ProtectedRoute>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
                {/* Header Card */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-8 mb-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex items-center gap-4">
                            {user?.avatarUrl ? (
                                <img
                                    src={user.avatarUrl}
                                    alt={user.username}
                                    className="w-14 h-14 md:w-16 md:h-16 rounded-full border-2 border-gray-200 object-cover"
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                    }}
                                />
                            ) : (
                                <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-gray-200 flex items-center justify-center">
                                    <span className="text-gray-500 text-xl font-semibold">
                                        {user?.username?.charAt(0)?.toUpperCase() || 'U'}
                                    </span>
                                </div>
                            )}
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                                    Welcome, {user?.username || 'User'}!
                                </h1>
                                <p className="text-gray-600 mt-1 text-sm md:text-base">
                                    GitHub Statistics Overview
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                            <button
                                onClick={handleSync}
                                disabled={isSyncing || isLoading}
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-md active:scale-95"
                            >
                                {isSyncing ? (
                                    <span className="flex items-center gap-2">
                                        <LoadingSpinner size="sm" />
                                        Syncing...
                                    </span>
                                ) : (
                                    '🔄 Sync GitHub Data'
                                )}
                            </button>
                            <Link
                                to="/dashboard/design"
                                className="px-4 py-2 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                            >
                                Design Portfolio
                            </Link>
                            <button
                                onClick={handleLogout}
                                disabled={isLoggingOut}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                            >
                                {isLoggingOut ? 'Logging out...' : 'Logout'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Statistics Cards */}
                {isLoading ? (
                    <div className="flex justify-center items-center py-12">
                        <LoadingSpinner />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        <StatCard
                            title="Repositories"
                            value={stats?.repositoryCount ?? '-'}
                            description="GitHub repositories"
                            icon={
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            }
                        />
                        <StatCard
                            title="Languages"
                            value={stats?.languages ? Object.keys(stats.languages).length : '-'}
                            description={stats?.languages ? formatLanguages(stats.languages) || 'Programming languages' : 'Programming languages'}
                            icon={
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                                </svg>
                            }
                        />
                        <StatCard
                            title="Activity"
                            value={stats?.recentCommits ?? '-'}
                            description="Recent commits"
                            icon={
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            }
                        />
                    </div>
                )}

                {/* Recent Repositories Section */}
                {hasRepositories && last6Repos.length > 0 && (
                    <div className="mb-8">
                        <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">
                            Recent Repositories
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {last6Repos.map((repo) => (
                                <RepoCard key={repo.githubId || repo.fullName} repo={repo} />
                            ))}
                        </div>
                    </div>
                )}

                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
                        <p className="text-sm text-red-800">{error}</p>
                    </div>
                )}

                {/* Info Section */}
                {!stats && !isLoading && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-8 text-center">
                        <div className="max-w-md mx-auto">
                            <div className="bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">
                                No Statistics Yet
                            </h2>
                            <p className="text-gray-600 mb-6">
                                Your GitHub statistics will appear here after you sync your data from GitHub.
                            </p>
                            <div className="bg-linear-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                                <p className="text-sm text-blue-900">
                                    <strong className="font-semibold">💡 Get Started:</strong> Click "Sync GitHub Data" above to fetch your repository statistics, then design your portfolio.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
                
                {/* Saved Exports Section */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                            Saved Exports
                        </h2>
                        <Link
                            to="/dashboard/export"
                            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                        >
                            Export Portfolio →
                        </Link>
                    </div>
                    {exportsLoading ? (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-8">
                            <div className="flex justify-center items-center py-8">
                                <LoadingSpinner />
                            </div>
                        </div>
                    ) : savedExports && savedExports.length > 0 ? (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {savedExports.map((exportItem) => (
                                    <div
                                        key={exportItem._id}
                                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-gray-300 transition-all duration-200 bg-white"
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <h3 className="font-semibold text-gray-900 text-sm">
                                                {exportItem.tag}
                                            </h3>
                                            <button
                                                onClick={async () => {
                                                    if (window.confirm('Are you sure you want to delete this export?')) {
                                                        await deleteExport(exportItem._id);
                                                        fetchExports(); // Refresh list
                                                    }
                                                }}
                                                className="text-red-600 hover:text-red-700 text-xs"
                                                title="Delete export"
                                            >
                                                ×
                                            </button>
                                        </div>
                                        <p className="text-xs text-gray-500 mb-3">
                                            {new Date(exportItem.createdAt).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </p>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                                                {exportItem.exportData?.format || 'Export'}
                                            </span>
                                            <button
                                                onClick={() => setViewingExportId(exportItem._id)}
                                                className="px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-all duration-200 hover:scale-105 active:scale-95"
                                                title="View export"
                                            >
                                                👁️ View
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 md:p-12 text-center">
                            <div className="max-w-sm mx-auto">
                                <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Exports Yet</h3>
                                <p className="text-gray-600 text-sm mb-4">
                                    Export your portfolio and add a tag to save it here for easy access.
                                </p>
                                <Link
                                    to="/dashboard/export"
                                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                                >
                                    Go to Export Page →
                                </Link>
                            </div>
                        </div>
                    )}
                    {exportsError && (
                        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
                            <p className="text-sm text-red-800">{exportsError}</p>
                        </div>
                    )}
                </div>

                {/* Sync Modal */}
                <SyncModal isOpen={isSyncing} />

                {/* View Export Modal */}
                <ViewExportModal
                    exportId={viewingExportId}
                    isOpen={!!viewingExportId}
                    onClose={() => setViewingExportId(null)}
                />

                {stats && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-8">
                        <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">
                            Statistics Details
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-600">Total Stars</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.totalStars || 0}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Total Forks</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.totalForks || 0}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Total Commits</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.totalCommits || 0}</p>
                            </div>
                            {stats.syncedAt && (
                                <div>
                                    <p className="text-sm text-gray-600">Last Synced</p>
                                    <p className="text-lg font-semibold text-gray-900">
                                        {new Date(stats.syncedAt).toLocaleString()}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </ProtectedRoute>
    );
};

export default Dashboard;


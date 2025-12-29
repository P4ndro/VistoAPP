import { useState, useEffect } from 'react';
import useExportsStore from '../store/exportsStore';
import useStatsStore from '../store/statsStore';
import useAuthStore from '../store/authStore';
import PortfolioRenderer from './PortfolioRenderer';
import LoadingSpinner from './LoadingSpinner';

const ViewExportModal = ({ exportId, isOpen, onClose }) => {
    const { fetchExportById, isLoading: exportLoading, error: exportError } = useExportsStore();
    const { stats, fetchStats } = useStatsStore();
    const { user } = useAuthStore();
    const [exportData, setExportData] = useState(null);

    useEffect(() => {
        if (isOpen && exportId) {
            // Fetch the export data
            fetchExportById(exportId).then((result) => {
                if (result.success) {
                    setExportData(result.export);
                }
            });
            // Ensure stats are loaded
            if (!stats) {
                fetchStats();
            }
        } else {
            // Reset when modal closes
            setExportData(null);
        }
    }, [isOpen, exportId, fetchExportById, fetchStats, stats]);

    if (!isOpen) return null;

    const isLoading = exportLoading || !exportData || !stats;
    const savedConfig = exportData?.exportData?.config;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto animate-in fade-in duration-200">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black bg-opacity-50 transition-opacity animate-in fade-in duration-200"
                onClick={onClose}
            ></div>

            {/* Modal */}
            <div className="flex min-h-full items-center justify-center p-4">
                <div className="relative bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-200">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">
                                {exportData?.tag || 'View Export'}
                            </h2>
                            {exportData?.createdAt && (
                                <p className="text-sm text-gray-500 mt-1">
                                    Exported on{' '}
                                    {new Date(exportData.createdAt).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </p>
                            )}
                            {exportData?.exportData?.format && (
                                <p className="text-xs text-gray-400 mt-1">
                                    Format: {exportData.exportData.format}
                                </p>
                            )}
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-all duration-200 hover:bg-gray-100 rounded-full p-1"
                            aria-label="Close"
                        >
                            <svg
                                className="w-6 h-6"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <LoadingSpinner />
                            </div>
                        ) : exportError ? (
                            <div className="bg-red-50 border border-red-200 rounded-md p-4">
                                <p className="text-sm text-red-800">{exportError}</p>
                            </div>
                        ) : savedConfig ? (
                            <div className="bg-white rounded-lg shadow-sm p-4">
                                <PortfolioRenderer
                                    config={savedConfig}
                                    stats={stats}
                                    user={user}
                                />
                            </div>
                        ) : (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                                <p className="text-sm text-yellow-800">
                                    No configuration data found for this export.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-white">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ViewExportModal;


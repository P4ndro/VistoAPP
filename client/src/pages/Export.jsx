import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useConfigStore from '../store/configStore';
import useStatsStore from '../store/statsStore';
import useAuthStore from '../store/authStore';
import ProtectedRoute from '../components/ProtectedRoute';
import LoadingSpinner from '../components/LoadingSpinner';

const Export = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const { config, fetchConfig } = useConfigStore();
    const { stats, fetchStats } = useStatsStore();
    const [isExporting, setIsExporting] = useState(false);
    const [exportProgress, setExportProgress] = useState(0);
    const [exportComplete, setExportComplete] = useState(false);

    useEffect(() => {
        fetchConfig();
        fetchStats();
    }, [fetchConfig, fetchStats]);

    useEffect(() => {
        if (config && stats && !exportComplete && !isExporting) {
            startExport();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [config, stats]);

    const startExport = async () => {
        setIsExporting(true);
        setExportProgress(0);

        // Simulate export progress
        const progressInterval = setInterval(() => {
            setExportProgress(prev => {
                if (prev >= 90) {
                    clearInterval(progressInterval);
                    return 90;
                }
                return prev + 10;
            });
        }, 200);

        // In a real implementation, this would:
        // 1. Render the portfolio to a canvas using html2canvas
        // 2. Generate PDF using jsPDF
        // 3. Download the files

        // Simulate export process
        setTimeout(() => {
            clearInterval(progressInterval);
            setExportProgress(100);
            setTimeout(() => {
                setIsExporting(false);
                setExportComplete(true);
            }, 500);
        }, 2000);
    };

    const handleDownload = (format) => {
        // TODO: Implement actual download logic
        console.log(`Downloading as ${format}...`);
        // For now, just show a message
        alert(`${format} export would be downloaded here. Implementation coming soon!`);
    };

    if (!config || !stats) {
        return (
            <ProtectedRoute>
                <div className="flex items-center justify-center min-h-screen bg-gray-50">
                    <LoadingSpinner />
                </div>
            </ProtectedRoute>
        );
    }

    if (isExporting) {
        return (
            <ProtectedRoute>
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8 max-w-md w-full mx-4">
                        <div className="text-center">
                            <LoadingSpinner size="lg" />
                            <h2 className="text-2xl font-bold text-gray-900 mt-6 mb-2">
                                Exporting Your Portfolio
                            </h2>
                            <p className="text-gray-600 mb-6">
                                Please wait while we generate your portfolio...
                            </p>
                            <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                                <div
                                    className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                                    style={{ width: `${exportProgress}%` }}
                                ></div>
                            </div>
                            <p className="text-sm text-gray-500">{exportProgress}% complete</p>
                        </div>
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    if (exportComplete) {
        return (
            <ProtectedRoute>
                <div className="min-h-screen bg-gray-50 py-12">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8">
                            <div className="text-center mb-8">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg
                                        className="w-8 h-8 text-green-600"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M5 13l4 4L19 7"
                                        />
                                    </svg>
                                </div>
                                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                                    Export Complete!
                                </h2>
                                <p className="text-gray-600">
                                    Your portfolio has been successfully generated.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                                <button
                                    onClick={() => handleDownload('PNG')}
                                    className="flex items-center justify-center gap-3 p-4 border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                                >
                                    <svg
                                        className="w-6 h-6 text-gray-600"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                        />
                                    </svg>
                                    <div className="text-left">
                                        <div className="font-semibold text-gray-900">Download PNG</div>
                                        <div className="text-sm text-gray-500">High quality image</div>
                                    </div>
                                </button>

                                <button
                                    onClick={() => handleDownload('PDF')}
                                    className="flex items-center justify-center gap-3 p-4 border-2 border-gray-300 rounded-lg hover:border-red-500 hover:bg-red-50 transition-colors"
                                >
                                    <svg
                                        className="w-6 h-6 text-gray-600"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                                        />
                                    </svg>
                                    <div className="text-left">
                                        <div className="font-semibold text-gray-900">Download PDF</div>
                                        <div className="text-sm text-gray-500">Printable document</div>
                                    </div>
                                </button>
                            </div>

                            <div className="flex gap-4 justify-center">
                                <button
                                    onClick={() => navigate('/dashboard/design')}
                                    className="px-6 py-2 bg-gray-200 text-gray-700 font-medium rounded-md hover:bg-gray-300 transition-colors"
                                >
                                    Back to Design
                                </button>
                                <button
                                    onClick={() => navigate('/dashboard')}
                                    className="px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
                                >
                                    Go to Dashboard
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    return null;
};

export default Export;


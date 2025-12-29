import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import useConfigStore from '../store/configStore';
import useStatsStore from '../store/statsStore';
import useAuthStore from '../store/authStore';
import useExportsStore from '../store/exportsStore';
import ProtectedRoute from '../components/ProtectedRoute';
import LoadingSpinner from '../components/LoadingSpinner';
import { exportToPNG, exportToPDF } from '../utils/exportUtils';
import PortfolioRenderer from '../components/PortfolioRenderer'; 

const Export = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const { config, fetchConfig } = useConfigStore();
    const { stats, fetchStats } = useStatsStore();
    const { saveExport } = useExportsStore();
    const [exportError, setExportError] = useState(null);
    const [exportTag, setExportTag] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [lastExportType, setLastExportType] = useState(null); // 'PNG' or 'PDF'
    const portfolioRef = useRef(null);

    useEffect(() => {
        fetchConfig();
        fetchStats();
    }, [fetchConfig, fetchStats]);

    const handleDownloadPNG = async () => {
        if (!portfolioRef.current) {
            setExportError('Portfolio not ready. Please try again.');
            return;
        }

        try {
            setExportError(null);
            const filename = `${user?.username || 'portfolio'}_portfolio.png`;
            await exportToPNG(portfolioRef.current, filename);
            setLastExportType('PNG');
            
            // Auto-save if tag is provided
            if (exportTag.trim()) {
                await handleSaveExport('PNG');
            }
        } catch (error) {
            console.error('PNG export error:', error);
            const errorMessage = error?.message || 'Unknown error occurred';
            setExportError(`Failed to export PNG: ${errorMessage}. Please check the browser console for details.`);
        }
    };

    const handleDownloadPDF = async () => {
        if (!portfolioRef.current) {
            setExportError('Portfolio not ready. Please try again.');
            return;
        }

        try {
            setExportError(null);
            const filename = `${user?.username || 'portfolio'}_portfolio.pdf`;
            await exportToPDF(portfolioRef.current, filename);
            setLastExportType('PDF');
            
            // Auto-save if tag is provided
            if (exportTag.trim()) {
                await handleSaveExport('PDF');
            }
        } catch (error) {
            console.error('PDF export error:', error);
            const errorMessage = error?.message || 'Unknown error occurred';
            setExportError(`Failed to export PDF: ${errorMessage}. Please check the browser console for details.`);
        }
    };

    const handleSaveExport = async (format) => {
        if (!exportTag.trim()) {
            setExportError('Please enter a tag to save this export.');
            return;
        }

        setIsSaving(true);
        setExportError(null);

        try {
            const result = await saveExport(exportTag.trim(), {
                format,
                config: config,
                exportedAt: new Date().toISOString(),
            });

            if (result.success) {
                setExportTag(''); // Clear tag after successful save
                setLastExportType(null);
            } else {
                setExportError(result.error || 'Failed to save export');
            }
        } catch (error) {
            console.error('Save export error:', error);
            setExportError('Failed to save export. Please try again.');
        } finally {
            setIsSaving(false);
        }
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

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <button
                                    onClick={() => navigate('/dashboard')}
                                    className="text-blue-600 hover:text-blue-700 mb-2 inline-block transition-colors text-sm"
                                >
                                    ← Back to Dashboard
                                </button>
                                <h1 className="text-2xl font-bold text-gray-900">Export Portfolio</h1>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Two Column Layout */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Left Column: Preview */}
                        <div>
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Preview</h2>
                                <div ref={portfolioRef}>
                                    <PortfolioRenderer config={config} stats={stats} user={user} />
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Export Options */}
                        <div className="lg:sticky lg:top-20 lg:h-fit">
                            <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Export Options</h2>
                                
                                {/* Tag Input */}
                                <div className="mb-6">
                                    <label htmlFor="export-tag" className="block text-sm font-medium text-gray-700 mb-2">
                                        Tag this export (optional)
                                    </label>
                                    <input
                                        id="export-tag"
                                        type="text"
                                        value={exportTag}
                                        onChange={(e) => setExportTag(e.target.value)}
                                        placeholder="e.g., 'Portfolio v1', 'Job Application'"
                                        maxLength={100}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Add a tag to save this export to your dashboard
                                    </p>
                                </div>

                                {/* Error Message */}
                                {exportError && (
                                    <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
                                        <p className="text-sm text-red-800">{exportError}</p>
                                    </div>
                                )}

                                {/* Success Message */}
                                {lastExportType && !exportTag.trim() && (
                                    <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4">
                                        <p className="text-sm text-green-800">
                                            {lastExportType} exported successfully! Add a tag above to save it to your dashboard.
                                        </p>
                                    </div>
                                )}

                                {/* Download Buttons */}
                                <div className="space-y-4 mb-6">
                                    <button
                                        onClick={handleDownloadPNG}
                                        className="w-full flex items-center justify-center gap-3 p-4 border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
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
                                        onClick={handleDownloadPDF}
                                        className="w-full flex items-center justify-center gap-3 p-4 border-2 border-gray-300 rounded-lg hover:border-red-500 hover:bg-red-50 transition-colors"
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

                                {/* Save Export Button (if tag is provided) */}
                                {exportTag.trim() && lastExportType && (
                                    <div className="mb-6">
                                        <button
                                            onClick={() => handleSaveExport(lastExportType)}
                                            disabled={isSaving}
                                            className="w-full px-4 py-2 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            {isSaving ? 'Saving...' : `Save ${lastExportType} Export`}
                                        </button>
                                    </div>
                                )}

                                {/* Navigation Buttons */}
                                <div className="space-y-2 pt-4 border-t border-gray-200">
                                    <button
                                        onClick={() => navigate('/dashboard/design')}
                                        className="w-full px-4 py-2 bg-gray-200 text-gray-700 font-medium rounded-md hover:bg-gray-300 transition-colors"
                                    >
                                        Back to Design
                                    </button>
                                    <button
                                        onClick={() => navigate('/dashboard')}
                                        className="w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
                                    >
                                        Done - Go to Dashboard
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
};

export default Export;


import LoadingSpinner from './LoadingSpinner';

const SyncModal = ({ isOpen, progress }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
            {/* Modal - no backdrop, just floating modal */}
            <div className="relative bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full mx-4 pointer-events-auto animate-in zoom-in-95 duration-200 border border-gray-200">
                <div className="text-center">
                    <div className="mb-4">
                        <LoadingSpinner size="lg" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        Syncing GitHub Data
                    </h3>
                    <p className="text-gray-600 text-sm mb-4">
                        Fetching your repositories, commits, and statistics...
                    </p>
                    {progress && (
                        <div className="mt-4">
                            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                <div 
                                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${progress}%` }}
                                ></div>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">{progress}%</p>
                        </div>
                    )}
                    <p className="text-xs text-gray-500 mt-4">
                        This may take a few moments
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SyncModal;


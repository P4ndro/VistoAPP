import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useConfigStore from '../store/configStore';
import useStatsStore from '../store/statsStore';
import useAuthStore from '../store/authStore';
import ProtectedRoute from '../components/ProtectedRoute';
import LoadingSpinner from '../components/LoadingSpinner';

const Design = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const { config, isLoading: configLoading, isSaving, error: configError, fetchConfig, saveConfig, clearError } = useConfigStore();
    const { stats, isLoading: statsLoading, fetchStats } = useStatsStore();

    // Local state (changes in UI before saving)
    const [selectedLayout, setSelectedLayout] = useState('default');
    const [selectedTheme, setSelectedTheme] = useState('light');
    const [selectedPinnedRepos, setSelectedPinnedRepos] = useState([]);
    const [customTextSections, setCustomTextSections] = useState([]);
    const [itemOrder, setItemOrder] = useState([]); // Unified order: ['repo-123', 'text-456', 'repo-789', ...]
    const [visibleStats, setVisibleStats] = useState([
        { id: 'repos', label: 'Repos', value: 0, visible: true },
        { id: 'stars', label: 'Stars', value: 0, visible: true },
        { id: 'commits', label: 'Commits', value: 0, visible: true },
    ]);
    const [searchQuery, setSearchQuery] = useState('');
    const [draggedItem, setDraggedItem] = useState(null);
    const [dragOverIndex, setDragOverIndex] = useState(null);
    const [statsDragItem, setStatsDragItem] = useState(null);
    const [statsDragOverIndex, setStatsDragOverIndex] = useState(null);
    const [editingTextId, setEditingTextId] = useState(null);
    const [newTextContent, setNewTextContent] = useState('');
    const [itemSizes, setItemSizes] = useState({}); // { 'repo-123': { width, height }, 'text-456': { width, height }, 'stat-repos': { width, height } }
    const [resizingItem, setResizingItem] = useState(null);
    const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });

    // Load data on mount
    useEffect(() => {
        fetchConfig();
        fetchStats();
    }, [fetchConfig, fetchStats]);

    // Sync local state with loaded config
    useEffect(() => {
        if (config) {
            setSelectedLayout(config.layout || 'default');
            setSelectedTheme(config.theme || 'light');
            setSelectedPinnedRepos(config.pinnedRepos || []);
            setCustomTextSections(config.customTextSections || []);
            // Load visibleStats from config, ensuring we always have all three stats
            const savedStats = config.visibleStats || [];
            const allStatIds = ['repos', 'stars', 'commits'];
            const savedStatsMap = new Map(savedStats.map(s => [s.id, s]));
            
            // Ensure all three stats exist, use saved data or defaults
            const loadedStats = allStatIds.map(id => {
                const saved = savedStatsMap.get(id);
                return saved || {
                    id,
                    label: id === 'repos' ? 'Repos' : id === 'stars' ? 'Stars' : 'Commits',
                    visible: true, // Default to visible if not saved
                };
            });
            
            // Set visibleStats with values from stats if available, otherwise 0
            if (stats) {
                setVisibleStats(loadedStats.map(stat => ({
                    ...stat,
                    value: stat.id === 'repos' ? (stats.repositoryCount || 0) :
                           stat.id === 'stars' ? (stats.totalStars || 0) :
                           stat.id === 'commits' ? (stats.totalCommits || 0) : 0
                })));
            } else {
                // Set with 0 values, will be updated when stats loads
                setVisibleStats(loadedStats.map(stat => ({
                    ...stat,
                    value: 0
                })));
            }
            // Always set itemOrder from config if it exists (preserve saved order)
            if (config.itemOrder && config.itemOrder.length > 0) {
                setItemOrder(config.itemOrder);
            } else {
                // Initialize if no saved order exists
                const repoIds = (config.pinnedRepos || []).map(id => `repo-${id}`);
                const textIds = (config.customTextSections || []).map(section => `text-${section.id}`);
                setItemOrder([...repoIds, ...textIds]);
            }
            if (config.itemSizes && Object.keys(config.itemSizes).length > 0) {
                setItemSizes(config.itemSizes);
            }
        }
    }, [config, stats]); // Include stats in dependencies so values update when stats loads

    // Sync item order when repos or text sections change (only if order doesn't match)
    useEffect(() => {
        const repoIds = selectedPinnedRepos.map(id => `repo-${id}`);
        const textIds = customTextSections.map(section => `text-${section.id}`);
        const expectedIds = [...repoIds, ...textIds];
        
        setItemOrder(prevOrder => {
            // If order is empty, initialize it
            if (prevOrder.length === 0) {
                return expectedIds;
            }
            
            // Check if all expected IDs are in the order
            const prevIdsSet = new Set(prevOrder);
            const expectedIdsSet = new Set(expectedIds);
            
            // Only update if items have changed (added or removed)
            if (prevIdsSet.size !== expectedIdsSet.size || 
                ![...expectedIdsSet].every(id => prevIdsSet.has(id))) {
                // Maintain existing order for items that still exist, add new ones at the end
                const existingOrder = prevOrder.filter(id => expectedIdsSet.has(id));
                const newIds = expectedIds.filter(id => !prevIdsSet.has(id));
                return [...existingOrder, ...newIds];
            }
            // If all items match, preserve the existing order
            return prevOrder;
        });
    }, [selectedPinnedRepos, customTextSections]);

    // Update stats values when stats data loads
    useEffect(() => {
        if (stats) {
            setVisibleStats(prev => {
                // Ensure we have all three stats, preserve visibility and order
                const allStatIds = ['repos', 'stars', 'commits'];
                const existingStatsMap = new Map(prev.map(s => [s.id, s]));
                
                return allStatIds.map(id => {
                    const existing = existingStatsMap.get(id);
                    return {
                        id,
                        label: existing?.label || (id === 'repos' ? 'Repos' : id === 'stars' ? 'Stars' : 'Commits'),
                        visible: existing?.visible !== undefined ? existing.visible : true,
                        value: id === 'repos' ? (stats.repositoryCount || 0) :
                               id === 'stars' ? (stats.totalStars || 0) :
                               id === 'commits' ? (stats.totalCommits || 0) : 0
                    };
                });
            });
        }
    }, [stats]);

    // Clear error on unmount
    useEffect(() => {
        return () => {
            clearError();
        };
    }, [clearError]);

    const isLoading = configLoading || statsLoading;
    const repositories = stats?.repositories || [];
    const hasRepositories = Array.isArray(repositories) && repositories.length > 0;

    // Get pinned repos as array (for display in selected section)
    const pinnedRepos = selectedPinnedRepos
        .map(id => repositories.find(r => r.githubId === id))
        .filter(Boolean);
    
    // Get pinned repos as Map (for efficient lookup in preview items)
    const pinnedReposMap = new Map(
        pinnedRepos.map(repo => [repo.githubId, repo])
    );
    
    // Get available repos (not pinned, filtered by search)
    const availableRepos = repositories.filter(repo => 
        !selectedPinnedRepos.includes(repo.githubId) &&
        (repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
         (repo.description && repo.description.toLowerCase().includes(searchQuery.toLowerCase())))
    );

    // Create a map of text sections by ID
    const textSectionsMap = new Map(
        customTextSections.map(section => [`text-${section.id}`, section])
    );

    // Build preview items in the order specified by itemOrder
    const previewItems = itemOrder
        .map(id => {
            if (id.startsWith('repo-')) {
                const repoId = parseInt(id.replace('repo-', ''));
                const repo = pinnedReposMap.get(repoId);
                return repo ? { type: 'repo', data: repo, id } : null;
            } else if (id.startsWith('text-')) {
                const section = textSectionsMap.get(id);
                return section ? { type: 'text', data: section, id } : null;
            }
            return null;
        })
        .filter(Boolean);

    const handleAddPin = (repoId) => {
        if (selectedPinnedRepos.length < 6) {
            setSelectedPinnedRepos([...selectedPinnedRepos, repoId]);
            // Add to end of order
            setItemOrder([...itemOrder, `repo-${repoId}`]);
        }
    };

    const handleRemovePin = (repoId) => {
        setSelectedPinnedRepos(selectedPinnedRepos.filter(id => id !== repoId));
        // Remove from order
        setItemOrder(itemOrder.filter(id => id !== `repo-${repoId}`));
    };

    const handleAddTextSection = () => {
        const newSection = {
            id: Date.now(),
            title: 'New Section',
            content: 'Add your content here...',
        };
        setCustomTextSections([...customTextSections, newSection]);
        // Add to end of order
        setItemOrder([...itemOrder, `text-${newSection.id}`]);
        setEditingTextId(newSection.id);
    };

    const handleDeleteTextSection = (id) => {
        setCustomTextSections(customTextSections.filter(section => section.id !== id));
        // Remove from order
        setItemOrder(itemOrder.filter(itemId => itemId !== `text-${id}`));
    };

    const handleUpdateTextSection = (id, field, value) => {
        setCustomTextSections(customTextSections.map(section => 
            section.id === id ? { ...section, [field]: value } : section
        ));
    };

    // Drag and drop handlers
    const handleDragStart = (e, index) => {
        setDraggedItem(index);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e, index) => {
        e.preventDefault();
        setDragOverIndex(index);
    };

    const handleDragEnd = () => {
        setDraggedItem(null);
        setDragOverIndex(null);
    };

    const handleDrop = (e, dropIndex) => {
        e.preventDefault();
        if (draggedItem === null || draggedItem === dropIndex) {
            setDragOverIndex(null);
            return;
        }

        // Reorder the itemOrder array based on drag and drop
        const newOrder = [...itemOrder];
        const [removed] = newOrder.splice(draggedItem, 1);
        newOrder.splice(dropIndex, 0, removed);
        
        setItemOrder(newOrder);
        setDraggedItem(null);
        setDragOverIndex(null);
    };

    const handleToggleStat = (statId) => {
        setVisibleStats(prev => prev.map(stat => 
            stat.id === statId ? { ...stat, visible: !stat.visible } : stat
        ));
    };

    const handleRemoveStat = (statId) => {
        // Mark as not visible instead of removing
        setVisibleStats(prev => prev.map(stat => 
            stat.id === statId ? { ...stat, visible: false } : stat
        ));
    };

    // Stats drag and drop handlers
    const handleStatsDragStart = (e, index) => {
        setStatsDragItem(index);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleStatsDragOver = (e, index) => {
        e.preventDefault();
        setStatsDragOverIndex(index);
    };

    const handleStatsDragEnd = () => {
        setStatsDragItem(null);
        setStatsDragOverIndex(null);
    };

    const handleStatsDrop = (e, dropIndex) => {
        e.preventDefault();
        if (statsDragItem === null || statsDragItem === dropIndex) {
            setStatsDragOverIndex(null);
            return;
        }

        const stats = [...visibleStats];
        const [removed] = stats.splice(statsDragItem, 1);
        stats.splice(dropIndex, 0, removed);
        setVisibleStats(stats);
        setStatsDragItem(null);
        setStatsDragOverIndex(null);
    };

    // Resize handlers
    const handleResizeStart = (e, itemId, currentWidth, currentHeight) => {
        e.stopPropagation();
        setResizingItem(itemId);
        setResizeStart({
            x: e.clientX,
            y: e.clientY,
            width: currentWidth,
            height: currentHeight,
        });
    };

    const handleResizeMove = (e) => {
        if (!resizingItem) return;

        const deltaX = e.clientX - resizeStart.x;
        const deltaY = e.clientY - resizeStart.y;
        const minWidth = 100;
        const minHeight = 80;

        const newWidth = Math.max(minWidth, resizeStart.width + deltaX);
        const newHeight = Math.max(minHeight, resizeStart.height + deltaY);

        setItemSizes(prev => ({
            ...prev,
            [resizingItem]: { width: newWidth, height: newHeight }
        }));
    };

    const handleResizeEnd = () => {
        setResizingItem(null);
        setResizeStart({ x: 0, y: 0, width: 0, height: 0 });
    };

    // Add global mouse move and mouse up listeners for resizing
    useEffect(() => {
        if (resizingItem) {
            const handleMouseMove = (e) => handleResizeMove(e);
            const handleMouseUp = () => handleResizeEnd();

            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);

            return () => {
                window.removeEventListener('mousemove', handleMouseMove);
                window.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [resizingItem, resizeStart]);

    const handleSave = async () => {
        // Prepare visibleStats for saving (remove 'value' field, only save id, label, visible)
        const statsToSave = visibleStats.map(stat => ({
            id: stat.id,
            label: stat.label,
            visible: stat.visible,
        }));

        const result = await saveConfig({
            layout: selectedLayout,
            theme: selectedTheme,
            pinnedRepos: selectedPinnedRepos,
            customTextSections: customTextSections,
            itemOrder: itemOrder,
            itemSizes: itemSizes,
            visibleStats: statsToSave,
        });

        if (result.success) {
            console.log('Portfolio settings saved successfully!');
        }

        return result;
    };

    // Theme colors mapping
    const themeColors = {
        light: { bg: 'bg-white', text: 'text-gray-900', card: 'bg-gray-50', border: 'border-gray-200' },
        dark: { bg: 'bg-gray-900', text: 'text-white', card: 'bg-gray-800', border: 'border-gray-700' },
        system: { bg: 'bg-white', text: 'text-gray-900', card: 'bg-gray-50', border: 'border-gray-200' },
        blue: { bg: 'bg-blue-50', text: 'text-blue-900', card: 'bg-white', border: 'border-blue-200' },
        pink: { bg: 'bg-pink-50', text: 'text-pink-900', card: 'bg-white', border: 'border-pink-200' },
    };

    const currentTheme = themeColors[selectedTheme] || themeColors.light;

    // Layout styles
    const layoutStyles = {
        default: {
            repoGrid: 'grid grid-cols-2 gap-4',
            cardPadding: 'p-4',
            descriptionLines: 'line-clamp-2',
        },
        classic: {
            repoGrid: 'grid grid-cols-1 gap-4',
            cardPadding: 'p-5',
            descriptionLines: 'line-clamp-3',
        },
        compact: {
            repoGrid: 'grid grid-cols-1 gap-2',
            cardPadding: 'p-3',
            descriptionLines: 'line-clamp-1',
        },
    };

    const currentLayout = layoutStyles[selectedLayout] || layoutStyles.default;

    if (isLoading) {
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
                                <Link 
                                    to="/dashboard" 
                                    className="text-blue-600 hover:text-blue-700 mb-2 inline-block transition-colors text-sm"
                                >
                                    ← Back to Dashboard
                                </Link>
                                <h1 className="text-2xl font-bold text-gray-900">Design Your Portfolio</h1>
                            </div>
                            <button
                                onClick={async () => {
                                    // Save before navigating (but navigate regardless of result)
                                    await handleSave();
                                    navigate('/dashboard/export');
                                }}
                                disabled={isSaving}
                                className="px-6 py-3 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                            >
                                Export Portfolio
                            </button>
                        </div>
                    </div>
                </div>

                {/* Error message */}
                {configError && (
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
                        <div className="bg-red-50 border border-red-200 rounded-md p-4">
                            <p className="text-sm text-red-800">{configError}</p>
                        </div>
                    </div>
                )}

                {/* Two Column Layout */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Left Column: Controls */}
                        <div className="space-y-6">
                            {/* Pinned Repositories Section */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-2">Pinned Repositories</h2>
                                <p className="text-sm text-gray-600 mb-4">
                                    Select up to 6 repositories ({selectedPinnedRepos.length}/6 selected)
                                </p>

                                {/* Selected Pinned Repos */}
                                {pinnedRepos.length > 0 && (
                                    <div className="mb-4 space-y-2">
                                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Selected</p>
                                        {pinnedRepos.map((repo) => (
                                            <div
                                                key={repo.githubId}
                                                className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg"
                                            >
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-medium text-gray-900 text-sm truncate">{repo.name}</div>
                                                    {repo.description && (
                                                        <div className="text-xs text-gray-600 truncate mt-1">{repo.description}</div>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={() => handleRemovePin(repo.githubId)}
                                                    className="ml-3 text-red-600 hover:text-red-700 text-sm font-medium"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Available Repos Search */}
                                {hasRepositories && (
                                    <div>
                                        <input
                                            type="text"
                                            placeholder="Search repositories..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-3"
                                        />
                                        <div className="space-y-2 max-h-64 overflow-y-auto">
                                            {availableRepos.length > 0 ? (
                                                availableRepos.map((repo) => (
                                                    <button
                                                        key={repo.githubId}
                                                        onClick={() => handleAddPin(repo.githubId)}
                                                        disabled={selectedPinnedRepos.length >= 6}
                                                        className="w-full text-left p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-gray-200 disabled:hover:bg-white"
                                                    >
                                                        <div className="font-medium text-gray-900 text-sm">{repo.name}</div>
                                                        {repo.description && (
                                                            <div className="text-xs text-gray-600 mt-1 line-clamp-1">{repo.description}</div>
                                                        )}
                                                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                                                            {repo.language && <span>{repo.language}</span>}
                                                            <span>⭐ {repo.stars || 0}</span>
                                                        </div>
                                                    </button>
                                                ))
                                            ) : (
                                                <p className="text-sm text-gray-500 text-center py-4">
                                                    {searchQuery ? 'No repositories found' : 'All repositories pinned'}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {!hasRepositories && (
                                    <div className="bg-gray-50 border border-gray-200 rounded-md p-4 text-center">
                                        <p className="text-sm text-gray-500">
                                            No repositories found. Please sync your GitHub data first.
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Theme Selection */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-2">Theme</h2>
                                <p className="text-sm text-gray-600 mb-4">Choose a color theme</p>

                                <div className="grid grid-cols-5 gap-3">
                                    {['light', 'dark', 'system', 'blue', 'pink'].map((theme) => (
                                        <label
                                            key={theme}
                                            className={`flex flex-col items-center justify-center p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                                                selectedTheme === theme
                                                    ? 'border-blue-500 bg-blue-50'
                                                    : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                        >
                                            <input
                                                type="radio"
                                                name="theme"
                                                value={theme}
                                                checked={selectedTheme === theme}
                                                onChange={(e) => setSelectedTheme(e.target.value)}
                                                className="sr-only"
                                            />
                                            <span className="font-medium text-gray-900 text-sm capitalize">{theme}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Layout Selection */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-2">Layout</h2>
                                <p className="text-sm text-gray-600 mb-4">Choose layout style</p>

                                <div className="space-y-3">
                                    {['default', 'classic', 'compact'].map((layout) => (
                                        <label
                                            key={layout}
                                            className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                                                selectedLayout === layout
                                                    ? 'border-blue-500 bg-blue-50'
                                                    : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                        >
                                            <div>
                                                <input
                                                    type="radio"
                                                    name="layout"
                                                    value={layout}
                                                    checked={selectedLayout === layout}
                                                    onChange={(e) => setSelectedLayout(e.target.value)}
                                                    className="sr-only"
                                                />
                                                <span className="font-medium text-gray-900 capitalize">{layout}</span>
                                                <span className="block text-xs text-gray-500 mt-1">
                                                    {layout === 'default' && '2-column grid layout'}
                                                    {layout === 'classic' && 'Single column, wider cards'}
                                                    {layout === 'compact' && 'Single column, compact cards'}
                                                </span>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Preview */}
                        <div className="lg:sticky lg:top-20 lg:h-fit">
                            <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-lg font-semibold text-gray-900">Live Preview</h2>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={handleAddTextSection}
                                            className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
                                        >
                                            + Add Text
                                        </button>
                                        <button
                                            onClick={handleSave}
                                            disabled={isSaving}
                                            className="px-3 py-1.5 text-sm bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors"
                                        >
                                            {isSaving ? 'Saving...' : 'Save'}
                                        </button>
                                    </div>
                                </div>
                                
                                {/* Preview Container */}
                                <div className={`${currentTheme.bg} ${currentTheme.text} rounded-lg border-2 ${currentTheme.border} p-6 min-h-[500px]`}>
                                    {/* Preview Header */}
                                    <div className="mb-6 pb-4 border-b border-gray-300">
                                        <div className="flex items-center gap-4 mb-2">
                                            {user?.avatarUrl ? (
                                                <img
                                                    src={user.avatarUrl}
                                                    alt={user.username}
                                                    className="w-12 h-12 rounded-full border-2 border-gray-300"
                                                />
                                            ) : (
                                                <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center">
                                                    <span className="text-gray-600 font-semibold">
                                                        {user?.username?.charAt(0)?.toUpperCase() || 'U'}
                                                    </span>
                                                </div>
                                            )}
                                            <div>
                                                <h3 className="text-xl font-bold">{user?.username || 'Your Name'}</h3>
                                                <p className="text-sm opacity-75">Developer Portfolio</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Preview Stats */}
                                    {stats && visibleStats.filter(s => s.visible).length > 0 && (
                                        <div 
                                            className="grid gap-4 mb-6"
                                            style={{ 
                                                gridTemplateColumns: `repeat(${Math.min(visibleStats.filter(s => s.visible).length, 3)}, minmax(0, 1fr))` 
                                            }}
                                        >
                                            {visibleStats.filter(s => s.visible).map((stat, index) => {
                                                const originalIndex = visibleStats.findIndex(s => s.id === stat.id);
                                                const statId = `stat-${stat.id}`;
                                                const size = itemSizes[statId] || {};
                                                const isResizing = resizingItem === statId;
                                                return (
                                                    <div
                                                        key={stat.id}
                                                        draggable={!isResizing}
                                                        onDragStart={(e) => !isResizing && handleStatsDragStart(e, originalIndex)}
                                                        onDragOver={(e) => handleStatsDragOver(e, originalIndex)}
                                                        onDragEnd={handleStatsDragEnd}
                                                        onDrop={(e) => handleStatsDrop(e, originalIndex)}
                                                        className={`${currentTheme.card} rounded-lg p-3 border ${currentTheme.border} text-center relative group cursor-move ${
                                                            statsDragOverIndex === originalIndex ? 'opacity-50' : ''
                                                        } ${statsDragItem === originalIndex ? 'opacity-30' : ''} ${isResizing ? 'cursor-nwse-resize' : ''}`}
                                                        style={{
                                                            width: size.width || undefined,
                                                            height: size.height || undefined,
                                                            minWidth: '100px',
                                                            minHeight: '80px',
                                                        }}
                                                    >
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleRemoveStat(stat.id);
                                                            }}
                                                            className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity text-red-600 hover:text-red-700 text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full hover:bg-red-100 z-10"
                                                            title="Remove"
                                                        >
                                                            ×
                                                        </button>
                                                        <div className="text-2xl font-bold">{stat.value}</div>
                                                        <div className="text-xs opacity-75 mt-1">{stat.label}</div>
                                                        <div
                                                            onMouseDown={(e) => {
                                                                const rect = e.currentTarget.closest('.group').getBoundingClientRect();
                                                                handleResizeStart(e, statId, rect.width, rect.height);
                                                            }}
                                                            className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize opacity-0 group-hover:opacity-100 transition-opacity bg-blue-500 rounded-tl-lg z-10"
                                                            style={{
                                                                clipPath: 'polygon(100% 0, 0 100%, 100% 100%)',
                                                            }}
                                                            title="Resize"
                                                        >
                                                            <div className="absolute bottom-0.5 right-0.5 w-2 h-2 border-r-2 border-b-2 border-white opacity-75"></div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {/* Add Stats Button (if some stats are hidden) */}
                                    {(() => {
                                        const hiddenStats = visibleStats.filter(stat => !stat.visible);
                                        return hiddenStats.length > 0 && (
                                            <div className="mb-6">
                                                <button
                                                    onClick={() => {
                                                        const statToShow = hiddenStats[0];
                                                        // Make it visible (stats should already exist)
                                                        setVisibleStats(prev => prev.map(stat =>
                                                            stat.id === statToShow.id ? { ...stat, visible: true } : stat
                                                        ));
                                                    }}
                                                    className="px-3 py-2 text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md transition-colors"
                                                >
                                                    + Show {hiddenStats[0]?.label}
                                                </button>
                                            </div>
                                        );
                                    })()}

                                    {/* Preview Items (Repos + Text Sections) with Drag and Drop */}
                                    {previewItems.length > 0 ? (
                                        <div className={`${selectedLayout === 'default' ? 'grid grid-cols-2 gap-4' : 'space-y-4'}`}>
                                            {previewItems.map((item, index) => {
                                                const size = itemSizes[item.id] || {};
                                                const isResizing = resizingItem === item.id;
                                                // Check if item should span full width in grid layout
                                                // Text sections are full width by default, repos are half width unless explicitly resized
                                                const isFullWidth = selectedLayout === 'default' && (
                                                    item.type === 'text' || // Text sections always full width
                                                    (size.width && size.width > 400) // Or if explicitly resized to wide
                                                );
                                                
                                                return (
                                                    <div
                                                        key={item.id}
                                                        draggable={!isResizing}
                                                        onDragStart={(e) => {
                                                            if (!isResizing) {
                                                                e.stopPropagation();
                                                                handleDragStart(e, index);
                                                            }
                                                        }}
                                                        onDragOver={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            handleDragOver(e, index);
                                                        }}
                                                        onDragEnd={(e) => {
                                                            e.stopPropagation();
                                                            handleDragEnd();
                                                        }}
                                                        onDrop={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            handleDrop(e, index);
                                                        }}
                                                        className={`cursor-move relative transition-all ${
                                                            dragOverIndex === index ? 'opacity-50 border-2 border-blue-500 border-dashed' : ''
                                                        } ${draggedItem === index ? 'opacity-30 scale-95' : ''} ${isResizing ? 'cursor-nwse-resize' : ''}`}
                                                        style={{
                                                            width: selectedLayout === 'default' && !isFullWidth && !size.width 
                                                                ? undefined 
                                                                : (size.width || '100%'),
                                                            height: size.height || undefined,
                                                            minWidth: '150px',
                                                            minHeight: '100px',
                                                            gridColumn: isFullWidth ? 'span 2' : undefined,
                                                        }}
                                                    >
                                                        {item.type === 'repo' ? (
                                                            <div className={`${currentTheme.card} border ${currentTheme.border} rounded-lg ${currentLayout.cardPadding} group hover:shadow-md transition-all h-full relative`}>
                                                                <div className="flex items-start justify-between mb-2">
                                                                    <h5 className="font-semibold text-sm">{item.data.name}</h5>
                                                                    <div className="flex items-center gap-2 text-xs opacity-75">
                                                                        <span>⭐ {item.data.stars || 0}</span>
                                                                        <span>🍴 {item.data.forks || 0}</span>
                                                                    </div>
                                                                </div>
                                                                {item.data.description && (
                                                                    <p className={`text-xs opacity-75 ${currentLayout.descriptionLines} mb-2`}>
                                                                        {item.data.description}
                                                                    </p>
                                                                )}
                                                                {item.data.language && (
                                                                    <span className="text-xs opacity-75">{item.data.language}</span>
                                                                )}
                                                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                                                                </div>
                                                                <div
                                                                    onMouseDown={(e) => {
                                                                        const rect = e.currentTarget.closest('.relative').getBoundingClientRect();
                                                                        handleResizeStart(e, item.id, rect.width, rect.height);
                                                                    }}
                                                                    className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize opacity-0 group-hover:opacity-100 transition-opacity bg-blue-500 rounded-tl-lg z-10"
                                                                    style={{
                                                                        clipPath: 'polygon(100% 0, 0 100%, 100% 100%)',
                                                                    }}
                                                                    title="Resize"
                                                                >
                                                                    <div className="absolute bottom-0.5 right-0.5 w-2 h-2 border-r-2 border-b-2 border-white opacity-75"></div>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className={`${currentTheme.card} border ${currentTheme.border} rounded-lg ${currentLayout.cardPadding} group relative h-full`}>
                                                                {editingTextId === item.data.id ? (
                                                                    <div className="h-full flex flex-col">
                                                                        <input
                                                                            type="text"
                                                                            value={item.data.title}
                                                                            onChange={(e) => handleUpdateTextSection(item.data.id, 'title', e.target.value)}
                                                                            className="w-full font-semibold text-sm mb-2 px-2 py-1 border border-gray-300 rounded bg-white text-gray-900"
                                                                            placeholder="Section title"
                                                                        />
                                                                        <textarea
                                                                            value={item.data.content}
                                                                            onChange={(e) => handleUpdateTextSection(item.data.id, 'content', e.target.value)}
                                                                            className="w-full text-xs opacity-75 px-2 py-1 border border-gray-300 rounded bg-white text-gray-900 resize-none flex-1"
                                                                            placeholder="Section content"
                                                                        />
                                                                        <button
                                                                            onClick={() => setEditingTextId(null)}
                                                                            className="mt-2 text-xs text-blue-600 hover:text-blue-700"
                                                                        >
                                                                            Done
                                                                        </button>
                                                                    </div>
                                                                ) : (
                                                                    <div className="h-full flex flex-col">
                                                                        <h5 className="font-semibold text-sm mb-2">{item.data.title}</h5>
                                                                        <p className="text-xs opacity-75 whitespace-pre-wrap flex-1 overflow-auto">{item.data.content}</p>
                                                                        <button
                                                                            onClick={() => setEditingTextId(item.data.id)}
                                                                            className="mt-2 text-xs text-blue-600 hover:text-blue-700 opacity-0 group-hover:opacity-100 transition-opacity"
                                                                        >
                                                                            Edit
                                                                        </button>
                                                                    </div>
                                                                )}
                                                                <button
                                                                    onClick={() => handleDeleteTextSection(item.data.id)}
                                                                    className="absolute top-2 right-2 text-red-600 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity text-xs z-10"
                                                                >
                                                                    ×
                                                                </button>
                                                                <div
                                                                    onMouseDown={(e) => {
                                                                        const rect = e.currentTarget.closest('.relative').getBoundingClientRect();
                                                                        handleResizeStart(e, item.id, rect.width, rect.height);
                                                                    }}
                                                                    className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize opacity-0 group-hover:opacity-100 transition-opacity bg-blue-500 rounded-tl-lg z-10"
                                                                    style={{
                                                                        clipPath: 'polygon(100% 0, 0 100%, 100% 100%)',
                                                                    }}
                                                                    title="Resize"
                                                                >
                                                                    <div className="absolute bottom-0.5 right-0.5 w-2 h-2 border-r-2 border-b-2 border-white opacity-75"></div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="text-center py-12 opacity-50">
                                            <p className="text-sm">No items yet</p>
                                            <p className="text-xs mt-2">Select repositories or add text sections to see them here</p>
                                        </div>
                                    )}
                                </div>

                                <p className="text-xs text-gray-500 mt-4 text-center">
                                    Drag items to reorder • Click "Add Text" to add custom sections
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
};

export default Design;

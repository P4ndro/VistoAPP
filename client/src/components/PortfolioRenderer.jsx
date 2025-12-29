import React from 'react';

const PortfolioRenderer = ({ config, stats, user }) => {
    // Default values if config/stats/user not provided
    const layout = config?.layout || 'default';
    const theme = config?.theme || 'light';
    const pinnedRepos = config?.pinnedRepos || [];
    const customTextSections = config?.customTextSections || [];
    const itemOrder = config?.itemOrder || [];
    const itemSizes = config?.itemSizes || {};
    const visibleStats = config?.visibleStats || [
        { id: 'repos', label: 'Repos', visible: true },
        { id: 'stars', label: 'Stars', visible: true },
        { id: 'commits', label: 'Commits', visible: true },
    ];

    // Theme colors mapping
    const themeColors = {
        light: { bg: 'bg-white', text: 'text-gray-900', card: 'bg-gray-50', border: 'border-gray-200' },
        dark: { bg: 'bg-gray-900', text: 'text-white', card: 'bg-gray-800', border: 'border-gray-700' },
        system: { bg: 'bg-white', text: 'text-gray-900', card: 'bg-gray-50', border: 'border-gray-200' },
        blue: { bg: 'bg-blue-50', text: 'text-blue-900', card: 'bg-white', border: 'border-blue-200' },
        pink: { bg: 'bg-pink-50', text: 'text-pink-900', card: 'bg-white', border: 'border-pink-200' },
    };

    const currentTheme = themeColors[theme] || themeColors.light;

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

    const currentLayout = layoutStyles[layout] || layoutStyles.default;

    // Get repositories from stats
    const repositories = stats?.repositories || [];

    // Get pinned repos as Map (for efficient lookup)
    const pinnedReposMap = new Map(
        pinnedRepos
            .map(id => {
                const repo = repositories.find(r => r.githubId === id);
                return repo ? [id, repo] : null;
            })
            .filter(Boolean)
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

    // Get stats values from stats data
    const statsWithValues = visibleStats
        .filter(stat => stat.visible)
        .map(stat => ({
            ...stat,
            value: stat.id === 'repos' ? (stats?.repositoryCount || 0) :
                   stat.id === 'stars' ? (stats?.totalStars || 0) :
                   stat.id === 'commits' ? (stats?.totalCommits || 0) : 0,
        }));

    return (
        <div className={`${currentTheme.bg} ${currentTheme.text} rounded-lg border-2 ${currentTheme.border} p-6 min-h-[500px] w-full`}>
            {/* Header */}
            <div className="mb-6 pb-4 border-b border-gray-300">
                <div className="flex items-center gap-4 mb-2">
                    {user?.avatarUrl ? (
                        <img
                            src={user.avatarUrl}
                            alt={user.username}
                            className="w-12 h-12 rounded-full border-2 border-gray-300"
                            crossOrigin="anonymous"
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

            {/* Stats */}
            {statsWithValues.length > 0 && (
                <div 
                    className="grid gap-4 mb-6"
                    style={{ 
                        gridTemplateColumns: `repeat(${Math.min(statsWithValues.length, 3)}, minmax(0, 1fr))` 
                    }}
                >
                    {statsWithValues.map((stat) => {
                        const statId = `stat-${stat.id}`;
                        const size = itemSizes[statId] || {};
                        return (
                            <div
                                key={stat.id}
                                className={`${currentTheme.card} rounded-lg p-3 border ${currentTheme.border} text-center relative`}
                                style={{
                                    width: size.width || undefined,
                                    height: size.height || undefined,
                                    minWidth: '100px',
                                    minHeight: '80px',
                                }}
                            >
                                <div className="text-2xl font-bold">{stat.value}</div>
                                <div className="text-xs opacity-75 mt-1">{stat.label}</div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Preview Items (Repos + Text Sections) */}
            {previewItems.length > 0 ? (
                <div className={layout === 'default' ? 'grid grid-cols-2 gap-4' : 'space-y-4'}>
                    {previewItems.map((item) => {
                        const size = itemSizes[item.id] || {};
                        // Check if item should span full width in grid layout
                        const isFullWidth = layout === 'default' && (
                            item.type === 'text' || // Text sections always full width
                            (size.width && size.width > 400) // Or if explicitly resized to wide
                        );

                        return (
                            <div
                                key={item.id}
                                className="relative"
                                style={{
                                    width: layout === 'default' && !isFullWidth && !size.width 
                                        ? undefined 
                                        : (size.width || '100%'),
                                    height: size.height || undefined,
                                    minWidth: '150px',
                                    minHeight: '100px',
                                    gridColumn: isFullWidth ? 'span 2' : undefined,
                                }}
                            >
                                {item.type === 'repo' ? (
                                    <div className={`${currentTheme.card} border ${currentTheme.border} rounded-lg ${currentLayout.cardPadding} h-full`}>
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
                                    </div>
                                ) : (
                                    <div className={`${currentTheme.card} border ${currentTheme.border} rounded-lg ${currentLayout.cardPadding} h-full flex flex-col`}>
                                        <h5 className="font-semibold text-sm mb-2">{item.data.title}</h5>
                                        <p className="text-xs opacity-75 whitespace-pre-wrap flex-1 overflow-auto">
                                            {item.data.content}
                                        </p>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-12 opacity-50">
                    <p className="text-sm">No items to display</p>
                </div>
            )}
        </div>
    );
};

export default PortfolioRenderer;

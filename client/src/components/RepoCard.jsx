const RepoCard = ({ repo }) => {
    if (!repo) return null;

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
        if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
        return `${Math.floor(diffDays / 365)} years ago`;
    };

    const truncateDescription = (text, maxLength = 100) => {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength).trim() + '...';
    };

    return (
        <a
            href={repo.htmlUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-gray-300 transition-all duration-200"
        >
            <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate">
                        {repo.name}
                    </h3>
                    {repo.description && (
                        <p className="text-sm text-gray-600 mb-2">
                            {truncateDescription(repo.description)}
                        </p>
                    )}
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 mb-3">
                {repo.language && (
                    <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        <span className="text-sm text-gray-600">{repo.language}</span>
                    </div>
                )}
                
                <div className="flex items-center gap-1 text-gray-600">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="text-sm">{repo.stars || 0}</span>
                </div>

                <div className="flex items-center gap-1 text-gray-600">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M7.707 3.293a1 1 0 010 1.414L5.414 7H11a7 7 0 017 7v1a1 1 0 11-2 0v-1A5 5 0 0011 9H5.414l2.293 2.293a1 1 0 11-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm">{repo.forks || 0}</span>
                </div>
            </div>

            {repo.topics && repo.topics.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                    {repo.topics.slice(0, 3).map((topic, index) => (
                        <span
                            key={index}
                            className="px-2 py-1 text-xs font-medium text-blue-700 bg-blue-50 rounded-md"
                        >
                            {topic}
                        </span>
                    ))}
                    {repo.topics.length > 3 && (
                        <span className="px-2 py-1 text-xs text-gray-500">
                            +{repo.topics.length - 3} more
                        </span>
                    )}
                </div>
            )}

            <div className="text-xs text-gray-500">
                Updated {formatDate(repo.pushedAt || repo.updatedAt)}
            </div>
        </a>
    );
};

export default RepoCard;

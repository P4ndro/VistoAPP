const LoadingSpinner = ({ size = 'md', text }) => {
    const sizeClasses = {
      sm: 'h-4 w-4',
      md: 'h-8 w-8',
      lg: 'h-12 w-12'
    };
  
    const borderWidths = {
      sm: '2px',
      md: '3px',
      lg: '4px'
    };
  
    return (
      <div className="flex flex-col items-center justify-center gap-3">
        <div 
          className={`${sizeClasses[size]} animate-spin rounded-full border-gray-200 border-t-gray-900`}
          style={{ 
            borderWidth: borderWidths[size]
          }}
        />
        {text && <p className="text-sm text-gray-600 animate-pulse">{text}</p>}
      </div>
    );
  };

export default LoadingSpinner;
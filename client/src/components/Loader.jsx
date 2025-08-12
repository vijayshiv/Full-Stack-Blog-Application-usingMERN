import React from 'react';

// Spinner Loader
export const SpinnerLoader = ({ size = 'medium', color = 'blue' }) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const colorClasses = {
    blue: 'border-blue-600',
    white: 'border-white',
    gray: 'border-gray-600',
    green: 'border-green-600'
  };

  return (
    <div className="flex items-center justify-center">
      <div 
        className={`${sizeClasses[size]} ${colorClasses[color]} border-2 border-t-transparent rounded-full animate-spin`}
      ></div>
    </div>
  );
};

// Full Page Loader
export const PageLoader = ({ message = "Loading..." }) => {
  return (
    <div className="fixed inset-0 bg-white bg-opacity-90 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="text-center">
        <SpinnerLoader size="xl" color="blue" />
        <p className="mt-4 text-gray-600 font-medium animate-pulse">{message}</p>
      </div>
    </div>
  );
};

// Skeleton Loader for Posts
export const PostSkeleton = () => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6 animate-pulse">
      <div className="flex items-center mb-4">
        <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
        <div className="ml-4 flex-1">
          <div className="h-4 bg-gray-300 rounded w-1/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/6"></div>
        </div>
      </div>
      
      <div className="space-y-3">
        <div className="h-6 bg-gray-300 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        <div className="h-4 bg-gray-200 rounded w-4/6"></div>
      </div>
      
      <div className="flex items-center justify-between mt-6">
        <div className="h-8 bg-gray-200 rounded w-20"></div>
        <div className="h-8 bg-gray-200 rounded w-16"></div>
      </div>
    </div>
  );
};

// Card Skeleton for General Use
export const CardSkeleton = ({ rows = 3 }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 animate-pulse">
      <div className="h-6 bg-gray-300 rounded w-3/4 mb-4"></div>
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="h-4 bg-gray-200 rounded w-full mb-2"></div>
      ))}
      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
    </div>
  );
};

// Button Loader
export const ButtonLoader = ({ loading, children, ...props }) => {
  return (
    <button 
      {...props} 
      disabled={loading || props.disabled}
      className={`${props.className} ${loading ? 'opacity-75 cursor-not-allowed' : ''} transition-all duration-200`}
    >
      {loading ? (
        <div className="flex items-center justify-center">
          <SpinnerLoader size="small" color="white" />
          <span className="ml-2">Loading...</span>
        </div>
      ) : (
        children
      )}
    </button>
  );
};

// Inline Loader for Small Components
export const InlineLoader = ({ text = "Loading..." }) => {
  return (
    <div className="flex items-center justify-center py-4">
      <SpinnerLoader size="small" color="blue" />
      <span className="ml-2 text-gray-600">{text}</span>
    </div>
  );
};

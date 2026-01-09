import React from 'react';

const SkeletonLoader: React.FC = () => {
  return (
    <div className="flex-1 flex flex-col w-full animate-pulse mt-10">
      {/* Hero Skeleton */}
      <div className="flex flex-col items-center mb-12">
        <div className="h-10 w-48 bg-zinc-700/50 rounded-lg mb-4"></div>
        <div className="h-4 w-32 bg-zinc-700/30 rounded-lg mb-8"></div>
        <div className="h-32 w-40 bg-zinc-700/20 rounded-3xl mb-4"></div>
        <div className="h-6 w-24 bg-zinc-700/30 rounded-lg"></div>
      </div>

      {/* Hourly Skeleton */}
      <div className="flex space-x-4 mb-8 overflow-hidden">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="w-20 h-28 bg-zinc-800/50 rounded-2xl flex-shrink-0"></div>
        ))}
      </div>

      {/* Card Skeletons */}
      <div className="w-full h-32 bg-zinc-800/50 rounded-2xl mb-6"></div>
      <div className="w-full h-64 bg-zinc-800/50 rounded-2xl mb-6"></div>
      <div className="grid grid-cols-2 gap-4">
        <div className="h-24 bg-zinc-800/50 rounded-2xl"></div>
        <div className="h-24 bg-zinc-800/50 rounded-2xl"></div>
      </div>
    </div>
  );
};

export default SkeletonLoader;
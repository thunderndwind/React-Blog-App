import React from 'react';

type SkeletonProps = {
  className?: string;
};

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`} />
  );
}

export function ProfileHeaderSkeleton() {
  return (
    <div className="animate-pulse flex space-x-4 mb-6">
      <div className="rounded-full bg-gray-200 dark:bg-gray-700 h-20 w-20"></div>
      <div className="flex-1 space-y-4 py-1">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
        <div className="space-y-2">
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
        </div>
      </div>
    </div>
  );
}

export function ProfileStatsSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
        </div>
      ))}
    </div>
  );
}

export function ActivityItemSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-4 animate-pulse">
      <div className="flex justify-between items-center mb-3">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/6"></div>
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
      </div>
    </div>
  );
}

export function PostCardSkeleton() {
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-6 animate-pulse">
      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3"></div>
      <div className="space-y-2 mb-4">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/5"></div>
      </div>
      <div className="h-44 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
      <div className="flex justify-between">
        <div className="flex items-center">
          <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full mr-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-10"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
        </div>
      </div>
    </div>
  );
} 
import React, { useState } from 'react';
import type { Route } from "./+types/home";
import Layout from "~/components/Layout";
import { useAuth } from '~/context/AuthContext';
import type { Post } from '~/+types/post';
import { usePagination } from '~/hooks/usePagination';
import PostCard from '~/components/PostCard';
import { PostCardSkeleton } from '~/components/Skeleton';
import { apiRequest } from '~/utils/api';
import { showError, showSuccess } from '~/utils/toast';

export function meta({}: Route.MetaArgs) {
  return [
    { title: "BlogPosts - Home" },
    { name: "description", content: "Welcome to BlogPosts!" },
  ];
}

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [likedPostIds, setLikedPostIds] = useState<Set<number>>(new Set());
  
  const { 
    data: posts, 
    isLoading, 
    isLoadingMore, 
    error, 
    hasMore, 
    lastElementRef,
    refresh 
  } = usePagination<Post>({
    initialUrl: '/posts/'
  });

  const handleLikePost = async (postId: number) => {
    if (!isAuthenticated) {
      showError('Please sign in to like posts');
      return;
    }
    
    try {
      // Optimistic update
      if (likedPostIds.has(postId)) {
        setLikedPostIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(postId);
          return newSet;
        });
      } else {
        setLikedPostIds(prev => {
          const newSet = new Set(prev);
          newSet.add(postId);
          return newSet;
        });
      }

      // Make API call
      const response = await apiRequest(`/posts/${postId}/like`, {
        method: 'POST'
      });

      if (response.status !== 'success') {
        throw new Error(response.message || 'Failed to like post');
      }

      // Refresh posts to get updated likes count
      refresh();
      showSuccess('Post liked successfully');
    } catch (err) {
      console.error('Error liking post:', err);
      showError('Failed to like post. Please try again.');
      // Revert optimistic update
      if (likedPostIds.has(postId)) {
        setLikedPostIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(postId);
          return newSet;
        });
      } else {
        setLikedPostIds(prev => {
          const newSet = new Set(prev);
          newSet.add(postId);
          return newSet;
        });
      }
    }
  };

  const handleDeletePost = (postId: number) => {
    // Remove post from the local state and refresh data
    refresh();
  };

  const renderSkeletons = () => (
    <>
      <PostCardSkeleton />
      <PostCardSkeleton />
      <PostCardSkeleton />
    </>
  );

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Welcome to BlogPosts</h1>
          <p className="text-lg text-gray-700 dark:text-gray-300">
            Share your thoughts, connect with others, and explore interesting content.
          </p>
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Recent Posts</h2>
        
        {isLoading && !posts.length ? (
          renderSkeletons()
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/30 p-4 rounded-lg">
            <p className="text-red-500 dark:text-red-400">{error}</p>
          </div>
        ) : (
          <div>
            {posts.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 text-center">
                <p className="text-gray-500 dark:text-gray-400">No posts available yet.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {posts.map((post, index) => {
                  const isLastElement = index === posts.length - 1;
                  return (
                    <PostCard
                      key={`${post.id}-${index}`}
                      post={post}
                      onLike={handleLikePost}
                      onDelete={handleDeletePost}
                      lastElementRef={isLastElement ? lastElementRef : undefined}
                    />
                  );
                })}
                
                {/* Loading indicator for infinite scroll */}
                {isLoadingMore && (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                )}
                
                {/* No more posts indicator */}
                {!isLoadingMore && !hasMore && posts.length > 0 && (
                  <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                    No more posts to load
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import Layout from '~/components/Layout';
import { useAuth } from '~/context/AuthContext';
import { apiRequest } from '~/utils/api';
import type { Post } from '~/+types/post';
import type { Route } from "./../+types/posts.id";
import { PostCardSkeleton } from '~/components/Skeleton';
import { showError, showSuccess } from '~/utils/toast';
import { getProfilePictureUrl } from '~/utils/imageUtils';
import ConfirmationModal from '~/components/ConfirmationModal';

export function meta({}: Route.MetaArgs) {
  return [
    { title: "View Post - BlogPosts" },
    { name: "description", content: "View blog post details" },
  ];
}

export default function PostDetail() {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPostData = async () => {
      try {
        setIsLoading(true);
        const response = await apiRequest<Post>(`/posts/${id}`);
        
        if (response.status === 'success' && response.data) {
          setPost(response.data);
        } else {
          setError(response.message || 'Failed to load post');
        }
      } catch (err) {
        console.error('Error loading post:', err);
        setError('Failed to load post. It may have been deleted or is unavailable.');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchPostData();
    }
  }, [id]);

  const isAuthor = post && user && post.author.id === user.id;

  const handleLike = async () => {
    if (!isAuthenticated) {
      showError('Please sign in to like posts');
      return;
    }

    try {
      const response = await apiRequest(`/posts/${id}/like`, {
        method: 'POST'
      });

      if (response.status === 'success') {
        // Update post data with new like count
        const updatedPost = await apiRequest<Post>(`/posts/${id}`);
        if (updatedPost.status === 'success' && updatedPost.data) {
          setPost(updatedPost.data);
          showSuccess('Post liked!');
        }
      } else {
        showError(response.message || 'Failed to like post');
      }
    } catch (err) {
      console.error('Error liking post:', err);
      showError('Failed to like post. Please try again.');
    }
  };

  const handleEdit = () => {
    navigate(`/posts/${id}/edit`);
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (isDeleting) return;

    setIsDeleting(true);
    try {
      const response = await apiRequest(`/posts/${id}`, {
        method: 'DELETE'
      });

      if (response.status === 'success') {
        showSuccess('Post deleted successfully');
        navigate('/');
      } else {
        showError(response.message || 'Failed to delete post');
      }
    } catch (err) {
      console.error('Error deleting post:', err);
      showError('Failed to delete post. Please try again.');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (error && !isLoading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Post Not Found</h1>
            <p className="text-gray-700 dark:text-gray-300 mb-6">{error}</p>
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              Go to Home
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4">
        {isLoading ? (
          <div className="space-y-6">
            <div className="h-8 w-1/3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            <PostCardSkeleton />
          </div>
        ) : post ? (
          <>
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
              {/* Post Header */}
              <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <img
                      src={getProfilePictureUrl(post.author.profile_picture)}
                      alt={`${post.author.first_name} ${post.author.last_name}`}
                      className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                    />
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {post.author.first_name} {post.author.last_name}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(post.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  
                  {isAuthor && (
                    <div className="flex space-x-2">
                      <button
                        onClick={handleEdit}
                        className="p-2 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
                        aria-label="Edit post"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={handleDeleteClick}
                        disabled={isDeleting}
                        className="p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
                        aria-label="Delete post"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
                
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  {post.title}
                </h1>
              </div>
              
              {/* Post Image */}
              {post.image && (
                <div className="relative bg-gray-100 dark:bg-gray-700">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full max-h-96 object-contain"
                  />
                </div>
              )}
              
              {/* Post Content */}
              <div className="p-6">
                <div className="prose dark:prose-invert max-w-none">
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                    {post.content}
                  </p>
                </div>
              </div>
              
              {/* Post Footer */}
              <div className="p-6 border-t border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <button
                    onClick={handleLike}
                    className="flex items-center space-x-1 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className={`h-6 w-6 ${post.likes.includes(user?.id || 0) ? 'text-red-500 fill-red-500' : 'text-gray-400'}`}
                      viewBox="0 0 20 20"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-lg font-semibold">{post.likes_count}</span>
                  </button>

                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {post.updated_at !== post.created_at ? 
                      `Last edited: ${new Date(post.updated_at).toLocaleDateString('en-US', {
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric'
                      })}` : ''}
                  </span>
                </div>
              </div>
            </div>

            {/* Delete Confirmation Modal */}
            <ConfirmationModal
              isOpen={showDeleteConfirm}
              onClose={() => setShowDeleteConfirm(false)}
              onConfirm={handleDeleteConfirm}
              title="Delete Post"
              message="Are you sure you want to delete this post? This action cannot be undone and will permanently remove the post and all its data."
              confirmText="Delete Post"
              cancelText="Cancel"
              isDestructive={true}
              isLoading={isDeleting}
            />
          </>
        ) : null}
        
        {/* Back button */}
        <div className="mt-6">
          <button
            onClick={() => navigate('/')}
            className="flex items-center text-blue-600 dark:text-blue-400 hover:underline"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to posts
          </button>
        </div>
      </div>
    </Layout>
  );
} 
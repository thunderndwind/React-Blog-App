import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import type { Post } from '~/+types/post';
import { useAuth } from '~/context/AuthContext';
import { showSuccess, showError } from '~/utils/toast';
import { apiRequest } from '~/utils/api';
import { getProfilePictureUrl } from '~/utils/imageUtils';
import ConfirmationModal from './ConfirmationModal';

interface PostCardProps {
  post: Post;
  onLike?: (postId: number) => Promise<void>;
  lastElementRef?: React.RefObject<HTMLDivElement> | ((node: HTMLDivElement | null) => void);
  onDelete?: (postId: number) => void;
}

export default function PostCard({ post, onLike, lastElementRef, onDelete }: PostCardProps) {
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [isLiking, setIsLiking] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const hasImage = !!post.image;
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Check if current user is the author of the post
  const isAuthor = user?.id === post.author.id;

  const formattedDate = new Date(post.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!onLike || isLiking) return;
    
    setIsLiking(true);
    try {
      await onLike(post.id);
    } finally {
      setIsLiking(false);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/posts/${post.id}/edit`);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (isDeleting) return;
    
    setIsDeleting(true);
    try {
      const response = await apiRequest(`/posts/${post.id}`, {
        method: 'DELETE'
      });
      
      if (response.status === 'success') {
        showSuccess('Post deleted successfully');
        setShowDeleteConfirm(false);
        if (onDelete) {
          onDelete(post.id);
        }
      } else {
        throw new Error(response.message || 'Failed to delete post');
      }
    } catch (err) {
      console.error('Error deleting post:', err);
      showError('Failed to delete post. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div 
        ref={typeof lastElementRef === 'function' ? lastElementRef : undefined}
        className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-gray-800 mb-6"
      >
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
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
                  {formattedDate}
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
                  className={`p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors ${isDeleting ? 'opacity-50 cursor-not-allowed' : ''}`}
                  aria-label="Delete post"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            )}
          </div>
          
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
            {post.title}
          </h3>
          
          <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-3">
            {post.content}
          </p>
        </div>
        
        {hasImage && (
          <div className="relative w-full aspect-[16/9] bg-gray-100 dark:bg-gray-700">
            {isImageLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-t-transparent border-blue-500"></div>
              </div>
            )}
            <img
              src={post.image || ""}
              alt={post.title}
              className={`w-full h-full object-cover ${isImageLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
              onLoad={() => setIsImageLoading(false)}
            />
          </div>
        )}
        
        <div className="p-4 flex items-center justify-between border-t border-gray-100 dark:border-gray-700">
          <button
            onClick={handleLike}
            disabled={isLiking}
            className={`flex items-center space-x-1 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 ${isLiking ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-5 w-5 ${post.likes.includes(user?.id || 0) ? 'text-red-500 fill-red-500' : 'text-gray-400'}`}
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
            <span>{post.likes_count}</span>
          </button>
          
          <Link 
            to={`/posts/${post.id}`}
            className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-sm"
          >
            <span>Read More</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
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
  );
} 
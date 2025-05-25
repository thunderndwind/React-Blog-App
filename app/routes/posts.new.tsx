import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import Layout from '~/components/Layout';
import ProtectedRoute from '~/components/ProtectedRoute';
import { useAuth } from '~/context/AuthContext';
import { apiRequest } from '~/utils/api';
import type { Post } from '~/+types/post';
import type { Route } from "./../+types/posts.new";
import FormErrorMessage from '~/components/FormErrorMessage';
import { showSuccess, showError, showValidationErrors, showLoadingToast, updateToastSuccess } from '~/utils/toast';
import { getPresignedUrl } from '~/utils/uploadService';
import ImageUploader from '~/components/ImageUploader';

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Create New Post - BlogPosts" },
    { name: "description", content: "Create a new blog post" },
  ];
}

export default function NewPostPage() {
  return (
    <ProtectedRoute>
      <NewPost />
    </ProtectedRoute>
  );
}

interface FormErrors {
  title?: string[];
  content?: string[];
  image?: string[];
  form?: string[];
}

function NewPost() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [uploadConfig, setUploadConfig] = useState<any>(null);
  const navigate = useNavigate();

  // Fetch upload configuration on component mount
  useEffect(() => {
    const fetchUploadConfig = async () => {
      try {
        const config = await getPresignedUrl();
        setUploadConfig(config);
      } catch (err) {
        console.error('Failed to get upload configuration:', err);
        showError('Failed to load image upload. You can still create a post without an image.');
      }
    };

    fetchUploadConfig();
  }, []);

  const handleImageUpload = (uuid: string, cdnUrl: string) => {
    setImage(uuid);
    setImagePreview(cdnUrl);
    showSuccess('Image uploaded successfully');
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    // Validate form
    const validationErrors: FormErrors = {};
    if (!title.trim()) validationErrors.title = ['Title is required'];
    if (!content.trim()) validationErrors.content = ['Content is required'];

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setIsSubmitting(false);
      return;
    }

    const toastId = showLoadingToast('Creating post...');

    try {
      // Prepare post data
      const postData: any = {
        title,
        content,
      };

      // Add image if available
      if (image) {
        postData.image = image;
      }

      // Make API request to create a new post
      const response = await apiRequest<Post>(
        '/posts/', 
        {
          method: 'POST',
          body: JSON.stringify(postData),
        }
      );
      
      if (response.status === 'success' && response.data) {
        updateToastSuccess(toastId, 'Post created successfully');
        // Navigate to the home page
        navigate('/');
      } else {
        showError(response.message || 'Failed to create post');
      }
    } catch (err: any) {
      console.error('Error creating post:', err);
      
      // Handle different error types
      if (err.status === 401) {
        showError('Authentication error. Please log in again.');
      } else if (err.status === 400 && err.errors) {
        // Show validation errors
        setErrors(err.errors);
        showValidationErrors(err.errors);
      } else {
        showError(err.message || 'Failed to create post. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create New Post</h1>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="text-gray-600 dark:text-gray-300 hover:text-gray-500 dark:hover:text-gray-400"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {errors.form && <FormErrorMessage errors={errors.form} />}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Title*
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter an engaging title for your post"
                className={`mt-1 block w-full border ${errors.title ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white`}
              />
              <FormErrorMessage errors={errors.title} />
            </div>
            
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Content*
              </label>
              <textarea
                id="content"
                rows={8}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Share your thoughts with the community..."
                className={`mt-1 block w-full border ${errors.content ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white`}
              />
              <FormErrorMessage errors={errors.content} />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Image
              </label>
              
              <ImageUploader
                uploadConfig={uploadConfig}
                imagePreview={imagePreview}
                onImageUpload={handleImageUpload}
                onRemoveImage={removeImage}
                className="mb-2"
              />
              
              <FormErrorMessage errors={errors.image} />
            </div>
            
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`inline-flex items-center justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${(isSubmitting) ? 'opacity-75 cursor-not-allowed' : ''}`}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Publishing...
                  </>
                ) : (
                  <>
                    <svg className="-ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Publish Post
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
} 
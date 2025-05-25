import React, { useState, useEffect } from 'react';
import Layout from '~/components/Layout';
import ProtectedRoute from '~/components/ProtectedRoute';
import { useAuth } from '~/context/AuthContext';
import { apiRequest } from '~/utils/api';
import type { Route } from './../+types/profile';
import { ProfileHeaderSkeleton, ProfileStatsSkeleton } from '~/components/Skeleton';
import { showError, showSuccess, showLoadingToast, updateToastSuccess } from '~/utils/toast';
import { getPresignedUrl } from '~/utils/uploadService';
import { getProfilePictureUrl, getImagePreviewUrl } from '~/utils/imageUtils';
import ImageUploader from '~/components/ImageUploader';

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Profile - BlogPosts" },
    { name: "description", content: "Your profile page" },
  ];
}

// Define the profile data structure based on API response
type ProfileApiResponse = {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  bio: string;
  birth_date: string | null;
  profile_picture: string;
  stats: {
    posts_count: number;
    followers_count: number;
    following_count: number;
    likes_given: number;
    likes_received: number;
  };
};

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}

// Simple Avatar Component with initials fallback
function AvatarDisplay({ 
  src, 
  firstName, 
  lastName, 
  size = 96 
}: {
  src?: string | null;
  firstName: string;
  lastName: string;
  size?: number;
}) {
  const [imageError, setImageError] = useState(false);
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  
  const displayUrl = getProfilePictureUrl(src);
  const shouldShowImage = displayUrl && !imageError;
  
  const sizeClasses = {
    96: 'w-24 h-24 text-2xl',
    64: 'w-16 h-16 text-lg',
    48: 'w-12 h-12 text-sm'
  };
  
  return (
    <div className={`${sizeClasses[size as keyof typeof sizeClasses]} rounded-full border-4 border-blue-500 overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center`}>
      {shouldShowImage ? (
        <img
          src={displayUrl}
          alt={`${firstName} ${lastName}`}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <span className="text-white font-bold">
          {initials}
        </span>
      )}
    </div>
  );
}

function ProfileContent() {
  const { user, updateUserInfo } = useAuth();
  const [profileData, setProfileData] = useState<ProfileApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState(user?.first_name || '');
  const [lastName, setLastName] = useState(user?.last_name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [profilePicture, setProfilePicture] = useState<string | null>(user?.profile_picture || null);
  const [profilePicturePreview, setProfilePicturePreview] = useState<string | null>(getImagePreviewUrl(user?.profile_picture || null));
  const [uploadConfig, setUploadConfig] = useState<any>(null);

  // Fetch additional profile data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch profile data
        const response = await apiRequest<ProfileApiResponse>('/users/profile');
        if (response.status === 'success' && response.data) {
          setProfileData(response.data);
          
          // Update form fields with fetched data
          setFirstName(response.data.first_name);
          setLastName(response.data.last_name);
          setBio(response.data.bio || '');
          setProfilePicture(response.data.profile_picture || null);
          setProfilePicturePreview(getImagePreviewUrl(response.data.profile_picture));
        }
        
        // Get upload configuration for profile picture
        try {
          const config = await getPresignedUrl();
          setUploadConfig(config);
        } catch (err) {
          console.error('Failed to get upload configuration:', err);
        }
      } catch (err) {
        console.error('Failed to load profile data:', err);
        showError('Failed to load profile information');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Update form fields when user data changes
  useEffect(() => {
    if (user) {
      setFirstName(user.first_name);
      setLastName(user.last_name);
      setBio(user.bio || '');
      setProfilePicture(user.profile_picture || null);
      setProfilePicturePreview(getImagePreviewUrl(user.profile_picture));
    }
  }, [user]);

  const handleUpdateProfile = async () => {
    if (!user) return;
    
    setIsUpdating(true);
    const toastId = showLoadingToast('Updating profile...');
    
    try {
      const userData = {
        first_name: firstName,
        last_name: lastName,
        bio,
        profile_picture: profilePicture
      };
      
      const response = await apiRequest('/users/profile', {
        method: 'PATCH',
        body: JSON.stringify(userData)
      });
      
      if (response.status === 'success') {
        updateToastSuccess(toastId, 'Profile updated successfully');
        setIsEditing(false);
        
        // Update user data in context if available
        if (typeof updateUserInfo === 'function') {
          updateUserInfo({
            ...user,
            first_name: firstName,
            last_name: lastName,
            bio,
            profile_picture: profilePicture || user.profile_picture
          });
        }
        
        // Refresh profile data
        const refreshResponse = await apiRequest<ProfileApiResponse>('/users/profile');
        if (refreshResponse.status === 'success' && refreshResponse.data) {
          setProfileData(refreshResponse.data);
        }
      } else {
        throw new Error(response.message || 'Update failed');
      }
    } catch (err) {
      console.error('Failed to update profile:', err);
      showError('Failed to update profile');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleProfilePictureUpload = (uuid: string, cdnUrl: string) => {
    setProfilePicture(uuid);
    setProfilePicturePreview(cdnUrl);
    showSuccess('Profile picture updated! Don\'t forget to save your changes.');
  };

  const removeProfilePicture = () => {
    setProfilePicture(null);
    setProfilePicturePreview(null);
    showSuccess('Profile picture removed! Don\'t forget to save your changes.');
  };

  const cancelEditing = () => {
    // Reset form fields to current profile data
    if (profileData) {
      setFirstName(profileData.first_name);
      setLastName(profileData.last_name);
      setBio(profileData.bio || '');
      setProfilePicture(profileData.profile_picture || null);
      setProfilePicturePreview(getImagePreviewUrl(profileData.profile_picture));
    } else if (user) {
      setFirstName(user.first_name);
      setLastName(user.last_name);
      setBio(user.bio || '');
      setProfilePicture(user.profile_picture || null);
      setProfilePicturePreview(getImagePreviewUrl(user.profile_picture));
    }
    setIsEditing(false);
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6">
          {isLoading ? (
            <ProfileHeaderSkeleton />
          ) : (
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              
              {/* Profile Picture Section */}
              <div className="flex-shrink-0">
                <div className="text-center space-y-4">
                  <AvatarDisplay
                    src={profilePicturePreview}
                    firstName={firstName}
                    lastName={lastName}
                    size={96}
                  />
                  
                  {isEditing && (
                    <div className="space-y-3">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Profile Picture
                      </p>
                      
                      {uploadConfig ? (
                        <div className="max-w-xs">
                          <ImageUploader
                            uploadConfig={uploadConfig}
                            imagePreview={profilePicturePreview}
                            onImageUpload={handleProfilePictureUpload}
                            onRemoveImage={removeProfilePicture}
                            className="rounded-lg"
                          />
                        </div>
                      ) : (
                        <div className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Loading upload...
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Profile Information Section */}
              <div className="flex-grow text-center md:text-left">
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          First Name
                        </label>
                        <input
                          id="first_name"
                          type="text"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                      <div>
                        <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Last Name
                        </label>
                        <input
                          id="last_name"
                          type="text"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="bio" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Bio
                      </label>
                      <textarea
                        id="bio"
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Write something about yourself..."
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                        rows={3}
                      />
                    </div>
                    <div className="flex space-x-3 justify-end">
                      <button
                        onClick={cancelEditing}
                        disabled={isUpdating}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md shadow-sm transition-colors dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleUpdateProfile}
                        disabled={isUpdating}
                        className={`px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-sm transition-colors ${
                          isUpdating ? 'opacity-60 cursor-not-allowed' : ''
                        }`}
                      >
                        {isUpdating ? 'Updating...' : 'Save Changes'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      {firstName} {lastName}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300 mb-2">@{profileData?.username || user?.username}</p>
                    <p className="text-gray-800 dark:text-gray-200 mb-4">
                      {bio || <span className="text-gray-500 italic">No bio provided</span>}
                    </p>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-sm transition-colors"
                    >
                      Edit Profile
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Account Stats</h2>
        {isLoading ? (
          <ProfileStatsSkeleton />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Posts</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {profileData?.stats?.posts_count || 0}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Followers</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {profileData?.stats?.followers_count || 0}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Following</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {profileData?.stats?.following_count || 0}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Likes</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {profileData?.stats?.likes_received || 0}
              </p>
            </div>
          </div>
        )}

      </div>
    </Layout>
  );
} 
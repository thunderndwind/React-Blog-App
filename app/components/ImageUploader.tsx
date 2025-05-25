import React, { useState, useEffect, useRef } from 'react';
import { FileUploaderRegular } from '@uploadcare/react-uploader';
import '@uploadcare/react-uploader/core.css';

interface UploadConfig {
  signature: string;
  expire: number;
  pub_key: string;
}

interface ImageUploaderProps {
  onImageUpload: (uuid: string, cdnUrl: string) => void;
  onRemoveImage: () => void;
  imagePreview: string | null;
  uploadConfig: UploadConfig | null;
  className?: string;
}

export default function ImageUploader({ 
  onImageUpload, 
  onRemoveImage, 
  imagePreview, 
  uploadConfig, 
  className = '' 
}: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const uploadTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (uploadTimeoutRef.current) {
        clearTimeout(uploadTimeoutRef.current);
      }
    };
  }, []);
  
  const handleUploadComplete = (info: any) => {
    // Clear any existing timeout
    if (uploadTimeoutRef.current) {
      clearTimeout(uploadTimeoutRef.current);
      uploadTimeoutRef.current = null;
    }
    
    setIsUploading(false);
    if (info && info.uuid) {
      onImageUpload(info.uuid, info.cdnUrl);
    }
  };
  
  const handleUploadChange = (fileInfo: any) => {
    if (!fileInfo || !fileInfo.files || fileInfo.files.length === 0) {
      setIsUploading(false);
      return;
    }

    const file = fileInfo.files[0];
    
    // Handle different upload states
    switch (file.status) {
      case 'uploading':
        setIsUploading(true);
        // Set a timeout to prevent stuck uploading state (30 seconds max)
        if (uploadTimeoutRef.current) {
          clearTimeout(uploadTimeoutRef.current);
        }
        uploadTimeoutRef.current = setTimeout(() => {
          setIsUploading(false);
        }, 30000);
        break;
      case 'success':
      case 'error':
      case 'removed':
        setIsUploading(false);
        // Clear timeout when upload finishes
        if (uploadTimeoutRef.current) {
          clearTimeout(uploadTimeoutRef.current);
          uploadTimeoutRef.current = null;
        }
        break;
      default:
        // For other states, don't change uploading status
        break;
    }
  };

  const handleUploadError = (error: any) => {
    // Clear any existing timeout
    if (uploadTimeoutRef.current) {
      clearTimeout(uploadTimeoutRef.current);
      uploadTimeoutRef.current = null;
    }
    setIsUploading(false);
  };

  if (!uploadConfig) {
    return (
      <div className={`flex items-center justify-center h-48 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-md ${className}`}>
        <div className="text-center text-gray-500 dark:text-gray-400">
          <div className="animate-pulse">Loading image upload...</div>
        </div>
      </div>
    );
  }

  if (imagePreview) {
    return (
      <div className={`relative bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden ${className}`}>
        <img
          src={imagePreview}
          alt="Preview"
          className="w-full max-h-96 object-contain mx-auto"
        />
        <div className="absolute top-3 right-3 flex space-x-3">
          <button
            type="button"
            onClick={onRemoveImage}
            className="bg-red-500 text-white rounded-full p-2 hover:bg-red-600 focus:outline-none shadow-md transition-colors"
            aria-label="Remove image"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden ${className} ${isUploading ? 'opacity-70' : ''}`}>
      <div className="p-4">
        {isUploading ? (
          <div className="flex flex-col items-center justify-center h-48">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-gray-500 dark:text-gray-400">Uploading image...</p>
          </div>
        ) : (
          <FileUploaderRegular
            sourceList="local, camera, url, facebook, gdrive"
            cameraModes="photo"
            secureSignature={uploadConfig.signature}
            secureExpire={uploadConfig.expire.toString()}
            cloudImageEditorAutoOpen={true}
            classNameUploader="uc-light dark:uc-dark"
            pubkey={uploadConfig.pub_key}
            onFileUploadSuccess={handleUploadComplete}
            onFileUploadFailed={handleUploadError}
            onChange={handleUploadChange}
          />
        )}
      </div>
    </div>
  );
} 
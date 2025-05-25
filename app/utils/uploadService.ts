import { apiRequest } from './api';

interface UploadConfig {
    pub_key: string;
    expire: number;
    signature: string;
    secure: boolean;
    image_info: boolean;
    source: string;
    cdn_base: string;
}

/**
 * Get a presigned URL for uploading images
 */
export const getPresignedUrl = async (): Promise<UploadConfig> => {
    const response = await apiRequest<UploadConfig>('/uploads/presigned-url');

    if (response.status === 'success' && response.data) {
        return response.data;
    }

    throw new Error('Failed to get upload credentials');
};

/**
 * Convert UUID to CDN URL
 */
export const getImageUrl = (uuid: string, cdnBase: string = 'https://ucarecdn.com'): string => {
    // Clean the UUID (remove any path or trailing slash)
    const cleanUuid = uuid.replace(/^\/|\/$/g, '');
    return `${cdnBase}/${cleanUuid}/`;
}; 
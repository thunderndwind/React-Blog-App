import { getImageUrl } from './uploadService';

/**
 * Converts a profile picture value (UUID, URL, or null) to a proper display URL
 * @param profilePicture - The profile picture value (UUID, URL, or null/undefined)
 * @param fallbackUrl - Optional fallback URL if no profile picture is provided
 * @returns A proper URL for displaying the profile picture
 */
export const getProfilePictureUrl = (
    profilePicture?: string | null,
    fallbackUrl: string = "https://ucarecdn.com/41bf360b-e5d0-410e-aa84-31f5183dfbd1/"
): string => {
    if (!profilePicture) return fallbackUrl;

    // If it's already a full URL, return as is
    if (profilePicture.startsWith('http')) return profilePicture;

    // If it looks like a UUID, convert to CDN URL
    if (profilePicture.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        return getImageUrl(profilePicture);
    }

    // Otherwise return as is
    return profilePicture;
};

/**
 * Converts an image value (UUID or URL) to a proper preview URL for display
 * Used specifically for image previews in forms and uploads
 * @param imageValue - The image value (UUID, URL, or null/undefined)
 * @returns A proper URL for displaying the image preview or null
 */
export const getImagePreviewUrl = (imageValue?: string | null): string | null => {
    if (!imageValue) return null;

    // If it's already a full URL, return as is
    if (imageValue.startsWith('http')) return imageValue;

    // If it looks like a UUID, convert to CDN URL
    if (imageValue.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        return getImageUrl(imageValue);
    }

    // Otherwise return as is
    return imageValue;
}; 
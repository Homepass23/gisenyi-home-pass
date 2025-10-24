/**
 * Utility functions for handling images in the application
 */

/**
 * Validates and formats image URLs for proper display
 * @param imageUrl - The image URL to validate
 * @param fallbackImage - Fallback image path if validation fails
 * @returns A validated image URL or fallback image
 */
export function validateImageUrl(imageUrl: string, fallbackImage: string = '/images/cozy.jpg'): string {
  // If imageUrl is empty or undefined, return fallback
  if (!imageUrl) {
    return fallbackImage;
  }

  // If it's already an absolute URL, return as is
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }

  // If it's a relative path without leading slash, add it
  if (!imageUrl.startsWith('/')) {
    return `/${imageUrl}`;
  }

  // If it's already properly formatted, return as is
  return imageUrl;
}

/**
 * Gets the first valid image from an array of image URLs
 * @param imageUrls - Array of image URLs
 * @param fallbackImage - Fallback image path
 * @returns First valid image URL or fallback
 */
export function getFirstValidImage(imageUrls: string[] | undefined, fallbackImage: string = '/images/cozy.jpg'): string {
  // If no image URLs or empty array, return fallback
  if (!imageUrls || !Array.isArray(imageUrls) || imageUrls.length === 0) {
    return fallbackImage;
  }

  // Return the first valid image after validation
  return validateImageUrl(imageUrls[0], fallbackImage);
}
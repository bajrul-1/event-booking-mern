import { v2 as cloudinary } from 'cloudinary';

// Helper function to extract public ID from Cloudinary URL
export const getPublicIdFromUrl = (url) => {
    if (!url) return null;
    try {
        // Matches /upload/, optionally version (v12345/), then captures public_id until the extension
        const regex = /\/upload\/(?:v\d+\/)?(.+)\.[^.]+$/;
        const match = url.match(regex);
        return match ? match[1] : null;
    } catch (error) {
        console.error("Error extracting public ID from URL:", error);
        return null;
    }
};

export const deleteImage = async (imageUrl) => {
    try {
        if (!imageUrl) return;

        // Ensure it's a Cloudinary URL
        if (!imageUrl.includes('cloudinary.com')) return;

        const publicId = getPublicIdFromUrl(imageUrl);
        if (!publicId) {
            console.log("Could not extract public ID from:", imageUrl);
            return;
        }

        console.log(`Attempting to delete image with public ID: ${publicId}`);
        const result = await cloudinary.uploader.destroy(publicId);
        console.log(`Cloudinary deletion result for ${publicId}:`, result);
    } catch (error) {
        console.error("Error deleting image from Cloudinary:", error);
    }
};

import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary.js';

// Function to create multer upload middleware for specific folders
const createUpload = (folderName) => {
    // Define storage for uploaded files using Cloudinary
    const storage = new CloudinaryStorage({
        cloudinary: cloudinary,
        params: {
            folder: `event-booking/${folderName}`,
            allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
            public_id: (req, file) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                return file.fieldname + '-' + uniqueSuffix;
            }
        },
    });

    // File filter to allow only images
    const fileFilter = (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    };

    // Initialize multer
    return multer({
        storage: storage,
        limits: {
            fileSize: 10 * 1024 * 1024 // 10MB limit
        },
        fileFilter: fileFilter
    });
};

export default createUpload;

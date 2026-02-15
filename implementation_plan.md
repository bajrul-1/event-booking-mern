# Implementation Plan - Cloudinary Integration

## Goal Description
Migrate image storage from local disk to Cloudinary to ensure images are accessible remotely and not stored on the server's filesystem.

## User Review Required
> [!IMPORTANT]
> You must provide Cloudinary credentials in the `.env` file:
> `CLOUDINARY_CLOUD_NAME=your_cloud_name`
> `CLOUDINARY_API_KEY=your_api_key`
> `CLOUDINARY_API_SECRET=your_api_secret`

## Proposed Changes

### Backend Dependencies
#### [NEW] [package.json](file:///d:/Web Degine/MERN/event-booking-platform/backend/package.json)
- Add `cloudinary`
- Add `multer-storage-cloudinary`

### Configuration
#### [NEW] [cloudinary.js](file:///d:/Web Degine/MERN/event-booking-platform/backend/config/cloudinary.js)
- Configure Cloudinary with environment variables.

### Middleware
#### [MODIFY] [uploadMiddleware.js](file:///d:/Web Degine/MERN/event-booking-platform/backend/middleware/uploadMiddleware.js)
- Replace `multer.diskStorage` with `CloudinaryStorage`.
- Configure storage path/folder.

### Controllers
#### [MODIFY] [event_controller.js](file:///d:/Web Degine/MERN/event-booking-platform/backend/controllers/event_controller.js)
- Update image URL assignment to use `req.file.path`.
- Update delete logic (optional: delete from Cloudinary).

#### [MODIFY] [organizer.auth.controller.js](file:///d:/Web Degine/MERN/event-booking-platform/backend/controllers/organizer.auth.controller.js)
- Update profile/cover image URL assignment.

## Verification Plan

### Manual Verification
1.  **Environment Setup**: Add Cloudinary credentials to `.env`.
2.  **Start Server**: Run `npm start` in backend.
3.  **Upload Image**: Use Postman or the Frontend to create an event with an image.
4.  **Verify URL**: Check the response or database to see if the image URL is a Cloudinary URL (starts with `http://res.cloudinary.com/...`).
5.  **Verify Dashboard**: Check Cloudinary dashboard to see if the image appears.

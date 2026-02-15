# Cloudinary Integration Walkthrough

## Changes Made
- **Dependencies**: Installed `cloudinary` and `multer-storage-cloudinary`.
- **Configuration**: Created `backend/config/cloudinary.js` and added credentials to `.env`.
- **Middleware**: Updated `backend/middleware/uploadMiddleware.js` to upload files directly to Cloudinary.
- **Controllers**:
    - Updated `event_controller.js` to save Cloudinary URLs and **delete old images** when updating/deleting events.
    - Updated `organizer.auth.controller.js` to save Cloudinary URLs and **delete old images** when updating/deleting organizers.
- **Utils**: Created `backend/utils/cloudinaryUtils.js` to handle image deletion from Cloudinary.

## How to Verify

### 1. Start the Server
Ensure your backend server is running:
```bash
cd backend
npm start
```

### 2. Verify Upload (Create Event)
- Open your frontend application.
- Log in as an organizer.
- Create a new event and upload an image.
- Check Cloudinary Dashboard: The image should appear.

### 3. Verify Deletion (Update Event)
- Edit the event you just created.
- Upload a **new** image.
- Save the changes.
- Check Cloudinary Dashboard:
    - The **new** image should appear.
    - The **old** image should be gone (refresh the page to be sure).

### 4. Verify Deletion (Delete Event)
- Delete the event.
- Check Cloudinary Dashboard:
    - The image associated with the event should be gone.

### 5. Verify Organizer Profile
- Update your organizer profile picture.
- Check if the old profile picture is deleted from Cloudinary and the new one is added.

import express from 'express';
import { submitContactForm, getAllMessages, deleteMessage, getMessageById } from '../controllers/contact.controller.js';

const router = express.Router();

router.post('/', submitContactForm);

// --- Admin Routes ---
// TODO: Add Admin Middleware protection here
router.get('/', getAllMessages);
router.get('/:id', getMessageById); // Notun Route for single message
router.delete('/:id', deleteMessage);

export default router;

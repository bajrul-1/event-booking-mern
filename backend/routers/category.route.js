import express from 'express';
import { createCategory, getAllCategories } from '../controllers/category.controller.js';
import { protect, isAdmin } from '../middleware/authMiddleware.js';

const categoryRouter = express.Router();

// Public route to get all ACTIVE categories
categoryRouter.get('/', getAllCategories);

// Protected route for Admin to create a new category
categoryRouter.post('/create', protect, isAdmin, createCategory);

// TODO: Add Update and Delete routes later

export default categoryRouter;
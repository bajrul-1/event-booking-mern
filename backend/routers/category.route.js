import express from 'express';
import { createCategory, getAllCategories, updateCategory, deleteCategory, getAllCategoriesForAdmin } from '../controllers/category.controller.js';
import { protect, isAdmin } from '../middleware/authMiddleware.js';

const categoryRouter = express.Router();

// Public route to get all ACTIVE categories
categoryRouter.get('/', getAllCategories);

// Protected route for Admin to fetch all categories (including inactive)
categoryRouter.get('/admin/all', protect, isAdmin, getAllCategoriesForAdmin);

// Protected route for Admin to create a new category
categoryRouter.post('/create', protect, isAdmin, createCategory);

// Protected route for Admin to update an existing category
categoryRouter.put('/:id', protect, isAdmin, updateCategory);

// Protected route for Admin to delete a category
categoryRouter.delete('/:id', protect, isAdmin, deleteCategory);

export default categoryRouter;
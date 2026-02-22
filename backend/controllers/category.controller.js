import Category from '../models/Category.model.js';
import Event from '../models/Event.js';

// Create a new category (Admin Only)
export const createCategory = async (req, res) => {
    try {
        // Notun 'status' field-ta-o data theke neya hocche
        const { name, slug, description, imageUrl, status } = req.body;

        const categoryExists = await Category.findOne({ slug });
        if (categoryExists) {
            return res.status(400).json({ success: false, message: 'Category with this slug already exists.' });
        }

        const newCategory = new Category({
            name,
            slug,
            description,
            imageUrl,
            status // status-take ekhane set kora hocche
        });

        const savedCategory = await newCategory.save();
        res.status(201).json({ success: true, message: 'Category created successfully!', category: savedCategory });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error while creating category.' });
    }
};

// Get all categories (Public)
export const getAllCategories = async (req, res) => {
    try {
        // Ekhon shudhu 'active' category-gulo-i fetch kora hobe
        const categories = await Category.find({ status: 'active' }).sort({ name: 1 });
        res.status(200).json({ success: true, categories });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error while fetching categories.' });
    }
};

// Get all categories for Admin (Includes inactive)
export const getAllCategoriesForAdmin = async (req, res) => {
    try {
        const categories = await Category.find({}).sort({ name: 1 });
        res.status(200).json({ success: true, categories });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error while fetching all categories.' });
    }
};

// Update a category (Admin Only)
export const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, slug, description, imageUrl, status } = req.body;

        const category = await Category.findById(id);
        if (!category) {
            return res.status(404).json({ success: false, message: 'Category not found.' });
        }

        // Check if slug is taken by another category
        const slugExists = await Category.findOne({ slug, _id: { $ne: id } });
        if (slugExists) {
            return res.status(400).json({ success: false, message: 'Category with this slug already exists.' });
        }

        category.name = name;
        category.slug = slug;
        category.description = description;
        category.imageUrl = imageUrl;
        category.status = status;

        const updatedCategory = await category.save();

        res.status(200).json({ success: true, message: 'Category updated successfully!', category: updatedCategory });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error while updating category.' });
    }
};

// Delete a category (Admin Only)
export const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if there are any events linked to this category
        const linkedEventsCount = await Event.countDocuments({ category: id });
        if (linkedEventsCount > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete category. There are ${linkedEventsCount} event(s) associated with it.`
            });
        }

        const category = await Category.findByIdAndDelete(id);

        if (!category) {
            return res.status(404).json({ success: false, message: 'Category not found.' });
        }

        res.status(200).json({ success: true, message: 'Category deleted successfully!' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error while deleting category.' });
    }
};
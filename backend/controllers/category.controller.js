import Category from '../models/Category.model.js';

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

// TODO: Add Update (status change) and Delete controllers later
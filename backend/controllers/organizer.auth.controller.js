import Organizer from '../models/Organizer.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import { deleteImage } from '../utils/cloudinaryUtils.js';

// --- NOTUN FUNCTION ---
export const getAllOrganizers = async (req, res) => {
    try {
        // Shudhu 'organizer' role-er data fetch kora hocche
        const organizers = await Organizer.find({ role: 'organizer' }).select('-password');
        res.status(200).json({ success: true, organizers });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error while fetching organizers.' });
    }
};

export const loginOrganizer = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await Organizer.findOne({ email }).select('+password');
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ success: false, message: 'Invalid credentials.' });
        }
        if (user.role !== 'organizer' && user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Access denied.' });
        }
        const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.status(200).json({
            success: true,
            message: 'Login successful!',
            token: token,
            user: { id: user._id, name: user.name, email: user.email, role: user.role }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error during login.' });
    }
};

export const getOrganizerProfile = async (req, res) => {
    if (req.organizer) {
        res.status(200).json({ success: true, user: req.organizer });
    } else {
        res.status(404).json({ success: false, message: 'Organizer not found.' });
    }
};

export const createOrganizer = async (req, res) => {
    try {
        const { firstName, lastName, email, password, phone, bio, address, gender, dob } = req.body;
        const organizerExists = await Organizer.findOne({ email });
        if (organizerExists) {
            return res.status(400).json({ success: false, message: 'An organizer with this email already exists.' });
        }
        const newOrganizer = new Organizer({
            name: { firstName, lastName },
            email,
            password,
            phone,
            bio,
            address,
            gender,
            dob,
            role: 'organizer',
            profileImage: req.files?.profileImage ? req.files.profileImage[0].path : '',
            coverImage: req.files?.coverImage ? req.files.coverImage[0].path : ''
        });
        const savedOrganizer = await newOrganizer.save();
        res.status(201).json({
            success: true,
            message: 'New organizer created successfully.',
            organizer: savedOrganizer
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error while creating organizer.' });
    }
};

export const deleteOrganizer = async (req, res) => {
    try {
        const { id } = req.params;
        const organizer = await Organizer.findById(id);

        if (!organizer) {
            return res.status(404).json({ success: false, message: 'Organizer not found' });
        }

        // Delete images from Cloudinary
        if (organizer.profileImage) await deleteImage(organizer.profileImage);
        if (organizer.coverImage) await deleteImage(organizer.coverImage);

        await Organizer.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: 'Organizer deleted successfully.' });
    } catch (error) {
        console.error("Error deleting organizer:", error);
        res.status(500).json({ success: false, message: 'Server error while deleting organizer.' });
    }
};

export const updateOrganizerStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const organizer = await Organizer.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );

        if (!organizer) {
            return res.status(404).json({ success: false, message: 'Organizer not found' });
        }

        res.status(200).json({ success: true, message: `Organizer marked as ${status}`, organizer });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error while updating status' });
    }
};

export const updateOrganizer = async (req, res) => {
    try {
        const { id } = req.params;
        console.log('Update Organizer ID:', id);
        console.log('Update Req Body:', req.body);
        console.log('Update Req Files:', req.files);

        const { firstName, lastName, email, phone, bio, address, gender, dob } = req.body;

        const organizer = await Organizer.findById(id);
        if (!organizer) {
            return res.status(404).json({ success: false, message: 'Organizer not found' });
        }

        // Update fields
        if (firstName) organizer.name.firstName = firstName;
        if (lastName) organizer.name.lastName = lastName;
        if (email) organizer.email = email;
        if (phone) organizer.phone = phone;
        if (bio) organizer.bio = bio;
        if (address) organizer.address = address;
        if (gender) organizer.gender = gender;
        if (dob) organizer.dob = dob;

        if (req.files?.profileImage) {
            // Delete old profile image
            if (organizer.profileImage) {
                await deleteImage(organizer.profileImage);
            }
            organizer.profileImage = req.files.profileImage[0].path;
        }

        if (req.files?.coverImage) {
            // Delete old cover image
            if (organizer.coverImage) {
                await deleteImage(organizer.coverImage);
            }
            organizer.coverImage = req.files.coverImage[0].path;
        }

        const updatedOrganizer = await organizer.save();

        res.status(200).json({
            success: true,
            message: 'Organizer updated successfully.',
            organizer: updatedOrganizer
        });
    } catch (error) {
        console.error("Error updating organizer:", error);
        res.status(500).json({ success: false, message: 'Server error while updating organizer.' });
    }
};
import Event from '../models/Event.js';
import User from '../models/User.js';
import Category from '../models/Category.model.js';
import Organizer from '../models/Organizer.js';
import fs from 'fs';
import { deleteImage } from '../utils/cloudinaryUtils.js';





export const createEvent = async (req, res) => {
    try {
        console.log('Create Event Body:', req.body);
        console.log('Create Event File:', req.file);

        const organizerId = req.organizer._id;
        let eventData = req.body;

        // Validating JSON data from FormData
        if (typeof eventData.ticketTiers === 'string') {
            try { eventData.ticketTiers = JSON.parse(eventData.ticketTiers); } catch (e) { console.error('Error parsing ticketTiers:', e); }
        }
        if (typeof eventData.guests === 'string') {
            try { eventData.guests = JSON.parse(eventData.guests); } catch (e) { console.error('Error parsing guests:', e); }
        }

        const categoryDoc = await Category.findById(eventData.category);
        if (!categoryDoc) {
            return res.status(404).json({ success: false, message: 'Selected category does not exist.' });
        }
        if (categoryDoc.status === 'inactive') {
            return res.status(400).json({ success: false, message: 'Cannot create an event under an inactive category.' });
        }

        const imageUrl = req.file ? req.file.path : eventData.imageUrl;

        const newEvent = new Event({
            ...eventData,
            organizer: organizerId,
            imageUrl: imageUrl
        });

        const savedEvent = await newEvent.save();
        res.status(201).json({
            success: true,
            message: 'Event created successfully!',
            event: savedEvent
        });
    } catch (error) {
        console.error("Error creating event:", error);
        // Print the full error object if possible
        if (error.errors) console.error("Validation Errors:", JSON.stringify(error.errors, null, 2));
        res.status(500).json({ success: false, message: 'Server error while creating event.', error: error.message });
    }
};

export const updateEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const organizerId = req.organizer._id;
        let updateData = req.body;

        if (typeof updateData.ticketTiers === 'string') {
            try { updateData.ticketTiers = JSON.parse(updateData.ticketTiers); } catch (e) { }
        }
        if (typeof updateData.guests === 'string') {
            try { updateData.guests = JSON.parse(updateData.guests); } catch (e) { }
        }

        const event = await Event.findOne({ _id: id, organizer: organizerId });
        if (!event) {
            return res.status(404).json({ success: false, message: 'Event not found or unauthorized.' });
        }

        // Prevent updating expired events
        if (new Date(event.date) < new Date()) {
            return res.status(400).json({ success: false, message: 'Cannot update an expired event.' });
        }

        if (req.file) {
            // Delete old image from Cloudinary
            if (event.imageUrl) {
                await deleteImage(event.imageUrl);
            }
            updateData.imageUrl = req.file.path;
        }

        const updatedEvent = await Event.findByIdAndUpdate(id, updateData, { new: true });

        res.status(200).json({
            success: true,
            message: 'Event updated successfully!',
            event: updatedEvent
        });

    } catch (error) {
        console.error("Error updating event:", error);
        res.status(500).json({ success: false, message: 'Server error while updating event.' });
    }
};

export const deleteEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const organizerId = req.organizer._id;

        const event = await Event.findOneAndDelete({ _id: id, organizer: organizerId });
        if (!event) {
            return res.status(404).json({ success: false, message: 'Event not found or unauthorized.' });
        }

        // Delete image
        await deleteImage(event.imageUrl);
        // Delete image logic removed for Cloudinary migration (or update to delete from Cloudinary)
        // if (event.imageUrl && event.imageUrl.startsWith('uploads/')) {
        //     fs.unlink(event.imageUrl, (err) => {
        //         if (err) console.error("Failed to delete event image:", err);
        //     });
        // }

        res.status(200).json({ success: true, message: 'Event deleted successfully.' });
    } catch (error) {
        console.error("Error deleting event:", error);
        res.status(500).json({ success: false, message: 'Server error while deleting event.' });
    }
};

// --- Ekhon-er jonno onanno function-gulo add korchi ---

export const getAllEvents = async (req, res) => {
    try {
        const { page = 1, limit = 9, search, category, location, sortBy } = req.query;

        // 1. Build Query Object
        // Only show published AND future events on the main page
        const query = {
            status: 'published',
            date: { $gte: new Date() } // Filter out expired events
        };

        // Search (Title)
        if (search) {
            query.title = { $regex: search, $options: 'i' };
        }

        // Location
        if (location) {
            query.location = { $regex: location, $options: 'i' };
        }

        // Category Filter
        if (category && category !== 'all') {
            const categoryDoc = await Category.findOne({ slug: category });
            if (categoryDoc) {
                query.category = categoryDoc._id;
            } else {
                // If category slug passed but not found, return empty or ignore? 
                // Let's return empty to be correct.
                return res.status(200).json({
                    success: true,
                    events: [],
                    currentPage: 1,
                    totalPages: 0,
                    totalEvents: 0
                });
            }
        }

        // 2. Sorting Logic
        let sort = {};
        if (sortBy === 'date-asc') sort.date = 1;
        else if (sortBy === 'date-desc') sort.date = -1;
        // Price sorting is complex with ticketTiers array. 
        // For now, let's default to date-desc if price sort asked, or handle basic sorting.
        else sort.date = -1;

        // 3. Pagination Calculation
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // 4. Fetch Data
        const events = await Event.find(query)
            .populate('category', 'name slug')
            .sort(sort)
            .skip(skip)
            .limit(parseInt(limit));

        const totalEvents = await Event.countDocuments(query);
        const totalPages = Math.ceil(totalEvents / parseInt(limit));

        res.status(200).json({
            success: true,
            events,
            currentPage: parseInt(page),
            totalPages,
            totalEvents
        });

    } catch (error) {
        console.error("Error in getAllEvents:", error);
        res.status(500).json({ success: false, message: 'Server error while fetching events.' });
    }
};

export const getEventById = async (req, res) => {
    try {
        const { id } = req.params;
        const event = await Event.findById(id)
            // FIX: 'category'-কে populate করা হলো
            .populate('category', 'name')
            .populate('organizer', 'name');

        if (!event || event.status !== 'published') {
            return res.status(404).json({ success: false, message: 'Event not found.' });
        }
        res.status(200).json({ success: true, event });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error while fetching event details.' });
    }
};

export const getOrganizerEvents = async (req, res) => {
    try {
        const organizerId = req.organizer._id;
        const events = await Event.find({ organizer: organizerId })
            .populate('category', 'name')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, events });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error while fetching events.' });
    }
};



export const getEventByIdForOrganizer = async (req, res) => {
    try {
        const { id } = req.params;
        const organizerId = req.organizer._id;
        const event = await Event.findOne({ _id: id, organizer: organizerId })
            .populate('category', 'name');
        if (!event) {
            return res.status(404).json({ success: false, message: 'Event not found or you are not authorized.' });
        }
        res.status(200).json({ success: true, event });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

export const updateEventStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const organizerId = req.organizer._id;

        // --- THE FIX IS HERE ---
        if (!['unleashed', 'published', 'cancelled'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status value.' });
        }

        const event = await Event.findOne({ _id: id, organizer: organizerId });
        if (!event) {
            return res.status(404).json({ success: false, message: 'Event not found or not authorized.' });
        }

        if (new Date(event.date) < new Date()) {
            return res.status(400).json({ success: false, message: 'Cannot change status of an expired event.' });
        }

        event.status = status;
        const updatedEvent = await event.save();
        res.status(200).json({ success: true, message: 'Event status updated.', event: updatedEvent });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

export const getAllEventsForAdmin = async (req, res) => {
    try {
        const events = await Event.find({}) // Kono filter chara shob event
            .populate('category', 'name')
            .populate('organizer', 'name') // Organizer-er naam dekhabe
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, events });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error while fetching all events.' });
    }
};
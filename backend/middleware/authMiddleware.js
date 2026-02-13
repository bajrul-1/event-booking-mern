import { Clerk } from '@clerk/clerk-sdk-node';
import jwt from 'jsonwebtoken';
import Organizer from '../models/Organizer.js';

// --- Middleware 1: For Normal Users (Clerk) ---
export const clerkAuth = async (req, res, next) => {
    try {
        const clerk = Clerk({ secretKey: process.env.CLERK_SECRET_KEY });
        const authorizationHeader = req.headers.authorization;
        if (!authorizationHeader) {
            return res.status(401).json({ message: 'Authorization header is missing.' });
        }
        const token = authorizationHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Bearer token is missing.' });
        }
        const session = await clerk.verifyToken(token);
        req.auth = { userId: session.sub };
        next();
    } catch (error) {
        console.error('Clerk authentication error:', error);
        return res.status(401).json({ message: 'Unauthorized: Invalid session token.' });
    }
};

// --- Middleware 2: For Organizers/Admins (JWT) ---
// Ei function-ta token check kore organizer-er data ber korbe
export const protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Database-er 'organizers' collection theke data khujbe
            req.organizer = await Organizer.findById(decoded.userId).select('-password');

            if (!req.organizer) {
                return res.status(401).json({ success: false, message: 'Not authorized, user not found' });
            }
            next();
        } catch (error) {
            res.status(401).json({ success: false, message: 'Not authorized, token failed' });
        }
    }
    if (!token) {
        res.status(401).json({ success: false, message: 'Not authorized, no token' });
    }
};

// --- Middleware 3: For Admins Only (JWT Role Check) ---
// Ei function-ta check korbe user-er role 'admin' kina
export const isAdmin = (req, res, next) => {
    if (req.organizer && req.organizer.role === 'admin') {
        next();
    } else {
        res.status(403).json({ success: false, message: 'Not authorized as an admin' });
    }
};
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export const authMiddleware = async (req, res, next) => {
    try {
        // Extract token from cookie or Authorization header
        const token = req.cookies.token || req.headers.authorization?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        // Verify JWT token
        const decoded = jwt.verify(token, JWT_SECRET);

        // Find user in database
        const user = await User.findById(decoded.userId).select('-accessToken');

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Attach user to request object
        req.user = user;

        // Continue to next middleware/route
        next();

    } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
};


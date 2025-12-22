import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import PortfolioConfig from '../models/PortfolioConfig.js';

const router = express.Router();

// Get current user's config (returns null if not created yet)
router.get('/', authMiddleware, async (req, res) => {
    const { user } = req;
    if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    try {
        const config = await PortfolioConfig.findOne({ userId: user._id });
        if (!config) {
            return res.status(200).json({ config: null });
        }
        return res.status(200).json({
            config: {
                layout: config.layout,
                theme: config.theme,
                pinnedRepos: config.pinnedRepos,
            },
        });
    } catch (error) {
        console.error('Error fetching config:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// Create or update current user's config
router.put('/', authMiddleware, async (req, res) => {
    const { user } = req;
    if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const { layout, theme, pinnedRepos } = req.body;

        // Basic validation for pinnedRepos type
        if (pinnedRepos !== undefined && !Array.isArray(pinnedRepos)) {
            return res.status(400).json({ error: 'pinnedRepos must be an array' });
        }

        const update = {};
        if (layout !== undefined) update.layout = layout;
        if (theme !== undefined) update.theme = theme;
        if (pinnedRepos !== undefined) update.pinnedRepos = pinnedRepos;

        const config = await PortfolioConfig.findOneAndUpdate(
            { userId: user._id },
            { $set: update },
            { upsert: true, new: true, runValidators: true }
        );

        return res.status(200).json({
            message: 'Config saved',
            config: {
                layout: config.layout,
                theme: config.theme,
                pinnedRepos: config.pinnedRepos,
            },
        });
    } catch (error) {
        console.error('Error updating config:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ error: error.message });
        }
        return res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;



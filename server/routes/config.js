import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import PortfolioConfig from '../models/PortfolioConfig.js';

const router = express.Router();

// Get current user's config (returns defaults if not created yet)
router.get('/', authMiddleware, async (req, res) => {
    const { user } = req;
    if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    try {
        const config = await PortfolioConfig.findOne({ userId: user._id });
        if (!config) {
            // Return computed defaults if no config exists
            return res.status(200).json({
                config: {
                    layout: 'default',
                    theme: 'light',
                    pinnedRepos: [],
                    customTextSections: [],
                    itemOrder: [],
                    itemSizes: {},
                    visibleStats: [
                        { id: 'repos', label: 'Repos', visible: true },
                        { id: 'stars', label: 'Stars', visible: true },
                        { id: 'commits', label: 'Commits', visible: true },
                    ],
                },
            });
        }
        return res.status(200).json({
            config: {
                layout: config.layout,
                theme: config.theme,
                pinnedRepos: config.pinnedRepos || [],
                customTextSections: config.customTextSections || [],
                itemOrder: config.itemOrder || [],
                itemSizes: config.itemSizes || {},
                visibleStats: config.visibleStats || [
                    { id: 'repos', label: 'Repos', visible: true },
                    { id: 'stars', label: 'Stars', visible: true },
                    { id: 'commits', label: 'Commits', visible: true },
                ],
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
        const {
            layout,
            theme,
            pinnedRepos,
            customTextSections,
            itemOrder,
            itemSizes,
            visibleStats,
        } = req.body;

        // Build update object with only provided fields
        const update = {};

        if (layout !== undefined) {
            update.layout = layout;
        }
        if (theme !== undefined) {
            update.theme = theme;
        }
        if (pinnedRepos !== undefined) {
            if (!Array.isArray(pinnedRepos)) {
                return res.status(400).json({ error: 'pinnedRepos must be an array' });
            }
            update.pinnedRepos = pinnedRepos;
        }
        if (customTextSections !== undefined) {
            if (!Array.isArray(customTextSections)) {
                return res.status(400).json({ error: 'customTextSections must be an array' });
            }
            // Validate each text section
            for (const section of customTextSections) {
                if (!section.id || typeof section.id !== 'number') {
                    return res.status(400).json({ error: 'Each text section must have a numeric id' });
                }
                if (!section.title || typeof section.title !== 'string') {
                    return res.status(400).json({ error: 'Each text section must have a title' });
                }
                if (section.content === undefined || typeof section.content !== 'string') {
                    return res.status(400).json({ error: 'Each text section must have content' });
                }
            }
            update.customTextSections = customTextSections;
        }
        if (itemOrder !== undefined) {
            if (!Array.isArray(itemOrder)) {
                return res.status(400).json({ error: 'itemOrder must be an array' });
            }
            // Validate itemOrder contains strings
            if (!itemOrder.every(item => typeof item === 'string')) {
                return res.status(400).json({ error: 'itemOrder must be an array of strings' });
            }
            update.itemOrder = itemOrder;
        }
        if (itemSizes !== undefined) {
            if (typeof itemSizes !== 'object' || Array.isArray(itemSizes)) {
                return res.status(400).json({ error: 'itemSizes must be an object' });
            }
            update.itemSizes = itemSizes;
        }
        if (visibleStats !== undefined) {
            if (!Array.isArray(visibleStats)) {
                return res.status(400).json({ error: 'visibleStats must be an array' });
            }
            // Validate each stat
            for (const stat of visibleStats) {
                if (!stat.id || typeof stat.id !== 'string') {
                    return res.status(400).json({ error: 'Each stat must have an id string' });
                }
                if (!['repos', 'stars', 'commits'].includes(stat.id)) {
                    return res.status(400).json({ error: `Invalid stat id: ${stat.id}. Must be 'repos', 'stars', or 'commits'` });
                }
                if (stat.label === undefined || typeof stat.label !== 'string') {
                    return res.status(400).json({ error: 'Each stat must have a label' });
                }
                if (typeof stat.visible !== 'boolean') {
                    return res.status(400).json({ error: 'Each stat must have a visible boolean' });
                }
            }
            update.visibleStats = visibleStats;
        }

        // Use findOneAndUpdate with upsert to create or update
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
                pinnedRepos: config.pinnedRepos || [],
                customTextSections: config.customTextSections || [],
                itemOrder: config.itemOrder || [],
                itemSizes: config.itemSizes || {},
                visibleStats: config.visibleStats || [
                    { id: 'repos', label: 'Repos', visible: true },
                    { id: 'stars', label: 'Stars', visible: true },
                    { id: 'commits', label: 'Commits', visible: true },
                ],
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

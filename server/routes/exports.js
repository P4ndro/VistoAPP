import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import ExportHistory from '../models/ExportHistory.js';
import { logError } from '../utils/logger.js';

const router = express.Router();

// Get all exports for current user
router.get('/', authMiddleware, async (req, res) => {
    const { user } = req;
    if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const exports = await ExportHistory.find({ userId: user._id })
            .sort({ createdAt: -1 }) // Most recent first
            .select('_id tag createdAt')
            .lean();

        return res.status(200).json({
            exports: exports || [],
        });
    } catch (error) {
        logError('Error fetching exports', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// Create a new export record
router.post('/', authMiddleware, async (req, res) => {
    const { user } = req;
    if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const { tag, exportData } = req.body;

        if (!tag || typeof tag !== 'string' || tag.trim().length === 0) {
            return res.status(400).json({ error: 'Tag is required and must be a non-empty string' });
        }

        const sanitizedTag = tag.trim();
        if (sanitizedTag.length > 100) {
            return res.status(400).json({ error: 'Tag cannot exceed 100 characters' });
        }
        
        // Basic sanitization - remove potentially dangerous characters
        if (!/^[a-zA-Z0-9\s\-_.,!?()]+$/.test(sanitizedTag)) {
            return res.status(400).json({ error: 'Tag contains invalid characters' });
        }

        const exportRecord = new ExportHistory({
            userId: user._id,
            tag: tag.trim(),
            exportData: exportData || {},
        });

        await exportRecord.save();

        return res.status(201).json({
            message: 'Export saved successfully',
            export: {
                _id: exportRecord._id,
                tag: exportRecord.tag,
                createdAt: exportRecord.createdAt,
            },
        });
    } catch (error) {
        logError('Error saving export', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ error: error.message });
        }
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// Get a single export by ID
router.get('/:id', authMiddleware, async (req, res) => {
    const { user } = req;
    if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const { id } = req.params;

        const exportRecord = await ExportHistory.findOne({ _id: id, userId: user._id })
            .lean();

        if (!exportRecord) {
            return res.status(404).json({ error: 'Export not found' });
        }

        return res.status(200).json({
            export: exportRecord,
        });
    } catch (error) {
        logError('Error fetching export', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete an export
router.delete('/:id', authMiddleware, async (req, res) => {
    const { user } = req;
    if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const { id } = req.params;

        const exportRecord = await ExportHistory.findOne({ _id: id, userId: user._id });

        if (!exportRecord) {
            return res.status(404).json({ error: 'Export not found' });
        }

        await ExportHistory.deleteOne({ _id: id, userId: user._id });

        return res.status(200).json({
            message: 'Export deleted successfully',
        });
    } catch (error) {
        logError('Error deleting export', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;


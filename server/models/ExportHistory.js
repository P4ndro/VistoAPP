import mongoose from 'mongoose';

const exportHistorySchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        tag: {
            type: String,
            required: true,
            trim: true,
            maxlength: [100, 'Tag cannot exceed 100 characters'],
        },
        exportData: {
            type: mongoose.Schema.Types.Mixed,
            default: {},
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
        collection: 'export_history',
    }
);

// Index for faster queries
exportHistorySchema.index({ userId: 1, createdAt: -1 });

const ExportHistory = mongoose.model('ExportHistory', exportHistorySchema);
export default ExportHistory;


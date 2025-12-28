import mongoose from 'mongoose';

// Sub-schema for custom text sections
const customTextSectionSchema = new mongoose.Schema({
    id: {
        type: Number,
        required: true,
    },
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    content: {
        type: String,
        required: true,
        maxlength: [5000, 'Content cannot exceed 5000 characters'],
    },
}, { _id: false });

// Sub-schema for visible stats
const visibleStatSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        enum: ['repos', 'stars', 'commits'],
    },
    label: {
        type: String,
        required: true,
    },
    visible: {
        type: Boolean,
        required: true,
        default: true,
    },
}, { _id: false });

const portfolioConfigSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true,
        },
        layout: {
            type: String,
            required: true,
            default: 'default',
            enum: ['default', 'classic', 'compact'],
        },
        theme: {
            type: String,
            required: true,
            default: 'light',
            enum: ['light', 'dark', 'system', 'blue', 'pink'],
        },
        pinnedRepos: {
            type: [Number], // GitHub repo IDs, matches StatsCache.githubId type
            default: [],
            validate: {
                validator: function (arr) {
                    return !Array.isArray(arr) || arr.length <= 6;
                },
                message: 'You can pin at most 6 repositories.',
            },
        },
        customTextSections: {
            type: [customTextSectionSchema],
            default: [],
            validate: {
                validator: function (arr) {
                    return !Array.isArray(arr) || arr.length <= 10;
                },
                message: 'You can add at most 10 text sections.',
            },
        },
        itemOrder: {
            type: [String],
            default: [],
        },
        itemSizes: {
            type: mongoose.Schema.Types.Mixed,
            default: {},
        },
        visibleStats: {
            type: [visibleStatSchema],
            default: [
                { id: 'repos', label: 'Repos', visible: true },
                { id: 'stars', label: 'Stars', visible: true },
                { id: 'commits', label: 'Commits', visible: true },
            ],
            validate: {
                validator: function (arr) {
                    return !Array.isArray(arr) || arr.length <= 3;
                },
                message: 'You can have at most 3 stats.',
            },
        },
    },
    {
        timestamps: true,
        collection: 'portfolio_configs',
    }
);

const PortfolioConfig = mongoose.model('PortfolioConfig', portfolioConfigSchema);
export default PortfolioConfig;

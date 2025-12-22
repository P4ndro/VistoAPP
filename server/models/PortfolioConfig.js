import mongoose from 'mongoose';

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
    },
    {
        timestamps: true,
        collection: 'portfolio_configs',
    }
);

const PortfolioConfig = mongoose.model('PortfolioConfig', portfolioConfigSchema);
export default PortfolioConfig;
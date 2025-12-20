import mongoose from "mongoose";


const syncSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
    },
    repositoryCount: {
        type: Number,
        required: true,
        default: 0,

    },
    totalStars: {
        type: Number,
        required: true,
        default: 0,
    },
    totalForks: {
        type: Number,
        required: true,
        default: 0,
    },
    totalCommits: {
        type: Number,
        required: true,
        default: 0,
    },
    languages: {
        type: mongoose.Schema.Types.Mixed,
        default: {},
    },
   recentCommits: {
    type: Number,
    required: true,
    default: 0,
   },
   syncedAt: {
    type: Date,
    default: Date.now,
   },
   repositories: [{
        githubId: {
            type: Number,
            required: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        fullName: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            default: "",
        },
        url: {
            type: String,
            default: "",
        },
        htmlUrl: {
            type: String,
            default: "",
        },
        stars: {
            type: Number,
            required: true,
            default: 0,
            min: 0,
        },
        forks: {
            type: Number,
            required: true,
            default: 0,
            min: 0,
        },
        watchers: {
            type: Number,
            required: true,
            default: 0,
            min: 0,
        },
        language: {
            type: String,
            default: null,
        },
        languages: {
            type: mongoose.Schema.Types.Mixed,
            default: {},
        },
        topics: {
            type: [String],
            default: [],
        },
        createdAt: {
            type: Date,
            required: true,
        },
        updatedAt: {
            type: Date,
            required: true,
        },
        pushedAt: {
            type: Date,
            default: null,
        },
        isPrivate: {
            type: Boolean,
            required: true,
            default: false,
        },
        isFork: {
            type: Boolean,
            required: true,
            default: false,
        },
        defaultBranch: {
            type: String,
            default: "main",
        },
    }],
}, 
{ timestamps: true, collection: 'stats_cache' });




  







const StatsCache = mongoose.model('StatsCache', syncSchema);

export default StatsCache;





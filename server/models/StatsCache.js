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
}, 
{ timestamps: true, collection: 'stats_cache' });



const StatsCache = mongoose.model('StatsCache', syncSchema);



export default StatsCache;





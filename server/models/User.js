import mongoose from 'mongoose';



const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    githubId: {
        type: String,
        required: true,
        unique: true,
    },
    avatarUrl: {
        type: String,
        required: false,
    },
    accessToken: {
        type: String,
        required: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    lastSyncAt: {
        type: Date,
        default: Date.now,
    },

   
});

const User = mongoose.model('User', userSchema);

export default User;
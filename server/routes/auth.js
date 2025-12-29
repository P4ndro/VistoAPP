import express from 'express';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { authMiddleware } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import { encrypt } from '../utils/encryption.js';
import { logError, logInfo } from '../utils/logger.js';


const router = express.Router();

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Get JWT_SECRET at runtime (after dotenv loads)
const getJWTSecret = () => {
    const secret = process.env.JWT_SECRET;
    if (!secret && process.env.NODE_ENV === 'production') {
        logError('ERROR: JWT_SECRET is required in production');
        process.exit(1);
    }
    return secret;
};

router.get('/github', authLimiter, (req, res) => {
    const CLIENT_ID = process.env.GITHUB_CLIENT_ID;
    
    if (!CLIENT_ID) {
        return res.status(500).json({ error: 'GitHub OAuth not configured' });
    }

    const redirectUri = `${req.protocol}://${req.get('host')}/auth/github/callback`;
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=user:email,repo`;
    res.redirect(githubAuthUrl);
});

router.get('/github/callback', authLimiter, async (req, res) => {
    const { code } = req.query;
    const CLIENT_ID = process.env.GITHUB_CLIENT_ID;
    const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;

    if (!code) {
        return res.redirect(`${CLIENT_URL}/login?error=no_code`);
    }

    try {
        const tokenResponse = await axios.post(
            'https://github.com/login/oauth/access_token',
            {
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
                code: code,
            },
            {
                headers: {
                    Accept: 'application/json',
                },
            }
        );

        const { access_token } = tokenResponse.data;

        if (!access_token) {
            return res.redirect(`${CLIENT_URL}/login?error=no_token`);
        }

        const userResponse = await axios.get('https://api.github.com/user', {
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        });

        const { id, login, avatar_url } = userResponse.data;

        // Encrypt access token before storing
        const encryptedToken = encrypt(access_token);
        if (!encryptedToken) {
            logError('Failed to encrypt access token');
            return res.redirect(`${CLIENT_URL}/login?error=auth_failed`);
        }

        let user = await User.findOne({ githubId: id.toString() });

        if (user) {
            user.accessToken = encryptedToken;
            user.avatarUrl = avatar_url || user.avatarUrl;
            await user.save();
        } else {
            user = await User.create({
                githubId: id.toString(),
                username: login,
                avatarUrl: avatar_url,
                accessToken: encryptedToken,
            });
        }

        const JWT_SECRET = getJWTSecret();
        if (!JWT_SECRET) {
            logError('JWT_SECRET not available');
            return res.redirect(`${CLIENT_URL}/login?error=auth_failed`);
        }

        const token = jwt.sign(
            { userId: user._id, username: user.username },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        logInfo('User authenticated successfully', { username: login, userId: user._id });
        res.redirect(`${CLIENT_URL}/dashboard`);
    } catch (error) {
        logError('GitHub OAuth error', error);
        res.redirect(`${CLIENT_URL}/login?error=auth_failed`);
    }
});

// Use authMiddleware instead of duplicating auth logic
router.get('/me', authMiddleware, (req, res) => {
    // req.user is already attached by authMiddleware
    res.json({ user: req.user });
});

router.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ message: 'Logged out successfully' });
});

export default router;
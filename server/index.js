import dotenv from 'dotenv';
dotenv.config({ quiet: true });
import statsRoutes from './routes/stats.js';
import configRoutes from './routes/config.js';
import exportsRoutes from './routes/exports.js';

import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { generalLimiter } from './middleware/rateLimiter.js';
import authRoutes from './routes/auth.js';
import { logError, logInfo } from './utils/logger.js';

const app = express();

const port = process.env.PORT || 3000;

// Security: Helmet.js for comprehensive security headers
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
    crossOriginEmbedderPolicy: false, // Allow external images (GitHub avatars)
}));

// Security: Request size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS configuration
const allowedOrigins = process.env.CLIENT_URL 
    ? [process.env.CLIENT_URL] 
    : ['http://localhost:5173'];

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(cookieParser());

// Rate limiting - General API rate limit
app.use('/api', generalLimiter);

const DATABASE_URL = process.env.DATABASE_URL || process.env.MONGO_URI;

if (!DATABASE_URL) {
    logError('ERROR: MONGO_URI or DATABASE_URL is not defined in .env file');
    process.exit(1);
}

mongoose.connect(DATABASE_URL)
    .then(() => {
        logInfo('✅ Connected to MongoDB');
    })
    .catch((err) => {
        logError('❌ MongoDB connection error', err);
    });

app.use('/auth', authRoutes);
app.use('/stats', statsRoutes);
app.use('/config', configRoutes);
app.use('/exports', exportsRoutes);
// Health check endpoint
app.get('/', (req, res) => {
    res.json({ 
        message: 'Visto API',
        status: 'running',
        version: '1.0.0'
    });
});

// Public info endpoints
app.get('/about', (req, res) => {
    res.json({ 
        message: 'Visto - Transform your GitHub activity into a beautiful developer portfolio',
        description: 'A MERN-stack application built by Sandro Iobidze as part of his learning journey. Create customizable developer portfolios from GitHub data.'
    });
});
 
app.get('/contact', (req, res) => {
    res.json({ 
        message: 'Contact Visto',
        note: 'For support and inquiries, please visit the application or check the GitHub repository'
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    logError('Request error', err);
    
    // Don't leak error details in production
    if (process.env.NODE_ENV === 'production') {
        res.status(err.status || 500).json({ 
            error: 'An error occurred. Please try again later.' 
        });
    } else {
        res.status(err.status || 500).json({ 
            error: err.message || 'Internal server error',
            stack: err.stack
        });
    }
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    logInfo(`Server is running on port ${PORT}`);
});


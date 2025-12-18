import dotenv from 'dotenv';
dotenv.config({ quiet: true });

import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.js';

const app = express();

app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

const DATABASE_URL = process.env.DATABASE_URL || process.env.MONGO_URI;

if (!DATABASE_URL) {
    console.error('ERROR: MONGO_URI or DATABASE_URL is not defined in .env file');
    process.exit(1);
}

mongoose.connect(DATABASE_URL)
    .then(() => {
        console.log('✅ Connected to MongoDB');
    })
    .catch((err) => {
        console.error('❌ MongoDB connection error:', err.message);
    });

app.use('/auth', authRoutes);

app.get('/', (req, res) => {
    res.json({ message: 'Hello World' });
});

app.get('/about', (req, res) => {
    res.json({ message: 'About page' });
});
 
app.get('/contact', (req, res) => {
    res.json({ message: 'Contact page' });
});
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});


import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import StatsCache from '../models/StatsCache.js';
import User from '../models/User.js';
import axios from 'axios';
import { syncLimiter } from '../middleware/rateLimiter.js';
import { logError, logInfo } from '../utils/logger.js';
import { decrypt } from '../utils/encryption.js';

const router = express.Router();

router.get('/', authMiddleware, async (req, res) => {
    const { user } = req;
    if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    try {
        const stats = await StatsCache.findOne({ userId: user._id });
        if (!stats) {
            return res.status(200).json({ stats: null });
        }
        return res.status(200).json({ stats });
    } catch (error) {
        logError('Error fetching stats', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/sync', authMiddleware, syncLimiter, async (req, res) => {
    const { user } = req;
    if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const userWithToken = await User.findById(user._id);
        
        if (!userWithToken || !userWithToken.accessToken) {
            return res.status(400).json({ error: 'GitHub access token not found. Please re-authenticate.' });
        }

        // Decrypt access token
        const accessToken = decrypt(userWithToken.accessToken);
        if (!accessToken) {
            logError('Failed to decrypt access token for user', { userId: user._id });
            return res.status(400).json({ error: 'GitHub access token invalid. Please re-authenticate.' });
        }

        const authHeaders = {
            Authorization: `Bearer ${accessToken}`,
            Accept: 'application/vnd.github.v3+json'
        };

        const reposResponse = await axios.get('https://api.github.com/user/repos?per_page=100&sort=updated&type=all', {
            headers: authHeaders
        });
    

        const allRepos = reposResponse.data;
        const forkCount = allRepos.filter(repo => repo.fork === true).length;
        const repos = allRepos.filter(repo => !repo.fork);
        const repositoryCount = repos.length;
        
        let totalStars = 0;
        let totalForks = 0;
        const languageBytes = {};
        const repositoriesArray = [];

        for (const repo of repos) {
            totalStars += repo.stargazers_count || 0;
            totalForks += repo.forks_count || 0;

            let repoLanguages = {};
            try {
                const langResponse = await axios.get(`https://api.github.com/repos/${repo.full_name}/languages`, {
                    headers: authHeaders
                });

                repoLanguages = langResponse.data || {};
                for (const [lang, bytes] of Object.entries(repoLanguages)) {
                    languageBytes[lang] = (languageBytes[lang] || 0) + bytes;
                }
            } catch (langError) {
                logError(`Error fetching languages for ${repo.full_name}`, langError);
            }

            repositoriesArray.push({
                githubId: repo.id,
                name: repo.name,
                fullName: repo.full_name,
                description: repo.description || "",
                url: repo.url,
                htmlUrl: repo.html_url,
                stars: repo.stargazers_count || 0,
                forks: repo.forks_count || 0,
                watchers: repo.watchers_count || 0,
                language: repo.language || null,
                languages: repoLanguages,
                topics: repo.topics || [],
                createdAt: new Date(repo.created_at),
                updatedAt: new Date(repo.updated_at),
                pushedAt: repo.pushed_at ? new Date(repo.pushed_at) : null,
                isPrivate: repo.private || false,
                isFork: repo.fork || false,
                defaultBranch: repo.default_branch || "main",
            });
        }

        const totalBytes = Object.values(languageBytes).reduce((sum, bytes) => sum + bytes, 0);
        const languages = {};
        for (const [lang, bytes] of Object.entries(languageBytes)) {
            languages[lang] = totalBytes > 0 ? parseFloat(((bytes / totalBytes) * 100).toFixed(1)) : 0;
        }

        let totalCommits = 0;
        let recentCommits = 0;
        
        try {
            for (const repo of repos.slice(0, 30)) {
                try {
                    const commitsResponse = await axios.get(
                        `https://api.github.com/repos/${repo.full_name}/commits?author=${userWithToken.username}&per_page=1`,
                        { headers: authHeaders }
                    );
                    
                    if (commitsResponse.headers.link) {
                        const linkHeader = commitsResponse.headers.link;
                        const lastPageMatch = linkHeader.match(/<[^>]*[?&]page=(\d+)[^>]*>; rel="last"/);
                        if (lastPageMatch) {
                            const commitCount = parseInt(lastPageMatch[1], 10);
                            totalCommits += commitCount;
                        } else if (commitsResponse.data.length > 0) {
                            totalCommits += 1;
                        }
                    } else if (commitsResponse.data.length > 0) {
                        totalCommits += 1;
                    }
                } catch (repoCommitsError) {
                    if (repoCommitsError.response?.status !== 409) {
                        logError(`Error fetching commits for ${repo.full_name}`, repoCommitsError);
                    }
                }
            }
            
            try {
                const eventsResponse = await axios.get(`https://api.github.com/users/${userWithToken.username}/events/public?per_page=100`, {
                    headers: authHeaders
                });

                const events = eventsResponse.data;
                const commitEvents = events.filter(event => event.type === 'PushEvent');
                recentCommits = commitEvents.reduce((sum, event) => {
                    const commitCount = event.payload.commits?.length || 0;
                    return sum + commitCount;
                }, 0);
            } catch (eventsError) {
                logError('Error fetching commit events', eventsError);
            }
            
            if (recentCommits === 0 && totalCommits > 0) {
                recentCommits = totalCommits;
            }
        } catch (error) {
            logError('Error fetching commits', error);
        }

        const updateData = {
            $set: {
                userId: user._id,
                repositoryCount,
                totalStars,
                totalForks,
                totalCommits,
                languages,
                recentCommits,
                syncedAt: new Date()
            }
        };

        if (repositoriesArray.length > 0) {
            updateData.$set.repositories = repositoriesArray;
        }

        const stats = await StatsCache.findOneAndUpdate(
            { userId: user._id },
            updateData,
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        if (!stats) {
            throw new Error('Failed to save stats to database');
        }

        await User.findByIdAndUpdate(user._id, { lastSyncAt: new Date() });

        const statsObj = stats.toObject ? stats.toObject() : stats;

        return res.status(200).json({ 
            message: 'Stats synced successfully',
            stats: statsObj
        });

    } catch (error) {
        logError('Error syncing stats', error);
        
        if (error.response?.status === 401) {
            return res.status(401).json({ error: 'GitHub authentication failed. Please re-authenticate.' });
        }
        
        return res.status(500).json({ 
            error: 'Internal server error'
        });
    }
});

export default router;

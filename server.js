// 🚀 سيرفر GROQ API + Push Notifications
// هذا السيرفر يستقبل طلبات الدردشة والإشعارات من المتصفح

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import webpush from 'web-push';
import { readFile, writeFile, access } from 'fs/promises';
import { constants as fsConstants } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
// Used to generate secure random OAuth state tokens
import crypto from 'crypto';

const app = express();
const PORT = process.env.PORT || 3001;
const GROQ_API_KEY = process.env.GROQ_API_KEY || '';
const GROQ_API_URL = process.env.GROQ_API_URL || 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || '';
const YOUTUBE_API_URL = process.env.YOUTUBE_API_URL || 'https://www.googleapis.com/youtube/v3/search';
const YOUTUBE_CLIENT_ID = process.env.YOUTUBE_CLIENT_ID || '';
const YOUTUBE_CLIENT_SECRET = process.env.YOUTUBE_CLIENT_SECRET || '';
const YOUTUBE_OAUTH_REDIRECT_URI = process.env.YOUTUBE_OAUTH_REDIRECT_URI || 'http://localhost:3001/api/youtube/connect/callback';
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || '';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || '';
const SUBSCRIPTIONS_FILE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'push-subscriptions.json');
const YOUTUBE_AUTH_STATES_FILE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'youtube-auth-states.json');
const YOUTUBE_TOKENS_FILE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'youtube-tokens.json');

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
    webpush.setVapidDetails('mailto:support@whiterchat.me', VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
}

app.use(cors());
app.use(express.json({ limit: '25mb' }));

async function ensureJsonFile(filePath, fallback) {
    try {
        await access(filePath, fsConstants.F_OK);
    } catch {
        await writeFile(filePath, JSON.stringify(fallback, null, 2), 'utf8');
    }
}

async function loadSubscriptions() {
    await ensureJsonFile(SUBSCRIPTIONS_FILE, []);
    try {
        const raw = await readFile(SUBSCRIPTIONS_FILE, 'utf8');
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        console.error('Failed to load subscriptions:', error);
        return [];
    }
}

async function saveSubscriptions(subscriptions) {
    await writeFile(SUBSCRIPTIONS_FILE, JSON.stringify(subscriptions, null, 2), 'utf8');
}

async function readJsonFile(filePath, fallback) {
    await ensureJsonFile(filePath, fallback);
    try {
        const raw = await readFile(filePath, 'utf8');
        const parsed = JSON.parse(raw);
        return parsed && typeof parsed === 'object' ? parsed : fallback;
    } catch (error) {
        console.error(`Failed to read JSON file ${filePath}:`, error);
        return fallback;
    }
}

async function writeJsonFile(filePath, value) {
    await writeFile(filePath, JSON.stringify(value, null, 2), 'utf8');
}

function youtubeOAuthConfigured() {
    return Boolean(YOUTUBE_CLIENT_ID && YOUTUBE_CLIENT_SECRET && YOUTUBE_OAUTH_REDIRECT_URI);
}

function encodeFormBody(fields) {
    return new URLSearchParams(fields).toString();
}

async function refreshYouTubeAccessToken(refreshToken) {
    const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: encodeFormBody({
            client_id: YOUTUBE_CLIENT_ID,
            client_secret: YOUTUBE_CLIENT_SECRET,
            refresh_token: refreshToken,
            grant_type: 'refresh_token'
        })
    });

    const data = await response.json();
    if (!response.ok || data.error) {
        throw new Error(data?.error_description || data?.error || 'Failed to refresh YouTube token');
    }

    return data;
}

async function getValidYouTubeAccessToken(userId) {
    const allTokens = await readJsonFile(YOUTUBE_TOKENS_FILE, {});
    const record = allTokens[userId];
    if (!record || !record.accessToken || !record.refreshToken) {
        throw new Error('YouTube account is not connected');
    }

    const expiresAt = Number(record.expiresAt || 0);
    if (expiresAt > Date.now() + 60_000) {
        return record.accessToken;
    }

    const refreshed = await refreshYouTubeAccessToken(record.refreshToken);
    const nextRecord = {
        ...record,
        accessToken: refreshed.access_token,
        expiresAt: Date.now() + (Number(refreshed.expires_in || 3600) * 1000)
    };
    allTokens[userId] = nextRecord;
    await writeJsonFile(YOUTUBE_TOKENS_FILE, allTokens);
    return nextRecord.accessToken;
}

function createRateLimiter({ windowMs, maxRequests }) {
    const buckets = new Map();
    return (req, res, next) => {
        const now = Date.now();
        const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';
        const key = `${ip}:${req.path}`;
        const recent = (buckets.get(key) || []).filter((ts) => now - ts < windowMs);

        if (recent.length >= maxRequests) {
            return res.status(429).json({ error: 'Too many requests. Please try again shortly.' });
        }

        recent.push(now);
        buckets.set(key, recent);
        next();
    };
}

function pruneExpiredOAuthStates(statesObject) {
    const tenMinutes = 10 * 60 * 1000;
    const now = Date.now();
    for (const [stateKey, value] of Object.entries(statesObject)) {
        const createdAt = Number(value?.createdAt || 0);
        if (!createdAt || now - createdAt > tenMinutes) {
            delete statesObject[stateKey];
        }
    }
}

const youtubeSensitiveRateLimit = createRateLimiter({ windowMs: 60_000, maxRequests: 6 });

app.get('/api/health', (req, res) => {
    res.json({
        status: 'Server is running ✅',
        timestamp: new Date().toISOString(),
        pushEnabled: Boolean(VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY)
    });
});

app.get('/api/vapid-public-key', (req, res) => {
    if (!VAPID_PUBLIC_KEY) {
        return res.status(404).json({ error: 'VAPID public key is not configured' });
    }
    res.json({ publicKey: VAPID_PUBLIC_KEY });
});

app.post('/api/subscribe', async (req, res) => {
    try {
        const subscription = req.body;
        if (!subscription || !subscription.endpoint) {
            return res.status(400).json({ error: 'Invalid subscription payload' });
        }

        const subscriptions = await loadSubscriptions();
        const exists = subscriptions.some((item) => item.endpoint === subscription.endpoint);
        if (!exists) {
            subscriptions.push(subscription);
            await saveSubscriptions(subscriptions);
        }

        res.json({ success: true, message: 'Subscription saved' });
    } catch (error) {
        console.error('Subscribe Error:', error);
        res.status(500).json({ error: 'Failed to save subscription', message: error.message });
    }
});

app.post('/api/unsubscribe', async (req, res) => {
    try {
        const { endpoint } = req.body;
        if (!endpoint) {
            return res.status(400).json({ error: 'Endpoint is required' });
        }

        const subscriptions = await loadSubscriptions();
        const filtered = subscriptions.filter((item) => item.endpoint !== endpoint);
        await saveSubscriptions(filtered);

        res.json({ success: true, message: 'Subscription removed' });
    } catch (error) {
        console.error('Unsubscribe Error:', error);
        res.status(500).json({ error: 'Failed to remove subscription', message: error.message });
    }
});

app.post('/api/notify', async (req, res) => {
    try {
        if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
            return res.status(500).json({ error: 'Push notifications are not configured' });
        }

        const { title = 'TawjihiGuide', body = 'لديك إشعار جديد', url = '/notifications.html' } = req.body || {};
        const subscriptions = await loadSubscriptions();
        const payload = JSON.stringify({ title, body, url });
        const results = [];

        for (const subscription of subscriptions) {
            try {
                await webpush.sendNotification(subscription, payload);
                results.push({ endpoint: subscription.endpoint, status: 'sent' });
            } catch (error) {
                results.push({ endpoint: subscription.endpoint, status: 'failed' });
                if (error.statusCode === 410 || error.statusCode === 404) {
                    const updated = subscriptions.filter((item) => item.endpoint !== subscription.endpoint);
                    await saveSubscriptions(updated);
                }
            }
        }

        res.json({ success: true, results });
    } catch (error) {
        console.error('Notify Error:', error);
        res.status(500).json({ error: 'Failed to send notifications', message: error.message });
    }
});

app.post('/api/chat', async (req, res) => {
    try {
        const { messages } = req.body;

        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({ error: 'Invalid messages format. Expected an array of messages.' });
        }

        if (!GROQ_API_KEY) {
            return res.status(500).json({ error: 'GROQ API key is missing from environment' });
        }

        const groqResponse = await fetch(GROQ_API_URL, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: GROQ_MODEL,
                messages,
                max_tokens: 1024,
                temperature: 0.7
            })
        });

        if (!groqResponse.ok) {
            const errorText = await groqResponse.text();
            console.error('GROQ API Error:', errorText);
            return res.status(groqResponse.status).json({
                error: 'Failed to get response from GROQ API',
                details: errorText
            });
        }

        const data = await groqResponse.json();
        if (!data.choices || !data.choices[0] || !data.choices[0].message) {
            return res.status(500).json({ error: 'Invalid response format from GROQ API' });
        }

        res.json({
            success: true,
            message: data.choices[0].message.content,
            usage: data.usage || null
        });
    } catch (error) {
        console.error('Server Error:', error);
        res.status(500).json({ error: 'Internal server error', message: error.message });
    }
});

app.get('/api/youtube/search', async (req, res) => {
    try {
        const rawQuery = (req.query.q || '').toString().trim();
        const requestedMax = Number(req.query.maxResults || 9);
        const maxResults = Number.isFinite(requestedMax)
            ? Math.min(15, Math.max(1, requestedMax))
            : 9;

        if (!rawQuery) {
            return res.status(400).json({ error: 'Query parameter `q` is required' });
        }

        if (!YOUTUBE_API_KEY) {
            return res.status(500).json({ error: 'YOUTUBE_API_KEY is missing from environment' });
        }

        const apiUrl = new URL(YOUTUBE_API_URL);
        apiUrl.searchParams.set('part', 'snippet');
        apiUrl.searchParams.set('type', 'video');
        apiUrl.searchParams.set('maxResults', String(maxResults));
        apiUrl.searchParams.set('q', rawQuery);
        apiUrl.searchParams.set('key', YOUTUBE_API_KEY);

        const ytResponse = await fetch(apiUrl.toString(), {
            method: 'GET',
            headers: { Accept: 'application/json' }
        });
        const data = await ytResponse.json();

        if (!ytResponse.ok || data.error) {
            return res.status(ytResponse.status || 502).json({
                error: 'Failed to fetch YouTube results',
                details: data?.error?.message || 'Unknown YouTube API error'
            });
        }

        const items = Array.isArray(data.items) ? data.items : [];
        return res.json({ success: true, items });
    } catch (error) {
        console.error('YouTube Search Error:', error);
        return res.status(500).json({ error: 'Internal server error', message: error.message });
    }
});

app.post('/api/youtube/connect/start', youtubeSensitiveRateLimit, async (req, res) => {
    try {
        if (!youtubeOAuthConfigured()) {
            return res.status(500).json({ error: 'YouTube OAuth is not configured on server' });
        }

        const userId = (req.body?.userId || '').toString().trim();
        if (!userId) {
            return res.status(400).json({ error: 'userId is required' });
        }

        const stateToken = crypto.randomBytes(24).toString('hex');
        const statePayload = {
            userId,
            createdAt: Date.now()
        };

        const states = await readJsonFile(YOUTUBE_AUTH_STATES_FILE, {});
        pruneExpiredOAuthStates(states);
        states[stateToken] = statePayload;
        await writeJsonFile(YOUTUBE_AUTH_STATES_FILE, states);

        const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
        authUrl.searchParams.set('client_id', YOUTUBE_CLIENT_ID);
        authUrl.searchParams.set('redirect_uri', YOUTUBE_OAUTH_REDIRECT_URI);
        authUrl.searchParams.set('response_type', 'code');
        authUrl.searchParams.set('access_type', 'offline');
        authUrl.searchParams.set('prompt', 'consent');
        authUrl.searchParams.set('scope', 'https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/youtube.readonly');
        authUrl.searchParams.set('state', stateToken);

        return res.json({ success: true, authUrl: authUrl.toString() });
    } catch (error) {
        console.error('YouTube OAuth Start Error:', error);
        return res.status(500).json({ error: 'Internal server error', message: error.message });
    }
});

app.get('/api/youtube/connect/callback', async (req, res) => {
    try {
        if (!youtubeOAuthConfigured()) {
            return res.status(500).send('YouTube OAuth is not configured on server');
        }

        const code = (req.query.code || '').toString();
        const stateToken = (req.query.state || '').toString();
        if (!code || !stateToken) {
            return res.status(400).send('Missing code or state');
        }

        const states = await readJsonFile(YOUTUBE_AUTH_STATES_FILE, {});
        const stateData = states[stateToken];
        if (!stateData || !stateData.userId) {
            return res.status(400).send('Invalid or expired state');
        }
        const isExpired = Date.now() - Number(stateData.createdAt || 0) > 10 * 60 * 1000;
        if (isExpired) {
            delete states[stateToken];
            await writeJsonFile(YOUTUBE_AUTH_STATES_FILE, states);
            return res.status(400).send('OAuth state expired');
        }

        const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: encodeFormBody({
                code,
                client_id: YOUTUBE_CLIENT_ID,
                client_secret: YOUTUBE_CLIENT_SECRET,
                redirect_uri: YOUTUBE_OAUTH_REDIRECT_URI,
                grant_type: 'authorization_code'
            })
        });
        const tokenData = await tokenResponse.json();
        if (!tokenResponse.ok || tokenData.error) {
            return res.status(tokenResponse.status || 500).send(tokenData?.error_description || 'Failed to exchange OAuth code');
        }

        const tokens = await readJsonFile(YOUTUBE_TOKENS_FILE, {});
        tokens[stateData.userId] = {
            accessToken: tokenData.access_token,
            refreshToken: tokenData.refresh_token || tokens[stateData.userId]?.refreshToken || '',
            expiresAt: Date.now() + (Number(tokenData.expires_in || 3600) * 1000),
            connectedAt: new Date().toISOString()
        };
        await writeJsonFile(YOUTUBE_TOKENS_FILE, tokens);

        delete states[stateToken];
        await writeJsonFile(YOUTUBE_AUTH_STATES_FILE, states);

        return res.send(`<!doctype html>
<html lang="ar" dir="rtl">
<head><meta charset="utf-8"/><title>YouTube Connected</title></head>
<body style="font-family:sans-serif;padding:2rem;text-align:center;">
<h2>✅ تم ربط حساب YouTube بنجاح</h2>
<p>يمكنك الآن إغلاق هذه النافذة والعودة للموقع.</p>
<script>
if (window.opener) {
  window.opener.postMessage({ type: 'youtube-connected', success: true }, '*');
}
setTimeout(() => window.close(), 1200);
</script>
</body>
</html>`);
    } catch (error) {
        console.error('YouTube OAuth Callback Error:', error);
        return res.status(500).send('Internal server error');
    }
});

app.get('/api/youtube/connect/status', async (req, res) => {
    try {
        const userId = (req.query.userId || '').toString().trim();
        if (!userId) {
            return res.status(400).json({ error: 'userId is required' });
        }
        const tokens = await readJsonFile(YOUTUBE_TOKENS_FILE, {});
        const token = tokens[userId];
        return res.json({
            success: true,
            connected: Boolean(token?.accessToken && token?.refreshToken),
            connectedAt: token?.connectedAt || null
        });
    } catch (error) {
        console.error('YouTube Status Error:', error);
        return res.status(500).json({ error: 'Internal server error', message: error.message });
    }
});

app.get('/api/youtube/my-videos', async (req, res) => {
    try {
        const userId = (req.query.userId || '').toString().trim();
        const maxResultsRaw = Number(req.query.maxResults || 8);
        const maxResults = Number.isFinite(maxResultsRaw) ? Math.min(15, Math.max(1, maxResultsRaw)) : 8;
        if (!userId) {
            return res.status(400).json({ error: 'userId is required' });
        }

        const accessToken = await getValidYouTubeAccessToken(userId);
        const apiUrl = new URL('https://www.googleapis.com/youtube/v3/search');
        apiUrl.searchParams.set('part', 'snippet');
        apiUrl.searchParams.set('forMine', 'true');
        apiUrl.searchParams.set('type', 'video');
        apiUrl.searchParams.set('order', 'date');
        apiUrl.searchParams.set('maxResults', String(maxResults));

        const ytResponse = await fetch(apiUrl.toString(), {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                Accept: 'application/json'
            }
        });
        const data = await ytResponse.json();
        if (!ytResponse.ok || data.error) {
            return res.status(ytResponse.status || 502).json({
                error: 'Failed to fetch your YouTube videos',
                details: data?.error?.message || 'Unknown YouTube API error'
            });
        }

        return res.json({
            success: true,
            items: Array.isArray(data.items) ? data.items : []
        });
    } catch (error) {
        console.error('YouTube My Videos Error:', error);
        return res.status(500).json({ error: error.message || 'Internal server error' });
    }
});

app.post('/api/youtube/upload', youtubeSensitiveRateLimit, async (req, res) => {
    try {
        const userId = (req.body?.userId || '').toString().trim();
        const title = (req.body?.title || '').toString().trim();
        const description = (req.body?.description || '').toString().trim();
        const privacyStatus = (req.body?.privacyStatus || 'unlisted').toString().trim();
        const mimeType = (req.body?.mimeType || '').toString().trim();
        const videoBase64 = (req.body?.videoBase64 || '').toString().trim();

        if (!userId || !title || !mimeType || !videoBase64) {
            return res.status(400).json({ error: 'userId, title, mimeType and videoBase64 are required' });
        }
        if (!mimeType.startsWith('video/')) {
            return res.status(400).json({ error: 'mimeType must be a video type' });
        }
        if (!['public', 'private', 'unlisted'].includes(privacyStatus)) {
            return res.status(400).json({ error: 'privacyStatus must be one of public/private/unlisted' });
        }

        const fileBuffer = Buffer.from(videoBase64, 'base64');
        const maxBytes = 25 * 1024 * 1024;
        if (!fileBuffer.length) {
            return res.status(400).json({ error: 'Uploaded file is empty' });
        }
        if (fileBuffer.length > maxBytes) {
            return res.status(413).json({ error: 'Video is too large. Max size is 25MB in current server setup' });
        }

        const accessToken = await getValidYouTubeAccessToken(userId);

        const uploadInitResponse = await fetch('https://www.googleapis.com/upload/youtube/v3/videos?part=snippet,status&uploadType=resumable', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json; charset=UTF-8',
                'X-Upload-Content-Length': String(fileBuffer.length),
                'X-Upload-Content-Type': mimeType
            },
            body: JSON.stringify({
                snippet: { title, description },
                status: { privacyStatus }
            })
        });

        const uploadUrl = uploadInitResponse.headers.get('location');
        if (!uploadInitResponse.ok || !uploadUrl) {
            const errText = await uploadInitResponse.text();
            return res.status(uploadInitResponse.status || 502).json({
                error: 'Failed to initiate YouTube upload',
                details: errText
            });
        }

        const uploadResponse = await fetch(uploadUrl, {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': mimeType,
                'Content-Length': String(fileBuffer.length)
            },
            body: fileBuffer
        });
        const uploadData = await uploadResponse.json();
        if (!uploadResponse.ok || uploadData.error) {
            return res.status(uploadResponse.status || 502).json({
                error: 'Failed to upload YouTube video',
                details: uploadData?.error?.message || 'Unknown YouTube API error'
            });
        }

        return res.json({
            success: true,
            videoId: uploadData.id,
            title: uploadData?.snippet?.title || title
        });
    } catch (error) {
        console.error('YouTube Upload Error:', error);
        return res.status(500).json({ error: 'Internal server error', message: error.message });
    }
});

app.use((err, req, res, next) => {
    console.error('Unhandled Error:', err);
    res.status(500).json({ error: 'Internal server error', message: err.message });
});

app.listen(PORT, () => {
    console.log(`
    ┌─────────────────────────────────────┐
    │  🚀 TawjihiGuide API Server Running │
    │  Server: http://localhost:${PORT}    │
    │  Chat:   /api/chat                  │
    │  YT:     /api/youtube/search        │
    │  YT OAuth:/api/youtube/connect/start│
    │  Push:   /api/subscribe             │
    │  Health: /api/health                │
    └─────────────────────────────────────┘
    `);
});

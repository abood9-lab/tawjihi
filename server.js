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

const app = express();
const PORT = process.env.PORT || 3001;
const GROQ_API_KEY = process.env.GROQ_API_KEY || '';
const GROQ_API_URL = process.env.GROQ_API_URL || 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || '';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || '';
const SUBSCRIPTIONS_FILE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'push-subscriptions.json');

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
    webpush.setVapidDetails('mailto:support@whiterchat.me', VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
}

app.use(cors());
app.use(express.json({ limit: '1mb' }));

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
    │  Push:   /api/subscribe             │
    │  Health: /api/health                │
    └─────────────────────────────────────┘
    `);
});

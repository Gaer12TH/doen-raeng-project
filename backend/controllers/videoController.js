const { spawn } = require('child_process');
const NodeCache = require('node-cache');
const path = require('path');
const fs = require('fs');

// Cache video metadata for 1 hour
const videoCache = new NodeCache({ stdTTL: 3600 });

// Handle Cookies
const cookiePath = path.join(__dirname, '../cookies.txt');
if (process.env.YOUTUBE_COOKIES) {
    try {
        fs.writeFileSync(cookiePath, process.env.YOUTUBE_COOKIES);
        console.log('✅ Cookies loaded from environment variable');
    } catch (err) {
        console.error('❌ Failed to write cookies:', err);
    }
}

// --- Strategies Definition ---
const STRATEGIES = [
    {
        name: 'Cookies (Verified)',
        condition: () => fs.existsSync(cookiePath),
        args: ['--cookies', cookiePath, '--force-ipv4']
    },
    {
        name: 'Android Client (No Cookies)',
        condition: () => true, // Always available
        args: ['--extractor-args', 'youtube:player_client=android', '--force-ipv4']
    },
    {
        name: 'Smart TV Client (No Cookies)',
        condition: () => true,
        args: ['--extractor-args', 'youtube:player_client=tv', '--force-ipv4']
    }
];

// --- Core Executor ---
const executeYtDlp = (url, strategyArgs) => {
    return new Promise((resolve, reject) => {
        const args = [
            url,
            '--dump-json',
            '--no-warnings',
            '--skip-download',
            '--geo-bypass',
            ...strategyArgs
        ];

        const process = spawn('yt-dlp', args);
        let stdoutData = '';
        let stderrData = '';

        process.stdout.on('data', d => stdoutData += d.toString());
        process.stderr.on('data', d => stderrData += d.toString());

        process.on('close', (code) => {
            if (code === 0) {
                try {
                    resolve(JSON.parse(stdoutData));
                } catch (e) {
                    reject(new Error('Failed to parse JSON'));
                }
            } else {
                reject(new Error(stderrData || 'Unknown Error'));
            }
        });
    });
};

// --- Smart Resolver with Retry ---
const resolveVideoData = async (url) => {
    let lastError = null;

    for (const strategy of STRATEGIES) {
        if (!strategy.condition()) continue;

        console.log(`Trying strategy: ${strategy.name}...`);
        try {
            const info = await executeYtDlp(url, strategy.args);
            console.log(`✅ Success with ${strategy.name}`);
            return { info, strategyArgs: strategy.args };
        } catch (error) {
            console.warn(`❌ Strategy ${strategy.name} failed: ${error.message}`);
            lastError = error;
            // Continue to next strategy...
        }
    }
    throw lastError || new Error('All strategies failed');
};

// --- Handlers ---

const getVideoInfo = async (req, res) => {
    try {
        const { url } = req.body;
        if (!url) return res.status(400).json({ error: 'URL is required' });

        // Check Cache
        const cachedData = videoCache.get(url);
        if (cachedData) return res.json(cachedData);

        // Fetch using Smart Resolver
        const { info } = await resolveVideoData(url);

        const videoData = {
            title: info.title,
            thumbnail: info.thumbnail,
            duration: convertDuration(info.duration),
            author: info.uploader,
            formats: ['mp3', 'mp4']
        };

        videoCache.set(url, videoData);
        res.json(videoData);

    } catch (error) {
        console.error('❌ Info Error:', error.message);
        res.status(500).json({ error: 'Backend Error', details: error.message });
    }
};

const downloadVideo = async (req, res) => {
    try {
        const { url, format } = req.query;
        if (!url) return res.status(400).send('Invalid URL');

        // 1. Resolve Info & Best Strategy FIRST
        let title = 'video';
        let workingStrategyArgs = [];

        try {
            const { info, strategyArgs } = await resolveVideoData(url);
            title = (info.title || 'video').replace(/[^\w\s-]/g, '');
            workingStrategyArgs = strategyArgs;
        } catch (e) {
            console.error('❌ Pre-download resolve failed:', e.message);
            // Fallback: Just try Android if resolve failed (unlikely to work but worth a shot)
            workingStrategyArgs = STRATEGIES[1].args;
        }

        res.header('Content-Disposition', `attachment; filename="${title}.${format}"`);

        // 2. Build Download Args using the same strategy
        const downloadArgs = [
            url,
            '--output', '-',
            '--no-warnings',
            '--geo-bypass',
            ...workingStrategyArgs
        ];

        if (format === 'mp3') {
            downloadArgs.push('--extract-audio', '--audio-format', 'mp3');
        } else {
            // Flexible format selection to avoid "Format not available"
            downloadArgs.push('--format', 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best');
        }

        const process = spawn('yt-dlp', downloadArgs);
        process.stdout.pipe(res);
        process.stderr.on('data', d => console.error('DL stderr:', d.toString()));

    } catch (error) {
        console.error('Download Error:', error);
        if (!res.headersSent) res.status(500).send('Download Failed');
    }
};

function convertDuration(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
}

module.exports = { getVideoInfo, downloadVideo };

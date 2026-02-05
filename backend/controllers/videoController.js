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

// Log yt-dlp version on start
const checkYtDlpVersion = () => {
    const process = spawn('yt-dlp', ['--version']);
    process.stdout.on('data', d => console.log('ℹ️ yt-dlp version:', d.toString().trim()));
};
checkYtDlpVersion();

// --- Stratฤด ๆegies Definition ---
const STRATEGIES = [
    {
        name: 'Cookies (Verified + Headers)',
        condition: () => fs.existsSync(cookiePath),
        args: [
            '--cookies', cookiePath,
            '--user-agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
            '--referer', 'https://www.youtube.com/',
            '--add-header', 'Accept-Language:en-US,en;q=0.9',
            '--add-header', 'Sec-Fetch-Mode:navigate',
            '--add-header', 'Sec-Fetch-Site:same-origin',
            '--add-header', 'Sec-Fetch-Dest:document'
        ]
    },
    {
        name: 'Android Creator (Robust)',
        condition: () => true,
        args: [
            '--extractor-args', 'youtube:player_client=android_creator',
            '--referer', 'https://www.youtube.com/'
        ]
    },
    {
        name: 'iOS Creator (Backup)',
        condition: () => true,
        args: [
            '--extractor-args', 'youtube:player_client=ios_creator',
            '--referer', 'https://www.youtube.com/'
        ]
    },
    {
        name: 'TV Client (Last Resort)',
        condition: () => true,
        args: [
            '--extractor-args', 'youtube:player_client=tv',
            '--referer', 'https://www.youtube.com/'
        ]
    }
];

// Helper: Sleep
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// --- Core Executor ---
const executeYtDlp = (url, strategyArgs) => {
    return new Promise((resolve, reject) => {
        const args = [
            url,
            '--dump-json',
            '--no-warnings',
            '--no-cache-dir', // Important for avoiding ban cache
            '--skip-download',
            '--geo-bypass',
            ...strategyArgs
        ];

        const process = spawn('yt-dlp', args);
        let stdoutData = '';
        let stderrData = '';

        process.stdout.on('data', d => stdoutData += d.toString());
        // Capture stderr but don't fail immediately, some warnings are normal
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
            console.warn(`❌ Strategy ${strategy.name} failed`);
            console.warn(`Reason: ${error.message.split('\n')[0]}`); // Log only first line of error
            lastError = error;

            // Wait before next retry to avoid hammering
            console.log('Waiting 2s before searching next strategy...');
            await delay(2000);
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
            formats: ['mp3', 'mp4'],
            resolutions: [...new Set(
                (info.formats || [])
                    .filter(f => f.height && f.vcodec !== 'none')
                    .map(f => f.height)
            )].sort((a, b) => b - a),
            audioBitrates: [320, 256, 192, 128] // Standard MP3 qualities
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
        const { url, format, quality, type } = req.query;
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
            // Default Fallback
            workingStrategyArgs = STRATEGIES[1].args;
        }

        res.header('Content-Disposition', `attachment; filename="${title}.${format}"`);

        // 2. Build Download Args using the same strategy
        const downloadArgs = [
            url,
            '--output', '-',
            '--no-warnings',
            '--no-cache-dir',
            '--geo-bypass',
            ...workingStrategyArgs
        ];

        // 3. Handle Quality/Format Logic
        if (type === 'audio') {
            downloadArgs.push('--extract-audio', '--audio-format', format);
            if (quality && quality !== 'best') {
                downloadArgs.push('--audio-quality', `${quality}K`);
            }
        } else {
            // Video Mode
            if (quality && quality !== 'best') {
                // Try to get specific height, fallback to best if that height fails (though UI should prevent this)
                downloadArgs.push('--format', `bestvideo[height=${quality}]+bestaudio/best[height=${quality}]/best`);
            } else {
                downloadArgs.push('--format', 'bestvideo+bestaudio/best');
            }
            // Ensure output container
            downloadArgs.push('--merge-output-format', format);
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

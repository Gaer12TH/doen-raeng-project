const { spawn } = require('child_process');
const NodeCache = require('node-cache');
const path = require('path');

// Cache video metadata for 1 hour
const videoCache = new NodeCache({ stdTTL: 3600 });

const runYtDlp = (url, args = []) => {
    return new Promise((resolve, reject) => {
        // Basic args to output json and avoid errors
        const defaultArgs = [
            url,
            '--dump-json',
            '--no-warnings',
            '--no-call-home',
            '--prefer-free-formats',
            '--skip-download',
            // Stealth
            '--user-agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
            '--referer', 'https://www.youtube.com/',
            '--geo-bypass'
        ];

        const process = spawn('yt-dlp', [...defaultArgs, ...args]);

        let stdoutData = '';
        let stderrData = '';

        process.stdout.on('data', (data) => {
            stdoutData += data.toString();
        });

        process.stderr.on('data', (data) => {
            stderrData += data.toString();
        });

        process.on('close', (code) => {
            if (code === 0) {
                try {
                    resolve(JSON.parse(stdoutData));
                } catch (e) {
                    reject(new Error('Failed to parse JSON: ' + stdoutData));
                }
            } else {
                reject(new Error(stderrData || 'Unknown yt-dlp error'));
            }
        });

        process.on('error', (err) => {
            reject(err);
        });
    });
};

const getVideoInfo = async (req, res, next) => {
    try {
        const { url } = req.body;
        if (!url) return res.status(400).json({ error: 'URL is required' });

        // Check Cache
        const cachedData = videoCache.get(url);
        if (cachedData) {
            return res.json(cachedData);
        }

        const output = await runYtDlp(url);

        const videoData = {
            title: output.title,
            thumbnail: output.thumbnail,
            duration: convertDuration(output.duration),
            author: output.uploader,
            formats: ['mp3', 'mp4']
        };

        videoCache.set(url, videoData);
        res.json(videoData);
    } catch (error) {
        console.error('❌ Info Error:', error.message);
        res.status(500).json({ error: 'Backend Error', details: error.message });
    }
};

const downloadVideo = async (req, res, next) => {
    try {
        const { url, format } = req.query;
        if (!url) return res.status(400).send('Invalid URL');

        // Get title first
        let title = 'video';
        try {
            const info = await runYtDlp(url);
            title = (info.title || 'video').replace(/[^\w\s-]/g, '');
        } catch (e) {
            console.error('Title fetch failed, using default');
        }

        res.header('Content-Disposition', `attachment; filename="${title}.${format}"`);

        const args = [
            url,
            '--output', '-', // Stdout
            '--no-warnings',
            '--no-call-home',
            '--user-agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        ];

        if (format === 'mp3') {
            args.push('--extract-audio', '--audio-format', 'mp3');
        } else {
            args.push('--format', 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best');
        }

        const process = spawn('yt-dlp', args);
        process.stdout.pipe(res);

        process.stderr.on('data', d => console.error('DL stderr:', d.toString()));

    } catch (error) {
        console.error('Download Error:', error);
        if (!res.headersSent) res.status(500).send('Download Failed');
    }
};

// Helper
function convertDuration(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
}

module.exports = {
    getVideoInfo,
    downloadVideo
};

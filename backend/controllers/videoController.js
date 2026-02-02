const ytDlp = require('yt-dlp-exec');
const NodeCache = require('node-cache');
const path = require('path');
const fs = require('fs');

// Cache video metadata for 1 hour
const videoCache = new NodeCache({ stdTTL: 3600 });

const getVideoInfo = async (req, res, next) => {
    try {
        const { url } = req.body;
        if (!url) {
            return res.status(400).json({ error: 'URL is required' });
        }

        // Check Cache
        const cachedData = videoCache.get(url);
        if (cachedData) {
            console.log('Serving from cache:', url);
            return res.json(cachedData);
        }

        // Fetch info using yt-dlp (dump-json)
        const output = await ytDlp(url, {
            dumpJson: true,
            noWarnings: true,
            noCallHome: true,
            preferFreeFormats: true,
            youtubeSkipDashManifest: true,
            // Stealth options to avoid 403s
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
            referer: 'https://www.youtube.com/',
            noPlaylist: true,
            geoBypass: true
        });

        const videoData = {
            title: output.title,
            thumbnail: output.thumbnail,
            duration: convertDuration(output.duration),
            author: output.uploader,
            formats: ['mp3', 'mp4']
        };

        // Save to Cache
        videoCache.set(url, videoData);

        res.json(videoData);
    } catch (error) {
        console.error('❌ Info Error:', error.message);
        if (error.stderr) console.error('🔴 yt-dlp stderr:', error.stderr);

        // Send detailed error to frontend for debugging (temporary)
        res.status(500).json({
            error: 'Backend Error',
            details: error.message,
            stderr: error.stderr || 'No stderr'
        });
        // next(new Error('Failed to fetch video info.'));
    }
};

const downloadVideo = async (req, res, next) => {
    try {
        const { url, format } = req.query;
        if (!url) return res.status(400).send('Invalid URL');

        // Get basic info for filename
        const output = await ytDlp(url, { dumpJson: true, noWarnings: true });
        const title = (output.title || 'video').replace(/[^\w\s-]/g, '');

        res.header('Content-Disposition', `attachment; filename="${title}.${format}"`);

        // Stream the content directly to response
        if (format === 'mp3') {
            // Audio Stream
            const process = ytDlp.exec(url, {
                extractAudio: true,
                audioFormat: 'mp3',
                output: '-' // Standard Output
            });
            process.stdout.pipe(res);
        } else {
            // Video Stream (Best MP4)
            const process = ytDlp.exec(url, {
                format: 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best',
                output: '-'
            });
            process.stdout.pipe(res);
        }

    } catch (error) {
        console.error('Download Error:', error);
        if (!res.headersSent) {
            res.status(500).send('Download Failed');
        }
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

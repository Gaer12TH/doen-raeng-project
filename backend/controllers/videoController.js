const ytdl = require('@distube/ytdl-core');
const NodeCache = require('node-cache');

// Cache video metadata for 1 hour to reduce YouTube API calls
const videoCache = new NodeCache({ stdTTL: 3600 });

// Add basic agent options to prevent 403s
const agentOptions = {
    requestOptions: {
        headers: {
            // Common User-Agent to mimic a real browser
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        }
    }
};

const getVideoInfo = async (req, res, next) => {
    try {
        const { url } = req.body;
        if (!url || !ytdl.validateURL(url)) {
            return res.status(400).json({ error: 'URL ไม่ถูกต้อง (Invalid URL)' });
        }

        // Check Cache
        const cachedData = videoCache.get(url);
        if (cachedData) {
            console.log('Serving from cache:', url);
            return res.json(cachedData);
        }

        const info = await ytdl.getInfo(url, agentOptions);
        const format = ytdl.chooseFormat(info.formats, { quality: 'highest' });

        // Extract relevant info
        const videoData = {
            title: info.videoDetails.title,
            thumbnail: info.videoDetails.thumbnails[info.videoDetails.thumbnails.length - 1].url, // Highest res
            duration: convertDuration(info.videoDetails.lengthSeconds),
            author: info.videoDetails.author.name,
            formats: ['mp3', 'mp4'] // Simple flag for UI
        };

        // Save to Cache
        videoCache.set(url, videoData);

        res.json(videoData);
    } catch (error) {
        console.error('Info Error:', error);
        next(new Error(`YouTube Error: ${error.message}`));
    }
};

const downloadVideo = async (req, res, next) => {
    try {
        const { url, format } = req.query;
        if (!url || !ytdl.validateURL(url)) {
            return res.status(400).send('Invalid URL');
        }

        const info = await ytdl.getInfo(url, agentOptions);
        const title = info.videoDetails.title.replace(/[^\w\s-]/g, ''); // Sanitize filename

        if (format === 'mp3') {
            res.header('Content-Disposition', `attachment; filename="${title}.mp3"`);
            ytdl(url, { ...agentOptions, quality: 'highestaudio', filter: 'audioonly' }).pipe(res);
        } else {
            // MP4 Default
            res.header('Content-Disposition', `attachment; filename="${title}.mp4"`);
            ytdl(url, { ...agentOptions, quality: 'highest', filter: 'audioandvideo' }).pipe(res);
        }
    } catch (error) {
        console.error('Download Error:', error);
        // If headers sent, end stream, else send json
        if (!res.headersSent) {
            res.status(500).send('Download Failed: ' + error.message);
        } else {
            res.end();
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

// Auto-detect: localhost for development, Render for production
const API_URL = import.meta.env.VITE_API_URL ||
    (window.location.hostname === 'localhost'
        ? 'http://localhost:3000/api'
        : 'https://wealthy-danna-gmanza-ee268219.koyeb.app/api');

export const getVideoInfo = async (url) => {
    try {
        const response = await fetch(`${API_URL}/info`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to fetch video info');
        }

        return await response.json();
    } catch (err) {
        throw err;
    }
};

export const getDownloadUrl = (url, format, type = 'video', quality = 'best') => {
    const params = new URLSearchParams({
        url,
        format,
        type,
        quality
    });
    return `${API_URL}/download?${params.toString()}`;
};

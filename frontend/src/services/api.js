const API_URL = 'http://localhost:3000/api';

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

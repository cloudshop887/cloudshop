import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'https://mrklocal.onrender.com/api',
    timeout: 10000, // 10 second timeout
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to attach the token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Add a response interceptor to handle errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle 401 Unauthorized errors (token expired or invalid)
        if (error.response && error.response.status === 401) {
            // Clear local storage
            localStorage.removeItem('token');
            localStorage.removeItem('userInfo');

            // Redirect to login page
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export const getDirectDriveLink = (url, size = 800) => {
    if (!url) return '';

    // If it's already a data URI or blob, return it
    if (url.startsWith('data:') || url.startsWith('blob:')) return url;

    // Handle Google Drive / Docs / Share links
    if (url.includes('drive.google.com') || url.includes('docs.google.com') || url.includes('share.google')) {
        // More comprehensive regex to catch IDs from various formats:
        // 1. /d/[ID]
        // 2. id=[ID]
        // 3. /images/[ID] (for share.google)
        const idMatch = url.match(/\/d\/([^/?]+)|id=([^&]+)|\/images\/([^/?]+)/);
        const id = idMatch ? (idMatch[1] || idMatch[2] || idMatch[3]) : null;

        if (id) {
            // Revert back to Google's thumbnail endpoint, as it successfully proxies embedded images
            // bypassing CORS and raw-file download limits.
            return `https://drive.google.com/thumbnail?id=${id}&sz=w${size}`;
        }
    }

    // Default: return the original URL if no transformations applied
    return url;
};

export default api;

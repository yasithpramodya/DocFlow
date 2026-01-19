import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Handle unauthorized (e.g., clear callback or redirect)
            // For now just reject
        }
        return Promise.reject(error);
    }
);

// Add token to requests if saved in localStorage (optional, if we were using LS instead of cookies for access token, 
// but we implemented cookie based logic in backend helper? 
// Wait, backend `sendTokenResponse` sends a token in JSON AND a cookie.
// Let's use the token from JSON for Authorization header as it's more standard for APIs unless we enforce strict cookie-only.
// The auth middleware checks `req.headers.authorization`.
// So we need to store token in memory or LS. Let's use LS for simplicity in this MVP.
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

export default api;

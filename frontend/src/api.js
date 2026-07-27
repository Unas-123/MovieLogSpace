import axios from 'axios';

const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

let refreshPromise = null;

function getStoredAuth() {
    return {
        token: localStorage.getItem('token'),
        refreshToken: localStorage.getItem('refreshToken'),
        username: localStorage.getItem('username'),
    };
}

export function setStoredAuth({ token, refreshToken, username }) {
    if (token) localStorage.setItem('token', token);
    if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
    if (username) localStorage.setItem('username', username);
}

export function clearStoredAuth() {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('username');
    localStorage.removeItem('shareId');
}

API.interceptors.request.use((config) => {
    const { token } = getStoredAuth();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

API.interceptors.response.use(
    (res) => res,
    async (error) => {
        const original = error.config;
        const status = error.response?.status;

        if (status === 401 && !original._retry && getStoredAuth().refreshToken) {
            original._retry = true;
            try {
                if (!refreshPromise) {
                    refreshPromise = API.post('/auth/refresh', {
                        refreshToken: getStoredAuth().refreshToken,
                    }).finally(() => {
                        refreshPromise = null;
                    });
                }
                const { data } = await refreshPromise;
                setStoredAuth(data);
                original.headers.Authorization = `Bearer ${data.token}`;
                return API(original);
            } catch {
                clearStoredAuth();
                window.dispatchEvent(new Event('auth:logout'));
            }
        }
        return Promise.reject(error);
    }
);

export async function checkBackendHealth() {
    try {
        const base = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '');
        const res = await axios.get(`${base}/api/health`, { timeout: 4000 });
        return res.data?.status?.includes('running');
    } catch {
        return false;
    }
}

export default API;

import axios, { type InternalAxiosRequestConfig, AxiosError } from "axios";
import { store } from "../redux/store"; // Import the Redux store
import { logout } from "../redux/slices/auth-slice/authSlice";

const API = axios.create({
    baseURL: import.meta.env.VITE_SERVER_API_URL || "https://final-year-project-9shd.onrender.com/api/v1",
});

// Request interceptor to add auth token dynamically
API.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        // Skip auth header for login/signup endpoints
        const publicEndpoints = ['/auth/login', '/auth/signup', '/auth/register'];
        const isPublicEndpoint = publicEndpoints.some(endpoint => 
            config.url?.includes(endpoint)
        );

        if (!isPublicEndpoint) {
            // Get token from Redux store
            const token = store.getState().auth.token || localStorage.getItem("token");

            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            } else {
                console.warn("No token found in Redux or localStorage for protected endpoint:", config.url);
            }
        }

        return config;
    },
    (error: AxiosError) => Promise.reject(error)
);

// Response interceptor to handle 401/403 errors
API.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        // Handle 401 Unauthorized or 403 Forbidden
        if (error.response?.status === 401 || error.response?.status === 403) {
            const url = error.config?.url || '';
            
            // Skip auto-logout for game session endpoints (handle errors gracefully in game components)
            const gameEndpoints = ['/game-session', '/research-session', '/game/'];
            const isGameEndpoint = gameEndpoints.some(endpoint => url.includes(endpoint));
            
            // Skip auto-logout if it's a mock token (starts with 'mock-token-')
            const token = store.getState().auth.token || localStorage.getItem("token");
            const isMockToken = token?.startsWith('mock-token-');
            
            // Only log out and redirect for non-game endpoints and non-mock tokens
            if (!isGameEndpoint && !isMockToken) {
                // Clear invalid token
                localStorage.removeItem("token");
                store.dispatch(logout());
                
                // Only redirect if not already on login page
                if (window.location.pathname !== '/login' && window.location.pathname !== '/signup') {
                    console.warn("Authentication failed. Redirecting to login...");
                    window.location.href = '/login';
                }
            } else {
                // For game endpoints or mock tokens, just log the error without logging out
                console.warn("API request failed (game endpoint or mock token):", url, error.response?.status);
            }
        }
        
        return Promise.reject(error);
    }
);

export default API;

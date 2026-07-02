// In development this falls back to your local backend automatically.
// In production (Vercel), set VITE_API_URL to your deployed Render backend URL + /api
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

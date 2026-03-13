import api from './axios';

// ── Auth ───────────────────────────────────────────────
export const registerUser = (data) => api.post('/auth/register', data);
export const loginUser    = (data) => api.post('/auth/login', data);
export const getMe        = ()     => api.get('/auth/me');

// ── Subscribers ────────────────────────────────────────
export const subscribeEmail   = (email) => api.post('/subscribers', { email });
export const unsubscribeEmail = (email) => api.delete('/subscribers/unsubscribe', { data: { email } });
export const getSubscribers   = ()      => api.get('/subscribers');

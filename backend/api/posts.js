// frontend/src/api/posts.js

import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const getAuthHeader = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
});

// Existing functions...
export const fetchPostBySlug = (slug) => axios.get(`${API_URL}/api/posts/slug/${slug}`);
export const createPost = (data) => axios.post(`${API_URL}/api/posts`, data, getAuthHeader());

// NEW: Fetch all series
export const fetchAllSeries = () => axios.get(`${API_URL}/api/posts/series/all`, getAuthHeader());

// NEW: Create new series
export const createSeries = (data) => axios.post(`${API_URL}/api/posts/series`, data, getAuthHeader());
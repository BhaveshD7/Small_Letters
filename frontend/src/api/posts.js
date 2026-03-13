import api from './axios';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Featured posts
export const fetchFeaturedPosts = () => {
  return axios.get(`${API_URL}/api/posts/featured`);
};

// Toggle featured status
export const toggleFeatured = (postId) => {
  return axios.post(`${API_URL}/api/posts/${postId}/toggle-featured`, {}, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
};

// All other exports using api instance
export const fetchPosts = (page = 1, limit = 10, type = '') =>
  api.get(`/posts?page=${page}&limit=${limit}${type ? `&type=${type}` : ''}`);

export const fetchPopularPosts = () => api.get('/posts/popular');
export const fetchAllSeries = () => api.get('/posts/series');
export const fetchSeriesPosts = (seriesSlug) => api.get(`/posts/series/${seriesSlug}`);
export const fetchPostBySlug = (slug) => api.get(`/posts/${slug}`);
export const createPost = (data) => api.post('/posts', data);
export const updatePost = (id, data) => api.put(`/posts/${id}`, data);
export const deletePost = (id) => api.delete(`/posts/${id}`);
export const likePost = (id) => api.post(`/posts/${id}/like`);
export const savePost = (id) => api.post(`/posts/${id}/save`);
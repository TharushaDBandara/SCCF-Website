// API Configuration
// For development: use localhost backend
// For production: use static JSON file from assets folder

const API_CONFIG = {
  // News API URL
  NEWS_API_URL: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5001/api/news'
    : 'assets/data/news.json', // Static JSON file in production
  
  // Admin API URL (only works on localhost)
  ADMIN_API_URL: 'http://localhost:5001/api/news',
  
  // Image base URL
  IMAGE_BASE_URL: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5001'
    : '' // Use relative paths in production (images in assets/uploads/news/)
};

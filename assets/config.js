// API Configuration
// For development: use localhost
// For production: use your actual domain or relative paths

const API_CONFIG = {
  // Change this to your production URL when deploying
  NEWS_API_URL: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5001/api/news'
    : '/api/news', // Will use the same domain in production
  
  ADMIN_API_URL: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5001/api/news'
    : '/api/news',
  
  // Image base URL
  IMAGE_BASE_URL: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5001'
    : '' // Use relative paths in production
};

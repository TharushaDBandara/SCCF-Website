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

// Projects display configuration (optional)
// - pinnedOrder: IDs listed here will always appear first, in the given order
// - categoryWeights: higher numbers appear first when other fields are equal
// - homepageLimit: how many projects to show on the homepage grid
// Note: All fields are optional; the site will fall back to existing order if not provided.
window.PROJECTS_CONFIG = {
  pinnedOrder: [
    // Example: 'election-law-awareness', 'human-rights-course-gampola'
  ],
  categoryWeights: {
    // Example weights; adjust or leave empty
    // 'Civic Engagement': 3,
    // 'Youth Empowerment': 2,
    // 'Community Development': 2,
    // 'Community Service': 1
  },
  homepageLimit: 6
};

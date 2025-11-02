// SCCF News Hub JavaScript

// Configuration - Uses config.js for API URLs
const NEWS_API_URL = typeof API_CONFIG !== 'undefined' ? API_CONFIG.NEWS_API_URL : 'http://localhost:5001/api/news';
const IMAGE_BASE_URL = typeof API_CONFIG !== 'undefined' ? API_CONFIG.IMAGE_BASE_URL : 'http://localhost:5001';
let allNews = [];
let currentPage = 1;
const newsPerPage = 9;
let currentCategory = 'all';

// Initialize news page
document.addEventListener('DOMContentLoaded', function() {
  loadNews();
  initializeFilters();
  initializeNewsletterForm();
});

// Load news from API
async function loadNews() {
  try {
    showLoading();
    const response = await fetch(NEWS_API_URL);
    
    if (!response.ok) {
      throw new Error('Failed to fetch news');
    }
    
    allNews = await response.json();
    
    // Sort by date (newest first)
    allNews.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    displayFeaturedNews();
    displayNews();
    hideLoading();
  } catch (error) {
    console.error('Error loading news:', error);
    showError('Unable to load news. Please try again later.');
  }
}

// Display featured news (most recent)
function displayFeaturedNews() {
  const featuredContainer = document.getElementById('featured-news');
  
  if (!featuredContainer || allNews.length === 0) {
    return;
  }
  
  const featuredNews = allNews[0]; // Most recent news
  
  featuredContainer.innerHTML = `
    <div class="featured-news-card" onclick="openNewsDetail('${featuredNews.id}')" style="cursor: pointer;">
      <div class="featured-news-image">
        <span class="featured-badge">Featured</span>
        <img src="${IMAGE_BASE_URL}${featuredNews.image || 'assets/images/placeholder-news.jpg'}" 
             alt="${featuredNews.title}"
             onerror="this.src='https://picsum.photos/800/600?random=1'">
      </div>
      <div class="featured-news-content">
        <div class="news-meta">
          <span class="news-category">${featuredNews.category}</span>
          <span class="news-date">${formatDate(featuredNews.date)}</span>
        </div>
        <h2>${featuredNews.title}</h2>
        <p>${featuredNews.excerpt || truncateText(featuredNews.content, 200)}</p>
        <a href="#" class="read-more-btn" onclick="event.stopPropagation(); openNewsDetail('${featuredNews.id}'); return false;">
          Read Full Story
        </a>
      </div>
    </div>
  `;
}

// Display news grid
function displayNews() {
  const newsGrid = document.getElementById('news-grid');
  
  if (!newsGrid) return;
  
  // Filter news by category
  let filteredNews = currentCategory === 'all' 
    ? allNews.slice(1) // Skip first one (featured)
    : allNews.filter(news => news.category.toLowerCase() === currentCategory.toLowerCase());
  
  // Paginate news
  const startIndex = 0;
  const endIndex = currentPage * newsPerPage;
  const newsToDisplay = filteredNews.slice(startIndex, endIndex);
  
  if (newsToDisplay.length === 0) {
    newsGrid.innerHTML = `
      <div class="empty-state" style="grid-column: 1/-1;">
        <h3>No news found</h3>
        <p>There are no articles in this category yet. Check back soon!</p>
      </div>
    `;
    document.getElementById('load-more-btn').style.display = 'none';
    return;
  }
  
  newsGrid.innerHTML = newsToDisplay.map(news => `
    <div class="news-card" data-category="${news.category.toLowerCase()}">
      <div class="news-card-image">
        <span class="news-card-category">${news.category}</span>
        <img src="${IMAGE_BASE_URL}${news.image || 'assets/images/placeholder-news.jpg'}" 
             alt="${news.title}"
             onerror="this.src='https://picsum.photos/400/300?random=' + Math.random()">
      </div>
      <div class="news-card-content">
        <div class="news-card-date">${formatDate(news.date)}</div>
        <h3>${news.title}</h3>
        <p class="news-card-excerpt">${news.excerpt || truncateText(news.content, 150)}</p>
        <div class="news-card-footer">
          <span class="news-card-author">${news.author || 'SCCF Team'}</span>
          <a href="#" class="news-card-link" onclick="openNewsDetail('${news.id}'); return false;">
            Read More
          </a>
        </div>
      </div>
    </div>
  `).join('');
  
  // Update load more button
  const loadMoreBtn = document.getElementById('load-more-btn');
  if (endIndex >= filteredNews.length) {
    loadMoreBtn.style.display = 'none';
  } else {
    loadMoreBtn.style.display = 'block';
  }
}

// Initialize category filters
function initializeFilters() {
  const filterButtons = document.querySelectorAll('.filter-btn');
  const loadMoreBtn = document.getElementById('load-more-btn');
  
  filterButtons.forEach(button => {
    button.addEventListener('click', function() {
      // Remove active class from all buttons
      filterButtons.forEach(btn => btn.classList.remove('active'));
      
      // Add active class to clicked button
      this.classList.add('active');
      
      // Update current category
      currentCategory = this.getAttribute('data-category');
      
      // Reset pagination
      currentPage = 1;
      
      // Display filtered news
      displayNews();
    });
  });
  
  // Load more button
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', function() {
      currentPage++;
      displayNews();
    });
  }
}

// Initialize newsletter form
function initializeNewsletterForm() {
  const newsletterForm = document.querySelector('.newsletter-form');
  
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const emailInput = this.querySelector('input[type="email"]');
      const email = emailInput.value;
      
      // Simple validation
      if (email && validateEmail(email)) {
        // Here you would normally send to a backend
        alert('Thank you for subscribing! You will receive updates at ' + email);
        emailInput.value = '';
      } else {
        alert('Please enter a valid email address.');
      }
    });
  }
}

// Open news detail in modal
function openNewsDetail(newsId) {
  const news = allNews.find(n => n.id === newsId);
  
  if (!news) return;
  
  // Prepare additional images HTML
  let additionalImagesHTML = '';
  if (news.images && Array.isArray(news.images) && news.images.length > 0) {
    additionalImagesHTML = `
      <div class="news-image-gallery">
        <h3>More Images</h3>
        <div class="news-gallery-grid">
          ${news.images.map(img => `
            <div class="news-gallery-item">
              <img src="${IMAGE_BASE_URL}${img}" alt="Gallery image" onerror="this.src='https://picsum.photos/400/300?random=' + Math.random()">
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }
  
  // Create modal
  const modal = document.createElement('div');
  modal.className = 'news-modal';
  modal.innerHTML = `
    <div class="news-modal-overlay" onclick="closeNewsModal()"></div>
    <div class="news-modal-content">
      <button class="news-modal-close" onclick="closeNewsModal()" aria-label="Close">&times;</button>
      <div class="news-modal-header">
        <img src="${IMAGE_BASE_URL}${news.image || 'assets/images/placeholder-news.jpg'}" 
             alt="${news.title}"
             onerror="this.src='https://picsum.photos/1200/600?random=1'">
      </div>
      <div class="news-modal-body">
        <div class="news-meta">
          <span class="news-category">${news.category}</span>
          <span class="news-date">${formatDate(news.date)}</span>
        </div>
        <h1>${news.title}</h1>
        <div class="news-author-info">
          <span>By ${news.author || 'SCCF Team'}</span>
        </div>
        <div class="news-full-content">
          ${news.content.replace(/\n/g, '<br><br>')}
        </div>
        ${additionalImagesHTML}
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  document.body.style.overflow = 'hidden';
  
  // Animate in
  setTimeout(() => modal.classList.add('active'), 10);
}

// Close news modal
function closeNewsModal() {
  const modal = document.querySelector('.news-modal');
  if (modal) {
    modal.classList.remove('active');
    setTimeout(() => {
      modal.remove();
      document.body.style.overflow = '';
    }, 300);
  }
}

// Utility Functions

function formatDate(dateString) {
  const date = new Date(dateString);
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
}

function truncateText(text, maxLength) {
  if (text.length <= maxLength) return text;
  return text.substr(0, maxLength).trim() + '...';
}

function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function showLoading() {
  const newsGrid = document.getElementById('news-grid');
  const featuredNews = document.getElementById('featured-news');
  
  if (newsGrid) {
    newsGrid.innerHTML = '<div class="loading" style="grid-column: 1/-1;">Loading news</div>';
  }
  
  if (featuredNews) {
    featuredNews.innerHTML = '<div class="loading">Loading featured news</div>';
  }
}

function hideLoading() {
  // Loading messages will be replaced by actual content
}

function showError(message) {
  const newsGrid = document.getElementById('news-grid');
  const featuredNews = document.getElementById('featured-news');
  
  const errorHTML = `
    <div class="empty-state" style="grid-column: 1/-1;">
      <h3>⚠️ Error</h3>
      <p>${message}</p>
    </div>
  `;
  
  if (newsGrid) {
    newsGrid.innerHTML = errorHTML;
  }
  
  if (featuredNews) {
    featuredNews.innerHTML = '';
  }
  
  document.getElementById('load-more-btn').style.display = 'none';
}

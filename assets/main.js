// Enhanced Responsive Navigation for Modern SCCF Website
// Enhanced error handling and null checks
const navToggle = document.querySelector('.nav-toggle');
const navContent = document.querySelector('.nav-content');
const navMenu = document.getElementById('nav-menu');
const navbar = document.querySelector('.navbar');
const header = document.querySelector('header');

// Navbar scroll behavior with error handling
let lastScrollTop = 0;
let scrollTimer = null;

function handleScroll() {
  try {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    // Add scrolled class when scrolled down
    if (scrollTop > 50) {
      header?.classList.add('scrolled');
    } else {
      header?.classList.remove('scrolled');
    }
    
    // Show/hide navbar based on scroll direction
    if (scrollTop > lastScrollTop && scrollTop > 100) {
      // Scrolling down - hide navbar
      header?.classList.add('hidden');
      header?.classList.remove('visible');
    } else {
      // Scrolling up - show navbar
      header?.classList.remove('hidden');
      header?.classList.add('visible');
    }
    
    lastScrollTop = scrollTop <= 0 ? 0 : scrollTop; // For Mobile or negative scrolling
  } catch (error) {
    console.warn('Error in handleScroll:', error);
  }
}

// Throttled scroll event with error handling
function throttledScroll() {
  if (scrollTimer) return;
  
  scrollTimer = setTimeout(() => {
    try {
      handleScroll();
    } catch (error) {
      console.warn('Error in throttledScroll:', error);
    } finally {
      scrollTimer = null;
    }
  }, 10);
}

// Add scroll event listener with error handling
if (window && header) {
  window.addEventListener('scroll', throttledScroll, { passive: true });
  // Initialize header state
  header.classList.add('visible');
}

// Language switching functionality
const langButtons = document.querySelectorAll('.lang-btn');

// Set default language
let currentLanguage = 'en';

// Language switching function
function switchLanguage(lang) {
  currentLanguage = lang;
  
  // Update all translatable elements
  // Re-query elements to include any dynamically injected content
  const elementsToTranslate = document.querySelectorAll('[data-en]');
  elementsToTranslate.forEach(element => {
    const translation = element.getAttribute(`data-${lang}`);
    if (translation) {
      element.textContent = translation;
    }
  });
  
  // Update active language button
  langButtons.forEach(btn => {
    btn.classList.remove('active');
    if (btn.getAttribute('data-lang') === lang) {
      btn.classList.add('active');
    }
  });
  
  // Store language preference
  localStorage.setItem('preferredLanguage', lang);

  // Re-apply adaptive title sizing after language updates (titles may change length)
  try {
    applyAdaptiveTitleSizes && applyAdaptiveTitleSizes('.project-overlay-content h3, .gallery-info h4');
  } catch {}
}

// Add event listeners to language buttons
langButtons.forEach(button => {
  button.addEventListener('click', () => {
    const lang = button.getAttribute('data-lang');
    switchLanguage(lang);
  });
});

// Load saved language preference or default to English
const savedLanguage = localStorage.getItem('preferredLanguage') || 'en';
switchLanguage(savedLanguage);

// Ensure elements exist before adding event listeners
if (navToggle && navContent) {
  // Mobile navigation toggle with enhanced animations
  navToggle.addEventListener('click', function () {
    const expanded = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', !expanded);
    navContent.classList.toggle('active');
    
    // Add body scroll lock when menu is open
    if (!expanded) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  });
  
  // Close menu when clicking outside
  document.addEventListener('click', function(e) {
    if (!navToggle.contains(e.target) && !navContent.contains(e.target)) {
      navContent.classList.remove('active');
      navToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  });
  
  // Enhanced keyboard navigation
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && navContent.classList.contains('active')) {
      navContent.classList.remove('active');
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.focus();
      document.body.style.overflow = '';
    }
  });
}

// Smooth scrolling with offset for sticky header - Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
  let isManualClick = false;
  
  // Function to update active navigation link
  function updateActiveNavLink(targetId) {
    const navLinks = document.querySelectorAll('.nav-menu a');
    navLinks.forEach(link => {
      link.classList.remove('active');
    });
    const activeLink = document.querySelector(`.nav-menu a[href="${targetId}"]`);
    if (activeLink) {
      activeLink.classList.add('active');
    }
  }
  
  // Smooth scrolling for navigation links
  const navLinks = document.querySelectorAll('a[href^="#"]');
  
  navLinks.forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      isManualClick = true;
      const targetId = this.getAttribute('href');
      const target = document.querySelector(targetId);
      
      if (target) {
        const headerHeight = navbar ? navbar.offsetHeight : 80;
        const targetPosition = target.offsetTop - headerHeight - 20;
        
        window.scrollTo({
          top: Math.max(0, targetPosition),
          behavior: 'smooth'
        });
        
        // Close mobile menu if open
        if (navContent) {
          navContent.classList.remove('active');
        }
        if (navToggle) {
          navToggle.setAttribute('aria-expanded', 'false');
        }
        document.body.style.overflow = '';
        
        // Update active nav link immediately
        updateActiveNavLink(targetId);
        
        // Reset manual click flag after scroll completes
        setTimeout(() => {
          isManualClick = false;
        }, 1000);
      }
    });
  });
  
  // Update active nav on scroll (only if not a manual click)
  function updateNavOnScroll() {
    if (isManualClick) return; // Don't update if user just clicked a nav link
    
    const sections = document.querySelectorAll('section[id]');
    const scrollPosition = window.scrollY + 150; // Increased offset for better detection
    let currentSection = '';
    
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute('id');
      
      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        currentSection = `#${sectionId}`;
      }
    });
    
    if (currentSection) {
      updateActiveNavLink(currentSection);
    }
  }
  
  // Modern navbar scroll effect - Removed to allow CSS glass effect
  let scrollTimeout;
  window.addEventListener('scroll', () => {
    // Clear timeout to prevent excessive function calls
    if (scrollTimeout) {
      clearTimeout(scrollTimeout);
    }
    
    scrollTimeout = setTimeout(() => {
      // Update active nav link on scroll
      updateNavOnScroll();
    }, 10);
  });
  
  // Initialize with home section active only on index page
  const currentPage = window.location.pathname;
  if (currentPage === '/' || currentPage.includes('index.html') || currentPage === '') {
    updateActiveNavLink('#home');
  } else {
    // Remove all active states on non-index pages
    const navLinks = document.querySelectorAll('.nav-menu a');
    navLinks.forEach(link => link.classList.remove('active'));
  }
});



// Modern form handling with improved error handling
function showModernAlert(message, type = 'success') {
  const notification = document.createElement('div');
  const bgColor = type === 'error' ? 'linear-gradient(135deg, #ef4444, #dc2626)' : 'linear-gradient(135deg, #10b981, #059669)';
  
  notification.style.cssText = `
    position: fixed; top: 20px; right: 20px; z-index: 9999;
    background: ${bgColor};
    color: white; padding: 1rem 1.5rem; border-radius: 12px;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    transform: translateX(400px); transition: transform 0.3s ease;
    max-width: 400px; font-weight: 600;
  `;
  notification.textContent = message;
  document.body.appendChild(notification);
  
  setTimeout(() => notification.style.transform = 'translateX(0)', 100);
  setTimeout(() => {
    notification.style.transform = 'translateX(400px)';
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 300);
  }, 4000);
}

// Enhanced form validation and handling
function validateForm(form) {
  const requiredFields = form.querySelectorAll('[required]');
  let isValid = true;
  
  requiredFields.forEach(field => {
    if (!field.value.trim()) {
      field.classList.add('error');
      isValid = false;
    } else {
      field.classList.remove('error');
    }
  });
  
  // Email validation
  const emailFields = form.querySelectorAll('input[type="email"]');
  emailFields.forEach(field => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (field.value && !emailRegex.test(field.value)) {
      field.classList.add('error');
      isValid = false;
    }
  });
  
  return isValid;
}

// Improved form event handlers with validation
const volunteerForm = document.querySelector('.volunteer-form');
if (volunteerForm) {
  volunteerForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    if (validateForm(this)) {
      showModernAlert('Thank you for your interest in volunteering! We will contact you soon.');
      this.reset();
    } else {
      showModernAlert('Please fill in all required fields correctly.', 'error');
    }
  });
}

const contactForm = document.querySelector('.contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    if (validateForm(this)) {
      showModernAlert('Thank you for your message! We will get back to you soon.');
      this.reset();
    } else {
      showModernAlert('Please fill in all required fields correctly.', 'error');
    }
  });
}

// Modern scroll animations
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -80px 0px' });

document.addEventListener('DOMContentLoaded', () => {
  const animateElements = document.querySelectorAll('.section, .project-card, .team-member');
  
  animateElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
    observer.observe(el);
  });
  

});

// Scroll to top button
const scrollBtn = document.createElement('button');
scrollBtn.innerHTML = '↑';
scrollBtn.style.cssText = `
  position: fixed; bottom: 30px; right: 30px; width: 50px; height: 50px;
  border-radius: 50%; border: none; cursor: pointer; z-index: 1000;
  background: linear-gradient(135deg, #06b6d4, #0891b2); color: white;
  font-size: 1.5rem; opacity: 0; transform: translateY(100px);
  transition: all 0.3s ease; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
`;
scrollBtn.setAttribute('aria-label', 'Scroll to top');
document.body.appendChild(scrollBtn);

window.addEventListener('scroll', () => {
  if (window.scrollY > 500) {
    scrollBtn.style.opacity = '1';
    scrollBtn.style.transform = 'translateY(0)';
  } else {
    scrollBtn.style.opacity = '0';
    scrollBtn.style.transform = 'translateY(100px)';
  }
});

scrollBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

// Photo Gallery Filter Functionality
document.addEventListener('DOMContentLoaded', function() {
  const filterButtons = document.querySelectorAll('.filter-btn');
  const galleryItems = document.querySelectorAll('.gallery-item');
  
  if (filterButtons.length > 0 && galleryItems.length > 0) {
    filterButtons.forEach(button => {
      button.addEventListener('click', function() {
        // Remove active class from all buttons
        filterButtons.forEach(btn => btn.classList.remove('active'));
        // Add active class to clicked button
        this.classList.add('active');
        
        const filterValue = this.getAttribute('data-filter');
        
        galleryItems.forEach(item => {
          const itemCategory = item.getAttribute('data-category');
          
          if (filterValue === 'all' || itemCategory === filterValue) {
            item.classList.remove('hidden');
            item.style.display = 'block';
          } else {
            item.classList.add('hidden');
            setTimeout(() => {
              if (item.classList.contains('hidden')) {
                item.style.display = 'none';
              }
            }, 300);
          }
        });
      });
    });
  }
  
  // Gallery item click to show larger view (optional enhancement)
  galleryItems.forEach(item => {
    item.addEventListener('click', function() {
      // You can add lightbox functionality here
      console.log('Gallery item clicked:', this.getAttribute('data-category'));
    });
  });
});

// Dynamic Image Grid Shuffling System
class HeroImageManager {
  constructor() {
    this.imageFolders = {
      'community-development': [],
      'education': [],
      'healthcare': [],
      'environment': [],
      'empowerment': []
    };
    
    this.gridItems = {
      'main-image': 'education',        // Use education for main until community-development has images
      'secondary-image': 'education',
      'accent-image': 'education',      // Use education until healthcare has images
      'feature-image': 'education',     // Use education until environment has images
      'small-image': 'education'        // Use education until empowerment has images
    };
    
    this.shuffleInterval = 30000; // 30 seconds
    this.currentImageIndex = {};
    
    this.init();
  }
  
  // Initialize the image manager
  init() {
    this.setupImageArrays();
    this.reassignGridItems(); // Set up proper grid assignments
    this.loadInitialImages();
    this.startImageRotation();
  }
  
  // Setup image arrays with actual files available
  setupImageArrays() {
    // Education images - using actual files in folder
    this.imageFolders['education'] = [
      'assets/images/education/e1.jpg',
      'assets/images/education/e2.jpg',
      'assets/images/education/e3.jpg',
      'assets/images/education/e4.jpg'
    ];
    
    // Other folders currently empty - will use fallbacks
    this.imageFolders['community-development'] = [];
    this.imageFolders['healthcare'] = [];
    this.imageFolders['environment'] = [];
    this.imageFolders['empowerment'] = [];
    
    // Initialize current image index for each category
    Object.keys(this.imageFolders).forEach(category => {
      this.currentImageIndex[category] = 0;
    });
  }
  
  // Load initial images
  loadInitialImages() {
    console.log('Loading initial images with assignments:', this.gridItems);
    Object.keys(this.gridItems).forEach(gridClass => {
      const category = this.gridItems[gridClass];
      console.log(`Loading ${gridClass} with category ${category}, available images:`, this.imageFolders[category].length);
      this.updateGridItemImage(gridClass, category);
    });
  }
  
  // Update a specific grid item with a new image
  updateGridItemImage(gridClass, category) {
    const gridItem = document.querySelector(`.${gridClass}`);
    if (!gridItem) return;
    
    const img = gridItem.querySelector('img');
    if (!img) return;
    
    const images = this.imageFolders[category];
    
    // If no images in folder, use fallback immediately
    if (images.length === 0) {
      this.useFallbackImage(img, category);
      return;
    }
    
    // Get current index and increment for next time
    let currentIndex = this.currentImageIndex[category];
    const imagePath = images[currentIndex];
    
    // Create a new image element to test if it loads
    const testImg = new Image();
    testImg.onload = () => {
      // Image loads successfully, update the src
      img.src = imagePath;
    };
    testImg.onerror = () => {
      // Image failed to load, use fallback
      console.warn(`Failed to load image: ${imagePath}`);
      this.useFallbackImage(img, category);
    };
    testImg.src = imagePath;
    
    // Update index for next rotation
    this.currentImageIndex[category] = (currentIndex + 1) % images.length;
  }
  
  // Use fallback image when original fails to load
  useFallbackImage(imgElement, category) {
    const fallbackImages = {
      'community-development': 'https://picsum.photos/600/400?random=101&t=' + Date.now(),
      'education': 'https://picsum.photos/300/300?random=102&t=' + Date.now(),
      'healthcare': 'https://picsum.photos/300/200?random=103&t=' + Date.now(),
      'environment': 'https://picsum.photos/300/250?random=104&t=' + Date.now(),
      'empowerment': 'https://picsum.photos/250/200?random=105&t=' + Date.now()
    };
    
    console.log(`Using fallback image for ${category}`);
    imgElement.src = fallbackImages[category] || 'https://picsum.photos/400/300?random=110&t=' + Date.now();
  }
  
  // Start automatic image rotation
  startImageRotation() {
    setInterval(() => {
      this.rotateAllImages();
    }, this.shuffleInterval);
  }
  
  // Rotate all images in the grid
  rotateAllImages() {
    Object.keys(this.gridItems).forEach(gridClass => {
      const category = this.gridItems[gridClass];
      this.updateGridItemImage(gridClass, category);
    });
  }
  
  // Manual shuffle trigger
  shuffleImages() {
    this.rotateAllImages();
  }
  
  // Add images to a specific category dynamically
  addImages(category, imageArray) {
    if (this.imageFolders[category]) {
      this.imageFolders[category] = [...this.imageFolders[category], ...imageArray];
    }
  }
  
  // Replace all images in a category
  replaceImages(category, imageArray) {
    if (this.imageFolders[category]) {
      this.imageFolders[category] = imageArray;
      this.currentImageIndex[category] = 0;
      
      // Auto-reassign grid items when new images are added
      this.reassignGridItems();
    }
  }
  
  // Reassign grid items based on available images
  reassignGridItems() {
    const originalAssignments = {
      'main-image': 'community-development',
      'secondary-image': 'education',
      'accent-image': 'healthcare',
      'feature-image': 'environment',
      'small-image': 'empowerment'
    };
    
    // Reset to original assignments
    this.gridItems = { ...originalAssignments };
    
    // If a category has no images, use education as fallback
    Object.keys(this.gridItems).forEach(gridClass => {
      const category = this.gridItems[gridClass];
      if (this.imageFolders[category].length === 0) {
        this.gridItems[gridClass] = 'education';
      }
    });
  }
  
  // Auto-detect images in a folder (helper function for development)
  async autoDetectImages(category, baseNames) {
    const detectedImages = [];
    const extensions = ['jpg', 'jpeg', 'png', 'webp'];
    
    for (const baseName of baseNames) {
      for (const ext of extensions) {
        const imagePath = `assets/images/${category}/${baseName}.${ext}`;
        try {
          const img = new Image();
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            img.src = imagePath;
          });
          detectedImages.push(imagePath);
          break; // Found working extension, move to next base name
        } catch (e) {
          // Continue to next extension
        }
      }
    }
    
    if (detectedImages.length > 0) {
      this.replaceImages(category, detectedImages);
    }
    
    return detectedImages;
  }
  
  // Set shuffle interval
  setShuffleInterval(milliseconds) {
    this.shuffleInterval = milliseconds;
  }
}

// Initialize the image manager when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Only initialize if hero image grid exists
  if (document.querySelector('.hero-image-grid')) {
    window.heroImageManager = new HeroImageManager();
    
    // Add manual shuffle button (optional)
    const shuffleButton = document.createElement('button');
    shuffleButton.textContent = '🔄 Shuffle Images';
    shuffleButton.className = 'btn btn-secondary shuffle-btn';
    shuffleButton.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 1000;
      font-size: 0.8rem;
      padding: 0.5rem 1rem;
      opacity: 0.8;
    `;
    
    shuffleButton.addEventListener('click', () => {
      window.heroImageManager.shuffleImages();
    });
    
    // Only add shuffle button in development/testing
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      document.body.appendChild(shuffleButton);
    }
  }
});

// Expose methods for external use
window.addImagesToCategory = function(category, images) {
  if (window.heroImageManager) {
    window.heroImageManager.addImages(category, images);
  }
};

window.replaceImagesInCategory = function(category, images) {
  if (window.heroImageManager) {
    window.heroImageManager.replaceImages(category, images);
  }
};

window.manualShuffle = function() {
  if (window.heroImageManager) {
    window.heroImageManager.shuffleImages();
  }
};

window.setShuffleInterval = function(seconds) {
  if (window.heroImageManager) {
    window.heroImageManager.setShuffleInterval(seconds * 1000);
  }
};

// Helper function to update images when you add them to folders
window.updateCategoryImages = function(category, imageNames) {
  if (window.heroImageManager) {
    const imagePaths = imageNames.map(name => `assets/images/${category}/${name}`);
    window.heroImageManager.replaceImages(category, imagePaths);
    window.heroImageManager.shuffleImages(); // Immediately show the new images
  }
};

// Quick update function for education folder (example)
window.updateEducationImages = function() {
  window.updateCategoryImages('education', ['e1.jpg', 'e2.jpg', 'e3.jpg', 'e4.jpg']);
};

// Quick setup functions for other categories (call these when you add images)
window.setupCommunityImages = function(imageNames) {
  window.updateCategoryImages('community-development', imageNames);
};

window.setupHealthcareImages = function(imageNames) {
  window.updateCategoryImages('healthcare', imageNames);
};

window.setupEnvironmentImages = function(imageNames) {
  window.updateCategoryImages('environment', imageNames);
};

window.setupEmpowermentImages = function(imageNames) {
  window.updateCategoryImages('empowerment', imageNames);
};

// Debug function to check current status
window.checkImageStatus = function() {
  if (window.heroImageManager) {
    console.log('=== IMAGE STATUS ===');
    console.log('Grid assignments:', window.heroImageManager.gridItems);
    Object.keys(window.heroImageManager.imageFolders).forEach(category => {
      const images = window.heroImageManager.imageFolders[category];
      console.log(`${category}: ${images.length} images`, images);
    });
  }
};

// Enhanced Contact Form Handler
document.addEventListener('DOMContentLoaded', function() {
  // Footer Programs quick-filter: clicking a program in footer jumps to Gallery and applies filter
  const programLinks = document.querySelectorAll('a.program-link[data-filter]');
  if (programLinks.length) {
    programLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        const targetFilter = link.getAttribute('data-filter');
        // Allow anchor to navigate to #gallery first, then apply filter shortly after
        setTimeout(() => {
          const btn = document.querySelector(`.gallery-filters .filter-btn[data-filter="${targetFilter}"]`);
          if (btn) btn.click();
        }, 50);
      });
    });
  }

  const contactForm = document.getElementById('contact-form');
  
  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Get form data
      const formData = new FormData(contactForm);
      const name = formData.get('name');
      const email = formData.get('email');
      const phone = formData.get('phone') || 'Not provided';
      const subject = formData.get('subject');
      const message = formData.get('message');
      
      // Format email content
      const emailSubject = `SCCF Contact: ${subject}`;
      const emailBody = `Hello SCCF Team,

New message from your website contact form:

Name: ${name}
Email: ${email}
Phone: ${phone}
Subject: ${subject}

Message:
${message}

---
This message was sent from the SCCF website contact form.
Please reply directly to: ${email}`;
      
      // Create mailto link with formatted content
  const mailtoLink = `mailto:sccf.lk@gmail.com?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
      
      // Open email client
      window.location.href = mailtoLink;
      
      // Show success message
  showFormMessage('Thank you for your message! Your email client should open shortly. If it doesn\'t, please copy the information and send it manually to sccf.lk@gmail.com', 'success');
      
      // Reset form after a delay
      setTimeout(() => {
        contactForm.reset();
      }, 1000);
    });
  }
  
  // Function to show form messages
  function showFormMessage(message, type) {
    // Remove existing message if any
    const existingMessage = document.querySelector('.form-message');
    if (existingMessage) {
      existingMessage.remove();
    }
    
    // Create message element
    const messageDiv = document.createElement('div');
    messageDiv.className = `form-message form-message-${type}`;
    messageDiv.innerHTML = `
      <p>${message}</p>
      <button class="close-message" onclick="this.parentElement.remove()">×</button>
    `;
    
    // Insert message after the form
    contactForm.parentNode.insertBefore(messageDiv, contactForm.nextSibling);
    
    // Auto-remove message after 8 seconds
    setTimeout(() => {
      if (messageDiv.parentNode) {
        messageDiv.remove();
      }
    }, 8000);
  }
});

// Projects renderer: load from API (dev) or fallback to static JSON (prod) and inject into .projects-grid
document.addEventListener('DOMContentLoaded', function() {
  const API_BASE = (location.hostname === 'localhost' || location.hostname === '127.0.0.1') ? 'http://127.0.0.1:5000' : '';
  const projectsGrid = document.querySelector('.projects-grid');
  if (!projectsGrid) return;
  const isAllProjectsPage = (document.body && document.body.getAttribute('data-page') === 'projects-list');

  // Helper: fetch with timeout
  function fetchWithTimeout(resource, options = {}) {
    const { timeout = 5000 } = options;
    const finalOptions = Object.assign({ cache: 'no-store', mode: 'cors' }, options);
    return Promise.race([
      fetch(resource, finalOptions),
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), timeout))
    ]);
  }

  // Resolve media URLs that come from the admin server (e.g., /uploads/..)
  // In production (no API_BASE), map /uploads/* to local placeholders so cards don’t break.
  const PLACEHOLDER_IMAGES = [
    'assets/images/education/e1.jpg',
    'assets/images/education/e2.jpg',
    'assets/images/education/e3.jpg',
    'assets/images/education/e4.jpg'
  ];
  function pickPlaceholder(seedStr = '') {
    try { let h=0,s=String(seedStr); for(let i=0;i<s.length;i++) h=(h*31+s.charCodeAt(i))>>>0; return PLACEHOLDER_IMAGES[h%PLACEHOLDER_IMAGES.length]; } catch { return PLACEHOLDER_IMAGES[0]; }
  }
  function resolveMedia(url) {
    if (!url) return '';
    // Always use local assets for /uploads/ paths when serving static files
    if (typeof url === 'string' && url.startsWith('/uploads/')) {
      return 'assets' + url; // e.g., /uploads/x -> assets/uploads/x
    }
    // If the URL is an absolute path coming from the admin API, prefix with API host in dev
    if (API_BASE && typeof url === 'string' && url.startsWith('/')) {
      return API_BASE + url;
    }
    return url;
  }

  function loadProjects() {
    if (API_BASE) {
      return fetchWithTimeout(`${API_BASE}/api/projects`).then(r => r.json()).catch(() => null);
    }
    return Promise.resolve(null);
  }

  function loadProjectsFallback() {
    return fetch('assets/projects.json').then(r => r.json()).catch(() => []);
  }

  loadProjects()
    .then(apiProjects => apiProjects || loadProjectsFallback())
    .catch(() => loadProjectsFallback())
    .then(projects => {
      try { console.log('[projects] source:', Array.isArray(projects) ? (API_BASE ? 'api' : 'static') : 'unknown', 'count=', (projects||[]).length); } catch {}
      if (!Array.isArray(projects)) projects = [];
      if (projects.length === 0) {
        const empty = document.createElement('p');
        empty.textContent = 'No projects yet.';
        projectsGrid.appendChild(empty);
        return;
      }
      const list = isAllProjectsPage ? projects : projects.slice(0, 9);
      list.forEach(proj => {
        const imgSrc = resolveMedia(proj.main_image || proj.image || '');
        const article = document.createElement('article');
        article.className = 'project-card';

        article.innerHTML = `
          <div class="project-image">
            <img src="${imgSrc}" alt="${escapeHtml(proj.title?.en || proj.title)}" loading="lazy" onerror="this.onerror=null; this.src='${pickPlaceholder(proj.id || proj.title)}'">
            <div class="project-overlay">
              <div class="project-overlay-content">
                <h3 data-en="${escapeHtml(proj.title?.en || proj.title)}" data-si="${escapeHtml(proj.title?.si || '')}" data-ta="${escapeHtml(proj.title?.ta || '')}">${escapeHtml(proj.title?.en || proj.title)}</h3>
                <a href="projects.html?id=${encodeURIComponent(proj.id)}" class="btn-overlay" data-en="Learn More" data-si="තව දැනගන්න" data-ta="மேலும் அறிக">Learn More</a>
              </div>
            </div>
          </div>
          <div class="project-content">
            <div class="project-meta">
              <span class="project-category" data-en="${escapeHtml(proj.category || '')}">${escapeHtml(proj.category || '')}</span>
              <span class="project-status" data-en="${escapeHtml(proj.status || '')}">${escapeHtml(proj.status || '')}</span>
            </div>
            <h3 data-en="${escapeHtml(proj.title?.en || proj.title)}" data-si="${escapeHtml(proj.title?.si || '')}" data-ta="${escapeHtml(proj.title?.ta || '')}">${escapeHtml(proj.title?.en || proj.title)}</h3>
            <p data-en="${escapeHtml(proj.summary?.en || proj.summary || '')}" data-si="${escapeHtml(proj.summary?.si || '')}" data-ta="${escapeHtml(proj.summary?.ta || '')}">${escapeHtml(proj.summary?.en || proj.summary || '')}</p>
            <div class="project-stats">
              <div class="stat">
                <span class="stat-number">${escapeHtml(proj.stat1?.number || '')}</span>
                <span class="stat-label" data-en="${escapeHtml(proj.stat1?.label?.en || '')}" data-si="${escapeHtml(proj.stat1?.label?.si || '')}" data-ta="${escapeHtml(proj.stat1?.label?.ta || '')}">${escapeHtml(proj.stat1?.label?.en || '')}</span>
              </div>
              <div class="stat">
                <span class="stat-number">${escapeHtml(proj.stat2?.number || '')}</span>
                <span class="stat-label" data-en="${escapeHtml(proj.stat2?.label?.en || '')}" data-si="${escapeHtml(proj.stat2?.label?.si || '')}" data-ta="${escapeHtml(proj.stat2?.label?.ta || '')}">${escapeHtml(proj.stat2?.label?.en || '')}</span>
              </div>
            </div>
            <a href="projects.html?id=${encodeURIComponent(proj.id)}" class="project-link" data-en="Learn More">Learn More</a>
          </div>
        `;

  projectsGrid.appendChild(article);
      });

      // Re-run translation to apply current language to newly added elements
      switchLanguage(currentLanguage);

      // Observe animations for new elements
      document.querySelectorAll('.project-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        observer.observe(el);
      });

  // Adaptive title sizing for project overlays
  try { applyAdaptiveTitleSizes('.project-overlay-content h3'); } catch {}
    })
  .catch(err => console.error('Failed to load projects list', err));

  // Simple HTML escaper to prevent injection from JSON
  function escapeHtml(str) {
    return String(str || '').replace(/[&<>"']/g, function (s) {
      return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[s];
    });
  }
});

// Gallery: fetch dynamic items from API (dev) or derive from static projects.json (prod)
document.addEventListener('DOMContentLoaded', function() {
  // On the project detail page, we render a project-specific gallery.
  // Skip the global gallery loader to avoid overriding that content.
  if (document.body && document.body.getAttribute('data-page') === 'project') {
    return;
  }
  const galleryGrid = document.querySelector('.gallery-grid');
  const filtersContainer = document.querySelector('.gallery-filters');
  if (!galleryGrid) return;

  const API_BASE = (location.hostname === 'localhost' || location.hostname === '127.0.0.1') ? 'http://127.0.0.1:5000' : '';

  function resolveMedia(url) {
    if (!url) return '';
    // Always use local assets for /uploads/ paths when serving static files
    if (typeof url === 'string' && url.startsWith('/uploads/')) {
      return 'assets' + url; // e.g., /uploads/x -> assets/uploads/x
    }
    if (API_BASE && typeof url === 'string' && url.startsWith('/')) {
      return API_BASE + url;
    }
    return url;
  }

  // Local escaper for this block
  function escapeHtml(str) {
    return String(str || '').replace(/[&<>"']/g, function (s) {
      return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[s];
    });
  }

  function fetchWithTimeout(resource, options = {}) {
    const { timeout = 1500 } = options;
    return Promise.race([
      fetch(resource, options),
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), timeout))
    ]);
  }

  function deriveGalleryFromProjects(projects) {
    const items = [];
    (projects || []).forEach(p => {
      const desc = (p.summary && (p.summary.en || p.summary)) || (p.title && (p.title.en || p.title)) || '';
      const title = (p.title && (p.title.en || p.title)) || '';
      if (p.main_image || p.image) items.push({ url: resolveMedia(p.main_image || p.image), category: p.category || '', tags: p.tags || [], projectId: p.id, description: desc, title });
      (p.gallery_images || []).forEach(u => items.push({ url: resolveMedia(u), category: p.category || '', tags: p.tags || [], projectId: p.id, description: desc, title }));
    });
    return items;
  }

  function loadGallery() {
    if (API_BASE) {
      return fetchWithTimeout(`${API_BASE}/api/gallery`).then(r => r.json()).catch(() => null);
    }
    return Promise.resolve(null);
  }

  function loadProjectsFallback() {
    return fetch('assets/projects.json').then(r => r.json()).then(deriveGalleryFromProjects).catch(() => []);
  }

  loadGallery()
    .then(items => items || loadProjectsFallback())
    .catch(() => loadProjectsFallback())
    .then(items => {
      const allItems = Array.isArray(items) ? items : [];

      // Limit on homepage to first 25; show all on dedicated gallery page
      const isFullGalleryPage = document.body && document.body.getAttribute('data-page') === 'gallery';
      const renderItems = isFullGalleryPage ? allItems : allItems.slice(0, 25);

      const truncate = (text, n = 90) => {
        const t = String(text || '').trim();
        return t.length > n ? t.slice(0, n - 1) + '…' : t;
      };

  // If nothing to render, keep existing static items and just add See more button
      if (!renderItems.length) {
        if (!isFullGalleryPage && galleryGrid.children.length > 0) {
          const moreWrap = document.createElement('div');
          moreWrap.className = 'gallery-see-more';
          moreWrap.innerHTML = `<a class="btn btn-primary" href="gallery.html">See more</a>`;
          const container = galleryGrid.parentElement || document.getElementById('gallery') || document.body;
          container.appendChild(moreWrap);
        }
        return;
      }

      galleryGrid.innerHTML = '';

      renderItems.forEach(it => {
        const div = document.createElement('div');
        div.className = 'gallery-item';
        div.setAttribute('data-category', it.category || 'community');
        div.setAttribute('data-tags', (it.tags || []).join(','));
        const moreLink = it.projectId ? `<a class="btn-overlay" href="projects.html?id=${encodeURIComponent(it.projectId)}" data-en="Learn More" data-si="තව දැනගන්න" data-ta="மேலும் அறிக">Learn More</a>` : '';
    div.innerHTML = `
          <img src="${resolveMedia(it.url)}" alt="Gallery item" loading="lazy" onerror="this.onerror=null; this.src='assets/images/education/e2.jpg'">
          <div class="gallery-overlay"><div class="gallery-info">
      <h4>${escapeHtml((it.title || it.category || 'Photo'))}</h4>
            ${moreLink}
          </div></div>`;
        galleryGrid.appendChild(div);
      });

      // Build dynamic filter buttons from categories
      if (filtersContainer) {
        const uniqueCats = Array.from(new Set(allItems.map(it => (it.category || '').trim()).filter(Boolean)));
        filtersContainer.innerHTML = '';
        const makeBtn = (label, value, active=false) => {
          const btn = document.createElement('button');
          btn.className = 'filter-btn' + (active ? ' active' : '');
          btn.setAttribute('data-filter', value);
          btn.textContent = label;
          // Add i18n data for language switcher
          if (value === 'all') {
            btn.setAttribute('data-en', 'All Photos');
            btn.setAttribute('data-si', '\u0dc3\u0dd2\u0dba\u0dd4\u0dbd\u0dd4\u0db8 \u0da2\u0dcf\u0dba\u0dcf\u0dbb\u0dd4\u0db4');
            btn.setAttribute('data-ta', '\u0b85\u0ba9\u0bc8\u0ba4\u0bcd\u0ba4\u0bc1 \u0baa\u0bc1\u0b95\u0bc8\u0baa\u0bcd\u0baa\u0b9f\u0b99\u0bcd\u0b95\u0bb3\u0bcd');
          } else {
            // Default to English label for other languages when translations are not provided
            btn.setAttribute('data-en', label);
            btn.setAttribute('data-si', label);
            btn.setAttribute('data-ta', label);
          }
          return btn;
        };
        filtersContainer.appendChild(makeBtn('All Photos', 'all', true));
        uniqueCats.forEach(cat => filtersContainer.appendChild(makeBtn(cat, cat, false)));
      }

      // Append See more button on homepage (always visible)
      if (!isFullGalleryPage) {
        const container = galleryGrid.parentElement || document.getElementById('gallery');
        if (container && !container.querySelector('.gallery-see-more')) {
          const moreWrap = document.createElement('div');
          moreWrap.className = 'gallery-see-more';
          moreWrap.innerHTML = `<a class="btn btn-primary" href="gallery.html">See more</a>`;
          container.appendChild(moreWrap);
        }
      }

  // Hook filters (rebinding to dynamic buttons)
  const filterButtons = document.querySelectorAll('.filter-btn');
  filterButtons.forEach(button => {
        button.addEventListener('click', function() {
          filterButtons.forEach(btn => btn.classList.remove('active'));
          this.classList.add('active');
          const filterValue = this.getAttribute('data-filter');
          const galleryItems = document.querySelectorAll('.gallery-item');
          galleryItems.forEach(item => {
            const itemCategory = item.getAttribute('data-category');
            if (filterValue === 'all' || itemCategory === filterValue) {
              item.classList.remove('hidden');
              item.style.display = 'block';
            } else {
              item.classList.add('hidden');
              setTimeout(() => {
                if (item.classList.contains('hidden')) {
                  item.style.display = 'none';
                }
              }, 300);
            }
          });
        });
      });

      // Use gallery images in the hero shuffle
      try {
        if (window.heroImageManager && allItems.length) {
          // Build a unique, resolved list of image URLs
          const urls = Array.from(new Set(allItems
            .map(it => resolveMedia(it.url))
            .filter(Boolean)));

          if (urls.length) {
            // Always populate 'education' with the full set as a safe fallback
            window.heroImageManager.replaceImages('education', urls.slice(0, 40));

            // Distribute chunks to other categories for variety (if enough images)
            const chunkSize = Math.max(6, Math.floor(urls.length / 4));
            const cdev = urls.slice(0, chunkSize);
            const health = urls.slice(chunkSize, chunkSize * 2);
            const env = urls.slice(chunkSize * 2, chunkSize * 3);
            const emp = urls.slice(chunkSize * 3, chunkSize * 4);

            if (cdev.length) window.heroImageManager.replaceImages('community-development', cdev);
            if (health.length) window.heroImageManager.replaceImages('healthcare', health);
            if (env.length) window.heroImageManager.replaceImages('environment', env);
            if (emp.length) window.heroImageManager.replaceImages('empowerment', emp);

            // Immediately rotate to show the new images
            window.heroImageManager.shuffleImages();
          }
        }
      } catch (e) {
        console.warn('Failed to feed hero from gallery', e);
      }
  })
  .catch(err => console.error('Failed to load gallery items', err));
});

// Utility: adapt title font-size by text length so long titles fit better
function applyAdaptiveTitleSizes(selector) {
  const nodes = document.querySelectorAll(selector);
  nodes.forEach(el => {
    const len = (el.textContent || '').trim().length;
    let sizeRem = 1.05; // base for gallery h4, acceptable for project overlay h3 too
    if (len > 60) sizeRem = 0.85;
    else if (len > 45) sizeRem = 0.9;
    else if (len > 32) sizeRem = 0.95;
    el.style.fontSize = sizeRem + 'rem';
    el.style.lineHeight = '1.2';
  });
}

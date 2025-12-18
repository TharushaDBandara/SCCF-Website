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
  
  // Update all translatable elements with manual translations
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

  // Trigger AI translation for elements without manual translations
  // This eliminates the need for manual translation work!
  if (lang !== 'en') {
    triggerAITranslation(lang);
  }

  // Re-apply adaptive title sizing after language updates (titles may change length)
  try {
    applyAdaptiveTitleSizes && applyAdaptiveTitleSizes('.project-overlay-content h3, .gallery-info h4');
  } catch {}
}

// Function to trigger AI translation with retry
function triggerAITranslation(lang) {
  if (window.SCCFTranslationService) {
    window.SCCFTranslationService.translatePageElements(lang);
  } else {
    // Translation service not loaded yet, wait and retry
    let retries = 0;
    const maxRetries = 10;
    const checkInterval = setInterval(() => {
      retries++;
      if (window.SCCFTranslationService) {
        clearInterval(checkInterval);
        window.SCCFTranslationService.translatePageElements(lang);
      } else if (retries >= maxRetries) {
        clearInterval(checkInterval);
        console.log('[Translation] Service not available');
      }
    }, 200);
  }
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

// Modern scroll animations with mobile-friendly settings
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, { 
  threshold: 0.05,  // Reduced from 0.1 for better mobile detection
  rootMargin: window.innerWidth < 768 ? '0px 0px -20px 0px' : '0px 0px -80px 0px'  // Less aggressive margin on mobile
});

document.addEventListener('DOMContentLoaded', () => {
  const animateElements = document.querySelectorAll('.section, .project-card, .team-member');
  
  animateElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
    observer.observe(el);
  });
  
  // Fallback: ensure content is visible after 2 seconds if observer doesn't trigger (mobile safety)
  setTimeout(() => {
    document.querySelectorAll('.section, .project-card, .team-member, .gallery-item').forEach(el => {
      if (el.style.opacity === '0') {
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      }
    });
  }, 2000);

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
  const filterButtons = document.querySelectorAll('.gallery-filters .filter-btn');
  const galleryItems = document.querySelectorAll('.gallery-item');
  
  if (filterButtons.length > 0 && galleryItems.length > 0) {
    filterButtons.forEach(button => {
      button.addEventListener('click', function() {
  // Remove active class from all gallery filter buttons only
  document.querySelectorAll('.gallery-filters .filter-btn').forEach(btn => btn.classList.remove('active'));
        // Add active class to clicked button
        this.classList.add('active');
        
        const filterValue = this.getAttribute('data-filter');
        
        // Determine if we're on the full gallery page or homepage
        const isFullGalleryPage = document.body && document.body.getAttribute('data-page') === 'gallery';
        const maxVisibleItems = isFullGalleryPage ? Infinity : 12;
        let visibleCount = 0;
        
        galleryItems.forEach(item => {
          const itemCategory = item.getAttribute('data-category');
          const shouldShow = (filterValue === 'all' || itemCategory === filterValue);
          
          if (shouldShow && visibleCount < maxVisibleItems) {
            item.classList.remove('hidden');
            item.style.display = 'block';
            visibleCount++;
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
    // After initial load, try to populate from hero folder manifest if available
    this.loadHeroFolderImages();
  }
  
  // Setup image arrays with defaults/fallbacks
  setupImageArrays() {
    // Prefer using assets/hero image/manifest.json when available (loaded asynchronously in loadHeroFolderImages)
    // Provide a small local fallback so UI isn't empty before manifest loads
    this.imageFolders['education'] = [
      'assets/images/education/e1.jpg',
      'assets/images/education/e2.jpg',
      'assets/images/education/e3.jpg',
      'assets/images/education/e4.jpg'
    ];
    this.imageFolders['community-development'] = [];
    this.imageFolders['healthcare'] = [];
    this.imageFolders['environment'] = [];
    this.imageFolders['empowerment'] = [];
    
    // Initialize current image index for each category
    Object.keys(this.imageFolders).forEach(category => {
      this.currentImageIndex[category] = 0;
    });
  }

  // Try to load images from assets/hero image/manifest.json and use them for the hero grid
  async loadHeroFolderImages() {
    try {
      // Encode the space in the folder name for a proper URL
      const manifestUrl = 'assets/hero%20image/manifest.json';
      const resp = await fetch(manifestUrl, { cache: 'no-store' });
      if (!resp.ok) return;
      const arr = await resp.json();
      if (!Array.isArray(arr) || arr.length === 0) return;
      // De-dup and basic validation
      const urls = Array.from(new Set(arr.filter(u => typeof u === 'string' && u.trim().length)));
      if (!urls.length) return;
      // Use the folder images for the 'education' bucket and reassign all grid items to it as needed
      this.replaceImages('education', urls);
      // Ensure the grid updates immediately
      this.loadInitialImages();
      this.shuffleImages();
    } catch (e) {
      // Ignore if manifest missing; fall back to defaults
      console.warn('Hero folder manifest not found or invalid; using fallback images.');
    }
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
          const pbtn = document.querySelector(`.project-filters .filter-btn[data-filter="${targetFilter}"]`);
          if (pbtn) pbtn.click();
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
  const mailtoLink = `mailto:contact@sccflk.org?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
      
      // Open email client
      window.location.href = mailtoLink;
      
      // Show success message
  showFormMessage('Thank you for your message! Your email client should open shortly. If it doesn\'t, please copy the information and send it manually to contact@sccflk.org', 'success');
      
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
    // Dev: use admin server
    if (API_BASE && typeof url === 'string' && url.startsWith('/uploads/')) {
      return API_BASE + url;
    }
    // Prod/static: map /uploads/* to assets/uploads/* where files are mirrored
    if (!API_BASE && typeof url === 'string' && url.startsWith('/uploads/')) {
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
      // Sort projects by pinned -> priority -> featured -> category weight -> status -> original order
      const cfg = (window && window.PROJECTS_CONFIG) ? window.PROJECTS_CONFIG : {};
      const pinnedOrder = Array.isArray(cfg.pinnedOrder) ? cfg.pinnedOrder : [];
      const categoryWeights = (cfg.categoryWeights && typeof cfg.categoryWeights === 'object') ? cfg.categoryWeights : {};
      const homepageLimit = Number.isFinite(cfg.homepageLimit) ? cfg.homepageLimit : 9;

      // Preserve original order for stable tiebreaks
      const withIndex = projects.map((p, i) => ({ p, i }));

      // Status weights: adjust as needed
      const statusWeight = (s) => {
        const v = String(s || '').toLowerCase();
        if (v.includes('ongoing') || v.includes('in progress')) return 2;
        if (v.includes('completed') || v.includes('complete')) return 1;
        return 0;
      };

      const pinIndex = (id) => {
        const idx = pinnedOrder.indexOf(id || '');
        return idx === -1 ? Infinity : idx; // Infinity means not pinned
      };

      const safeNum = (n) => {
        const v = typeof n === 'number' ? n : (typeof n === 'string' ? parseFloat(n) : 0);
        return Number.isFinite(v) ? v : 0;
      };

      withIndex.sort((a, b) => {
        const A = a.p, B = b.p;
        // 1) Pinned order (lower index first)
        const ap = pinIndex(A.id), bp = pinIndex(B.id);
        if (ap !== bp) return ap - bp;
        // 2) Numeric priority (desc). Optional field.
        const apr = safeNum(A.priority), bpr = safeNum(B.priority);
        if (apr !== bpr) return bpr - apr;
        // 3) Featured first (boolean). Optional field.
        const af = !!A.featured, bf = !!B.featured;
        if (af !== bf) return bf ? 1 : -1; // true first
        // 4) Category weight (desc)
        const acw = safeNum(categoryWeights[A.category] || 0), bcw = safeNum(categoryWeights[B.category] || 0);
        if (acw !== bcw) return bcw - acw;
        // 5) Status weight (desc)
        const asw = statusWeight(A.status), bsw = statusWeight(B.status);
        if (asw !== bsw) return bsw - asw;
        // 6) Stable fallback to original order
        return a.i - b.i;
      });

      const sorted = withIndex.map(x => x.p);
      const list = isAllProjectsPage ? sorted : sorted.slice(0, homepageLimit);
      list.forEach(proj => {
        const rawMain = (proj.main_image || proj.image || '') || '';
        const rawGallery0 = (Array.isArray(proj.gallery_images) && proj.gallery_images.length) ? (proj.gallery_images[0] || '') : '';
  // Choose primary/alternate sources
        let primarySrc = resolveMedia(rawMain);
        let fbGallery = rawGallery0 ? resolveMedia(rawGallery0) : '';
        let altPath = '';
        let altFbk = '';
        // Prefer the mirrored assets/ path first on static hosting; keep bundled server copy as relative fallback.
        if (!API_BASE && typeof rawMain === 'string' && rawMain.startsWith('/uploads/')) {
          primarySrc = 'assets' + rawMain; // mirror in assets for static hosting
          altPath = 'server' + rawMain;   // relative fallback to bundled server copy
        } else if (typeof rawMain === 'string' && rawMain.startsWith('/uploads/')) {
          // Dev: admin API already handled by resolveMedia; keep /server as last resort
          altPath = '/server' + rawMain;
        }
        if (!API_BASE && typeof rawGallery0 === 'string' && rawGallery0.startsWith('/uploads/')) {
          fbGallery = 'assets' + rawGallery0; // mirror first
          altFbk = 'server' + rawGallery0;   // relative bundled server copy as last resort
        } else if (typeof rawGallery0 === 'string' && rawGallery0.startsWith('/uploads/')) {
          altFbk = '/server' + rawGallery0;
        }
        const article = document.createElement('article');
        article.className = 'project-card';
        // expose category for filtering
        article.setAttribute('data-category', (proj.category || '').trim());

        article.innerHTML = `
          <div class="project-image">
            <img src="${primarySrc}" ${fbGallery ? `data-fbk=\"${fbGallery}\"` : ''} ${altPath ? `data-alt=\"${altPath}\"` : ''} ${altFbk ? `data-altfbk=\"${altFbk}\"` : ''} alt="${escapeHtml(proj.title?.en || proj.title)}" loading="lazy" onerror="if(this.dataset.fbk){var u=this.dataset.fbk; this.dataset.fbk=''; this.src=u;} else if(this.dataset.alt){var a=this.dataset.alt; this.dataset.alt=''; this.src=a;} else if(this.dataset.altfbk){var b=this.dataset.altfbk; this.dataset.altfbk=''; this.src=b;} else { this.onerror=null; this.src='${pickPlaceholder(proj.id || proj.title)}'; }">
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

      // If only one project is shown, apply a CSS hook to center and constrain it
      try {
        if (list.length === 1) {
          projectsGrid.classList.add('single');
        } else {
          projectsGrid.classList.remove('single');
        }
      } catch {}

      // Re-run translation to apply current language to newly added elements
      switchLanguage(currentLanguage);

      // Observe animations for new elements
      document.querySelectorAll('.project-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        observer.observe(el);
      });
      
      // Fallback for dynamically loaded projects (mobile safety)
      setTimeout(() => {
        document.querySelectorAll('.project-card').forEach(el => {
          if (el.style.opacity === '0') {
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
          }
        });
      }, 1500);

      // Build Projects filter buttons like Gallery if container exists
      const projFilters = document.querySelector('.project-filters');
      if (projFilters) {
        console.log('[DEBUG] Building project filter buttons...');
        const uniqueCats = Array.from(new Set(sorted.map(p => (p.category || '').trim()).filter(Boolean)));
        console.log('[DEBUG] Found categories:', uniqueCats);
        const makeBtn = (label, value, active=false) => {
          const btn = document.createElement('button');
          btn.className = 'filter-btn' + (active ? ' active' : '');
          btn.setAttribute('data-filter', value);
          btn.textContent = label || 'All Projects';
          // i18n attributes
          if (value === 'all') {
            btn.setAttribute('data-en', 'All Projects');
            btn.setAttribute('data-si', 'සියළු ව්‍යාපෘති');
            btn.setAttribute('data-ta', 'அனைத்து திட்டங்கள்');
          } else {
            btn.setAttribute('data-en', label);
            btn.setAttribute('data-si', label);
            btn.setAttribute('data-ta', label);
          }
          return btn;
        };
        projFilters.innerHTML = '';
        projFilters.appendChild(makeBtn('All Projects', 'all', true));
        uniqueCats.forEach(cat => projFilters.appendChild(makeBtn(cat, cat)));
        console.log('[DEBUG] Created', uniqueCats.length + 1, 'filter buttons');

        const pfBtns = projFilters.querySelectorAll('.filter-btn');
        console.log('[DEBUG] Found', pfBtns.length, 'filter buttons to attach listeners');
        pfBtns.forEach(b => b.addEventListener('click', function() {
          console.log('[DEBUG] Filter button clicked:', this.getAttribute('data-filter'));
          pfBtns.forEach(x => x.classList.remove('active'));
          this.classList.add('active');
          const v = this.getAttribute('data-filter');
          const cards = document.querySelectorAll('.project-card');
          console.log('[DEBUG] Total cards:', cards.length);
          cards.forEach(card => {
            const cat = (card.getAttribute('data-category') || '').trim();
            const show = (v === 'all' || cat === v);
            if (show) {
              card.style.display = '';
              card.style.visibility = 'visible';
              card.style.opacity = '1';
              card.removeAttribute('hidden');
            } else {
              card.style.display = 'none';
              card.style.visibility = 'hidden';
              card.style.opacity = '0';
            }
          });
          const visibleCount = Array.from(cards).filter(el => el.style.display !== 'none').length;
          console.log('[DEBUG] Visible cards after filter:', visibleCount);
          // Toggle single layout if only one card remains visible
          try {
            if (visibleCount === 1) {
              projectsGrid.classList.add('single');
            } else {
              projectsGrid.classList.remove('single');
            }
          } catch {}
        }));

        // Apply current language to newly added filter buttons
        try { switchLanguage(currentLanguage); } catch {}
      }

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
    // Dev: prefer admin server
    if (API_BASE && typeof url === 'string' && url.startsWith('/uploads/')) {
      return API_BASE + url;
    }
    // Prod/static: map to assets/uploads mirror
    if (!API_BASE && typeof url === 'string' && url.startsWith('/uploads/')) {
      return 'assets' + url;
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

  // Helper: build featured set and project metadata map (category, featured) from API or static
  async function getProjectMeta() {
    try {
      let projects = null;
      if (API_BASE) {
        projects = await fetchWithTimeout(`${API_BASE}/api/projects`, { timeout: 2000 }).then(r=>r.json()).catch(()=>null);
      }
      if (!Array.isArray(projects)) {
        projects = await fetch('assets/projects.json').then(r=>r.json()).catch(()=>[]);
      }
      if (!Array.isArray(projects)) return { featuredSet: new Set(), meta: new Map(), urlIndex: new Map() };
      const isTruthy = (v)=>{
        const s = String(v).toLowerCase();
        return v===true || s==='true' || s==='yes' || s==='1';
      };
      const featuredSet = new Set(projects.filter(p=>isTruthy(p.featured)).map(p=>p.id));
      const meta = new Map(); // id -> { category, featured }
      const urlIndex = new Map(); // normalized url -> projectId
      const norm = (u)=>{
        try { if (!u) return ''; const s = String(u); const i = s.indexOf('/uploads/'); return i>=0 ? s.slice(i) : s; } catch { return String(u||''); }
      };
      projects.forEach(p => {
        meta.set(p.id, { category: p.category || '', featured: isTruthy(p.featured) });
        // index main image and gallery images for reverse-lookup when API gallery lacks projectId/category
        [p.main_image || p.image || null].concat(Array.isArray(p.gallery_images) ? p.gallery_images : []).filter(Boolean).forEach(u => {
          urlIndex.set(norm(u), p.id);
        });
      });
      return { featuredSet, meta, urlIndex };
    } catch { return new Set(); }
  }

  loadGallery()
    .then(items => items || loadProjectsFallback())
    .catch(() => loadProjectsFallback())
    .then(async items => {
      const allItemsRaw = Array.isArray(items) ? items : [];

      // Enrich gallery items with projectId/category when missing
      const { featuredSet, meta, urlIndex } = await getProjectMeta();
      const norm = (u)=>{ try { if (!u) return ''; const s=String(u); const i=s.indexOf('/uploads/'); return i>=0?s.slice(i):s; } catch { return String(u||''); } };
      allItemsRaw.forEach(it => {
        if (!it) return;
        const pid = urlIndex.get(norm(it.url));
        if (pid) {
          // Trust URL->project mapping over possibly stale API gallery fields
          it.projectId = pid;
          if (meta.has(pid)) {
            const m = meta.get(pid);
            it.category = (m.category || it.category || '').trim();
          }
        } else if (!it.category || !it.category.trim()) {
          // Last resort default when nothing resolvable
          it.category = (it.category || 'community').trim();
        }
      });

      // Reorder so that images from featured projects appear first
      const withIndex = allItemsRaw.map((it, i) => ({ it, i }));
      const isFeaturedItem = (x)=> x && x.projectId != null && featuredSet && featuredSet.has(x.projectId);
      withIndex.sort((a,b)=>{
        const af = isFeaturedItem(a.it) ? 1 : 0;
        const bf = isFeaturedItem(b.it) ? 1 : 0;
        if (af !== bf) return bf - af; // featured first
        return a.i - b.i; // stable
      });
      const allItems = withIndex.map(x=>x.it);

      // Determine page type
      const isFullGalleryPage = document.body && document.body.getAttribute('data-page') === 'gallery';
      
      // On homepage, we'll render all items but initially show only 12 with "All Photos" filter
      // This allows filtering to work properly with the full dataset
      const renderItems = allItems;

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

      renderItems.forEach((it, index) => {
        const div = document.createElement('div');
        div.className = 'gallery-item';
        div.setAttribute('data-category', it.category || 'community');
        div.setAttribute('data-tags', (it.tags || []).join(','));
        
        // On homepage, initially hide items beyond index 11 (first 12 are 0-11)
        if (!isFullGalleryPage && index >= 12) {
          div.classList.add('hidden');
          div.style.display = 'none';
        }
        
        const moreLink = it.projectId ? `<a class="btn-overlay" href="projects.html?id=${encodeURIComponent(it.projectId)}" data-en="Learn More" data-si="තව දැනගන්න" data-ta="மேலும் அறிக">Learn More</a>` : '';
        const rawUrl = it.url || '';
        // In prod prefer assets/uploads as primary, with relative server/ fallback
        let primary = resolveMedia(it.url);
        let altPath = '';
        if (!API_BASE && typeof rawUrl === 'string' && rawUrl.startsWith('/uploads/')) {
          primary = 'assets' + rawUrl;
          altPath = 'server' + rawUrl;
        } else if (typeof rawUrl === 'string' && rawUrl.startsWith('/uploads/')) {
          altPath = '/server' + rawUrl; // dev last resort
        }
    div.innerHTML = `
          <img src="${primary}" ${altPath ? `data-alt=\"${altPath}\"` : ''} alt="Gallery item" loading="lazy" onerror="if(this.dataset.alt){var a=this.dataset.alt; this.dataset.alt=''; this.src=a;} else { this.onerror=null; const gi=this.closest('.gallery-item'); if(gi) gi.remove(); }">
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

  // Hook filters (rebinding to dynamic buttons) – scope to gallery only
  const filterButtons = document.querySelectorAll('.gallery-filters .filter-btn');
  filterButtons.forEach(button => {
        button.addEventListener('click', function() {
          document.querySelectorAll('.gallery-filters .filter-btn').forEach(btn => btn.classList.remove('active'));
          this.classList.add('active');
          const filterValue = this.getAttribute('data-filter');
          const galleryItems = document.querySelectorAll('.gallery-item');
          
          // On homepage, limit filtered results to 12 items
          const maxVisibleItems = isFullGalleryPage ? Infinity : 12;
          let visibleCount = 0;
          
          galleryItems.forEach(item => {
            const itemCategory = item.getAttribute('data-category');
            const shouldShow = (filterValue === 'all' || itemCategory === filterValue);
            
            if (shouldShow && visibleCount < maxVisibleItems) {
              item.classList.remove('hidden');
              item.style.display = 'block';
              visibleCount++;
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
      const HERO_SOURCE = (window.HERO_IMAGES_SOURCE || 'folder');
      try {
        if (HERO_SOURCE === 'gallery' && window.heroImageManager && allItems.length) {
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

// ============================================
// BACK TO TOP BUTTON
// ============================================
document.addEventListener('DOMContentLoaded', function() {
  const backToTopBtn = document.getElementById('back-to-top');
  if (!backToTopBtn) return;

  // Show/hide button based on scroll position
  function toggleBackToTopButton() {
    if (window.pageYOffset > 300) {
      backToTopBtn.classList.add('visible');
    } else {
      backToTopBtn.classList.remove('visible');
    }
  }

  // Smooth scroll to top
  function scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  // Event listeners
  window.addEventListener('scroll', toggleBackToTopButton, { passive: true });
  backToTopBtn.addEventListener('click', scrollToTop);

  // Initial check
  toggleBackToTopButton();
});

// ============================================
// IMPACT STATISTICS COUNTER ANIMATION
// ============================================
document.addEventListener('DOMContentLoaded', function() {
  const impactCards = document.querySelectorAll('.impact-stat-card');
  const projectsCounter = document.getElementById('projects-counter');
  
  if (!impactCards.length) return;

  // Function to animate counting
  function animateCounter(element, target, suffix = '') {
    const numberElement = element.querySelector('.impact-number');
    if (!numberElement) return;
    
    const duration = 2000; // 2 seconds
    const start = 0;
    const increment = target / (duration / 16); // 60fps
    let current = start;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      numberElement.textContent = Math.floor(current);
    }, 16);
  }

  // Function to animate ring progress
  function animateRing(card) {
    const ring = card.querySelector('.ring-progress');
    if (!ring) return;
    
    const percent = parseInt(ring.dataset.percent) || 0;
    card.style.setProperty('--percent', percent);
    
    // Trigger the CSS animation
    requestAnimationFrame(() => {
      ring.style.strokeDashoffset = 283 - (283 * percent / 100);
    });
  }

  // Function to load project count from JSON
  async function loadProjectCount() {
    try {
      // Try API first (for localhost), then fallback to static JSON
      const isLocal = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
      const apiUrl = isLocal ? 'http://127.0.0.1:5000/api/projects' : null;
      const staticUrl = 'assets/projects.json';
      
      let projects = [];
      
      if (apiUrl) {
        try {
          const response = await fetch(apiUrl);
          if (response.ok) {
            projects = await response.json();
          }
        } catch (e) {
          // Fall through to static JSON
        }
      }
      
      if (projects.length === 0) {
        const response = await fetch(staticUrl);
        if (response.ok) {
          projects = await response.json();
        }
      }
      
      // Count only published projects
      const publishedCount = projects.filter(p => p.published !== false).length;
      
      if (projectsCounter) {
        projectsCounter.dataset.target = publishedCount;
      }
      
      return publishedCount;
    } catch (error) {
      console.warn('Could not load project count:', error);
      return 15; // Default fallback
    }
  }

  // Intersection Observer for triggering animation when in view
  let hasAnimated = false;
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !hasAnimated) {
        hasAnimated = true;
        
        // Add animation class to each card with stagger
        impactCards.forEach((card, index) => {
          setTimeout(() => {
            card.classList.add('animate');
            
            const target = parseInt(card.dataset.target) || 0;
            const suffix = card.dataset.suffix || '';
            animateCounter(card, target, suffix);
            animateRing(card);
          }, index * 200);
        });
        
        observer.disconnect();
      }
    });
  }, {
    threshold: 0.3,
    rootMargin: '0px 0px -50px 0px'
  });

  // Load project count and then start observing
  loadProjectCount().then(() => {
    const statsSection = document.getElementById('impact-stats');
    if (statsSection) {
      observer.observe(statsSection);
    }
  });
});

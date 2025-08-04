// Enhanced Responsive Navigation for Modern SCCF Website
const navToggle = document.querySelector('.nav-toggle');
const navContent = document.querySelector('.nav-content');
const navMenu = document.getElementById('nav-menu');
const navbar = document.querySelector('.navbar');
const header = document.querySelector('header');

// Navbar scroll behavior
let lastScrollTop = 0;
let scrollTimer = null;

function handleScroll() {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  
  // Add scrolled class when scrolled down
  if (scrollTop > 50) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
  
  // Show/hide navbar based on scroll direction
  if (scrollTop > lastScrollTop && scrollTop > 100) {
    // Scrolling down - hide navbar
    header.classList.add('hidden');
    header.classList.remove('visible');
  } else {
    // Scrolling up - show navbar
    header.classList.remove('hidden');
    header.classList.add('visible');
  }
  
  lastScrollTop = scrollTop <= 0 ? 0 : scrollTop; // For Mobile or negative scrolling
}

// Throttled scroll event
function throttledScroll() {
  if (scrollTimer) return;
  
  scrollTimer = setTimeout(() => {
    handleScroll();
    scrollTimer = null;
  }, 10);
}

// Add scroll event listener
window.addEventListener('scroll', throttledScroll, { passive: true });

// Initialize header state
header.classList.add('visible');

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
  
  // Initialize with home section active
  updateActiveNavLink('#home');
});

// Enhanced donation selection
document.querySelectorAll('.donation-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    document.querySelectorAll('.donation-btn').forEach(b => b.classList.remove('active'));
    this.classList.add('active');
    
    if (this.dataset.amount === 'custom') {
      const customAmount = prompt('Enter your custom donation amount:');
      if (customAmount && !isNaN(customAmount) && customAmount > 0) {
        this.innerHTML = `<span>$${customAmount}</span>`;
      }
    }
  });
});

// Modern form handling
function showModernAlert(message) {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed; top: 20px; right: 20px; z-index: 9999;
    background: linear-gradient(135deg, #10b981, #059669);
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
    setTimeout(() => document.body.removeChild(notification), 300);
  }, 4000);
}

document.querySelector('.volunteer-form')?.addEventListener('submit', function(e) {
  e.preventDefault();
  showModernAlert('Thank you for your interest in volunteering! We will contact you soon.');
  this.reset();
});

document.querySelector('.contact-form')?.addEventListener('submit', function(e) {
  e.preventDefault();
  showModernAlert('Thank you for your message! We will get back to you soon.');
  this.reset();
});

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
  const animateElements = document.querySelectorAll('.section, .project-card, .news-card, .team-member');
  
  animateElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
    observer.observe(el);
  });
  
  const style = document.createElement('style');
  style.textContent = `.donation-btn.active { background: linear-gradient(135deg, #06b6d4, #0891b2) !important; color: white !important; }`;
  document.head.appendChild(style);
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
      const mailtoLink = `mailto:info@sccf.org?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
      
      // Open email client
      window.location.href = mailtoLink;
      
      // Show success message
      showFormMessage('Thank you for your message! Your email client should open shortly. If it doesn\'t, please copy the information and send it manually to info@sccf.org', 'success');
      
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

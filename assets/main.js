// Enhanced Responsive Navigation for Modern SCCF Website
const navToggle = document.querySelector('.nav-toggle');
const navContent = document.querySelector('.nav-content');
const navMenu = document.getElementById('nav-menu');
const navbar = document.querySelector('.navbar');

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
  
  // Modern navbar scroll effect
  let scrollTimeout;
  window.addEventListener('scroll', () => {
    // Clear timeout to prevent excessive function calls
    if (scrollTimeout) {
      clearTimeout(scrollTimeout);
    }
    
    scrollTimeout = setTimeout(() => {
      if (navbar) {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > 50) {
          navbar.style.background = 'rgba(255, 255, 255, 0.98)';
          navbar.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
        } else {
          navbar.style.background = 'rgba(255, 255, 255, 0.95)';
          navbar.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
        }
      }
      
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

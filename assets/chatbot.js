// ============================================
// SCCF AI CHATBOT & TRANSLATION SYSTEM
// Secure API calls through Vercel serverless functions
// ============================================

(function() {
  'use strict';

  // ============================================
  // CONFIGURATION
  // ============================================
  const CONFIG = {
    // API endpoints - these call your Vercel serverless functions
    // The actual API key is stored securely on Vercel, NOT here
    API_BASE: '', // Empty for same-origin, or set to your Vercel URL
    TRANSLATE_ENDPOINT: '/api/translate',
    CHAT_ENDPOINT: '/api/chat',
    
    // Fallback for local development (uses static translations)
    USE_FALLBACK: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  };

  // ============================================
  // AI TRANSLATION SERVICE
  // ============================================
  const TranslationService = {
    cache: new Map(),
    currentLang: 'en',

    async translate(text, targetLang) {
      if (!text || text.trim() === '') return text;
      
      // Check cache first
      const cacheKey = `${text}_${targetLang}`;
      if (this.cache.has(cacheKey)) {
        return this.cache.get(cacheKey);
      }

      // For local development without API, return original
      if (CONFIG.USE_FALLBACK) {
        console.log('[Translation] Fallback mode - API not available locally');
        return text;
      }

      try {
        const response = await fetch(`${CONFIG.API_BASE}${CONFIG.TRANSLATE_ENDPOINT}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: text,
            targetLang: targetLang
          })
        });

        if (!response.ok) {
          throw new Error(`Translation failed: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.success && data.translation) {
          // Cache the result
          this.cache.set(cacheKey, data.translation);
          return data.translation;
        }

        return text;
      } catch (error) {
        console.error('[Translation Error]', error);
        return text; // Return original on error
      }
    },

    // Translate all dynamic content on the page
    async translatePage(targetLang) {
      this.currentLang = targetLang;
      
      // Find elements that need AI translation (those without data-en/si/ta attributes)
      const dynamicElements = document.querySelectorAll('[data-translate-ai]');
      
      for (const element of dynamicElements) {
        const originalText = element.dataset.originalText || element.textContent;
        element.dataset.originalText = originalText;
        
        const translated = await this.translate(originalText, targetLang);
        element.textContent = translated;
      }
    }
  };

  // ============================================
  // AI CHATBOT WIDGET
  // ============================================
  const ChatBot = {
    isOpen: false,
    conversationHistory: [],
    currentLang: 'en',

    // Initialize the chatbot
    init() {
      this.createWidget();
      this.attachEventListeners();
      this.loadConversation();
      
      // Sync with page language
      const savedLang = localStorage.getItem('preferredLanguage') || 'en';
      this.currentLang = savedLang;
      this.updateLanguageButtons();
    },

    // Create the chat widget HTML
    createWidget() {
      const widgetHTML = `
        <!-- Chat Toggle Button -->
        <button class="chat-toggle-btn" id="chat-toggle" aria-label="Open chat">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
          <span class="chat-notification" id="chat-notification" style="display: none;">1</span>
        </button>

        <!-- Chat Widget -->
        <div class="chat-widget" id="chat-widget">
          <!-- Header -->
          <div class="chat-header">
            <div class="chat-avatar">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
                <line x1="9" y1="9" x2="9.01" y2="9"></line>
                <line x1="15" y1="9" x2="15.01" y2="9"></line>
              </svg>
            </div>
            <div class="chat-header-info">
              <h3 class="chat-header-title" data-en="SCCF Assistant" data-si="SCCF සහායක" data-ta="SCCF உதவியாளர்">SCCF Assistant</h3>
              <span class="chat-header-status">
                <span class="status-dot"></span>
                <span data-en="Online" data-si="සබැඳි" data-ta="நிகழ்நிலையில்">Online</span>
              </span>
            </div>
            <button class="chat-close-btn" id="chat-close" aria-label="Close chat">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <!-- Language Selector -->
          <div class="chat-lang-selector">
            <button class="chat-lang-btn active" data-lang="en">English</button>
            <button class="chat-lang-btn" data-lang="si">සිංහල</button>
            <button class="chat-lang-btn" data-lang="ta">தமிழ்</button>
          </div>

          <!-- Messages Area -->
          <div class="chat-messages" id="chat-messages">
            <div class="welcome-message">
              <h4 data-en="Welcome to SCCF!" data-si="SCCF වෙත සාදරයෙන් පිළිගනිමු!" data-ta="SCCF க்கு வரவேற்கிறோம்!">Welcome to SCCF!</h4>
              <p data-en="How can I help you today?" data-si="අද මම ඔබට කෙසේ උදව් කළ හැකිද?" data-ta="இன்று நான் உங்களுக்கு எப்படி உதவ முடியும்?">How can I help you today?</p>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="chat-quick-actions" id="chat-quick-actions">
            <button class="quick-action-btn" data-message="What projects does SCCF work on?">Our Projects</button>
            <button class="quick-action-btn" data-message="How can I volunteer with SCCF?">Volunteer</button>
            <button class="quick-action-btn" data-message="How can I donate to SCCF?">Donate</button>
            <button class="quick-action-btn" data-message="How can I contact SCCF?">Contact</button>
          </div>

          <!-- Input Area -->
          <div class="chat-input-container">
            <div class="chat-input-wrapper">
              <textarea 
                class="chat-input" 
                id="chat-input" 
                placeholder="Type your message..."
                rows="1"
                aria-label="Chat message input"
              ></textarea>
              <button class="chat-send-btn" id="chat-send" aria-label="Send message">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
              </button>
            </div>
          </div>
        </div>
      `;

      // Append to body
      const container = document.createElement('div');
      container.id = 'sccf-chatbot';
      container.innerHTML = widgetHTML;
      document.body.appendChild(container);
    },

    // Attach event listeners
    attachEventListeners() {
      // Toggle chat
      document.getElementById('chat-toggle').addEventListener('click', () => this.toggle());
      document.getElementById('chat-close').addEventListener('click', () => this.close());

      // Send message
      document.getElementById('chat-send').addEventListener('click', () => this.sendMessage());
      document.getElementById('chat-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.sendMessage();
        }
      });

      // Auto-resize textarea
      document.getElementById('chat-input').addEventListener('input', (e) => {
        e.target.style.height = 'auto';
        e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px';
      });

      // Quick actions
      document.querySelectorAll('.quick-action-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const message = btn.dataset.message;
          document.getElementById('chat-input').value = message;
          this.sendMessage();
        });
      });

      // Language selector
      document.querySelectorAll('.chat-lang-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          this.currentLang = btn.dataset.lang;
          this.updateLanguageButtons();
          this.updatePlaceholder();
        });
      });

      // Close on escape
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.isOpen) {
          this.close();
        }
      });
    },

    // Toggle chat open/close
    toggle() {
      this.isOpen ? this.close() : this.open();
    },

    open() {
      this.isOpen = true;
      document.getElementById('chat-widget').classList.add('open');
      document.getElementById('chat-toggle').classList.add('active');
      document.getElementById('chat-notification').style.display = 'none';
      document.getElementById('chat-input').focus();
    },

    close() {
      this.isOpen = false;
      document.getElementById('chat-widget').classList.remove('open');
      document.getElementById('chat-toggle').classList.remove('active');
    },

    // Update language buttons
    updateLanguageButtons() {
      document.querySelectorAll('.chat-lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === this.currentLang);
      });
    },

    // Update placeholder based on language
    updatePlaceholder() {
      const placeholders = {
        'en': 'Type your message...',
        'si': 'ඔබේ පණිවිඩය ටයිප් කරන්න...',
        'ta': 'உங்கள் செய்தியை தட்டச்சு செய்யுங்கள்...'
      };
      document.getElementById('chat-input').placeholder = placeholders[this.currentLang] || placeholders['en'];
    },

    // Send message
    async sendMessage() {
      const input = document.getElementById('chat-input');
      const message = input.value.trim();

      if (!message) return;

      // Clear input
      input.value = '';
      input.style.height = 'auto';

      // Hide quick actions after first message
      document.getElementById('chat-quick-actions').style.display = 'none';

      // Add user message to UI
      this.addMessage(message, 'user');

      // Save to history
      this.conversationHistory.push({ role: 'user', content: message });

      // Show typing indicator
      this.showTyping();

      try {
        // Check if we're in fallback mode
        if (CONFIG.USE_FALLBACK) {
          // Simulate response for local development
          setTimeout(() => {
            this.hideTyping();
            const fallbackResponse = this.getFallbackResponse(message);
            this.addMessage(fallbackResponse, 'bot');
            this.conversationHistory.push({ role: 'assistant', content: fallbackResponse });
            this.saveConversation();
          }, 1000);
          return;
        }

        // Call the secure Vercel API
        const response = await fetch(`${CONFIG.API_BASE}${CONFIG.CHAT_ENDPOINT}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: message,
            language: this.currentLang,
            conversationHistory: this.conversationHistory.slice(-10) // Last 10 messages for context
          })
        });

        this.hideTyping();

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.success && data.response) {
          this.addMessage(data.response, 'bot');
          this.conversationHistory.push({ role: 'assistant', content: data.response });
        } else {
          throw new Error('Invalid response');
        }

      } catch (error) {
        console.error('[Chat Error]', error);
        this.hideTyping();
        
        const errorMessages = {
          'en': "Sorry, I'm having trouble connecting. Please try again or contact us at contact@sccflk.org",
          'si': "සමාවන්න, සම්බන්ධ වීමේ ගැටලුවක් ඇත. නැවත උත්සාහ කරන්න හෝ contact@sccflk.org වෙත අමතන්න",
          'ta': "மன்னிக்கவும், இணைப்பில் சிக்கல் உள்ளது. மீண்டும் முயற்சிக்கவும் அல்லது contact@sccflk.org ஐ தொடர்பு கொள்ளவும்"
        };
        
        this.addMessage(errorMessages[this.currentLang] || errorMessages['en'], 'bot');
      }

      this.saveConversation();
    },

    // Fallback responses for local development
    getFallbackResponse(message) {
      const lowerMessage = message.toLowerCase();
      
      if (lowerMessage.includes('project')) {
        return "SCCF works on civic education, youth empowerment, community development, and human rights awareness programs across Sri Lanka. Visit our Projects page to learn more!";
      }
      if (lowerMessage.includes('volunteer')) {
        return "We'd love to have you volunteer! You can sign up through our Get Involved section on the website, or email us at contact@sccflk.org";
      }
      if (lowerMessage.includes('donat')) {
        return "Thank you for your interest in supporting SCCF! Please contact us at contact@sccflk.org for donation information.";
      }
      if (lowerMessage.includes('contact')) {
        return "You can reach us at:\n📧 Email: contact@sccflk.org\n📱 WhatsApp: +94 70 136 5412\n🌐 Website: sccflk.org";
      }
      
      return "Thank you for your message! For the best experience with our AI assistant, please access the website from our hosted domain. In the meantime, feel free to explore our website or contact us at contact@sccflk.org";
    },

    // Add message to UI
    addMessage(text, sender) {
      const messagesContainer = document.getElementById('chat-messages');
      const welcomeMessage = messagesContainer.querySelector('.welcome-message');
      
      // Remove welcome message on first real message
      if (welcomeMessage) {
        welcomeMessage.remove();
      }

      const messageDiv = document.createElement('div');
      messageDiv.className = `chat-message ${sender}`;
      
      const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      messageDiv.innerHTML = `
        <div class="message-content">${this.formatMessage(text)}</div>
        <div class="message-time">${time}</div>
      `;

      messagesContainer.appendChild(messageDiv);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    },

    // Format message (convert newlines, links, etc.)
    formatMessage(text) {
      return text
        .replace(/\n/g, '<br>')
        .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>')
        .replace(/📧|📱|🌐/g, match => `<span style="font-size: 1.1em">${match}</span>`);
    },

    // Show typing indicator
    showTyping() {
      const messagesContainer = document.getElementById('chat-messages');
      const typingDiv = document.createElement('div');
      typingDiv.className = 'chat-message bot';
      typingDiv.id = 'typing-indicator';
      typingDiv.innerHTML = `
        <div class="typing-indicator">
          <span></span>
          <span></span>
          <span></span>
        </div>
      `;
      messagesContainer.appendChild(typingDiv);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    },

    // Hide typing indicator
    hideTyping() {
      const typing = document.getElementById('typing-indicator');
      if (typing) typing.remove();
    },

    // Save conversation to localStorage
    saveConversation() {
      try {
        localStorage.setItem('sccf_chat_history', JSON.stringify(this.conversationHistory.slice(-20)));
      } catch (e) {
        console.warn('Could not save chat history');
      }
    },

    // Load conversation from localStorage
    loadConversation() {
      try {
        const saved = localStorage.getItem('sccf_chat_history');
        if (saved) {
          this.conversationHistory = JSON.parse(saved);
          // Optionally restore messages to UI
          // this.restoreMessages();
        }
      } catch (e) {
        console.warn('Could not load chat history');
      }
    }
  };

  // ============================================
  // INITIALIZE ON DOM READY
  // ============================================
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => ChatBot.init());
  } else {
    ChatBot.init();
  }

  // Expose for external use
  window.SCCFChatBot = ChatBot;
  window.SCCFTranslation = TranslationService;

})();

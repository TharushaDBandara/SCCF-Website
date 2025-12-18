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
    USE_FALLBACK: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1',
    
    // Translation batch settings
    BATCH_SIZE: 20, // Number of texts to translate at once
    TRANSLATION_DELAY: 50 // Delay between batches (ms)
  };

  // ============================================
  // AI TRANSLATION SERVICE
  // ============================================
  const TranslationService = {
    cache: new Map(),
    currentLang: 'en',
    isTranslating: false,
    pendingQueue: [],

    // Initialize and load cached translations from sessionStorage
    init() {
      try {
        const cached = sessionStorage.getItem('sccf_translations');
        if (cached) {
          const parsed = JSON.parse(cached);
          Object.entries(parsed).forEach(([key, value]) => {
            this.cache.set(key, value);
          });
        }
      } catch (e) {
        console.log('[Translation] No cached translations found');
      }
    },

    // Save cache to sessionStorage
    saveCache() {
      try {
        const obj = {};
        this.cache.forEach((value, key) => {
          obj[key] = value;
        });
        sessionStorage.setItem('sccf_translations', JSON.stringify(obj));
      } catch (e) {
        // Storage might be full, ignore
      }
    },

    // Single text translation
    async translate(text, targetLang) {
      if (!text || text.trim() === '' || targetLang === 'en') return text;
      
      // Check cache first
      const cacheKey = `${text.substring(0, 100)}_${targetLang}`;
      if (this.cache.has(cacheKey)) {
        return this.cache.get(cacheKey);
      }

      // For local development without API, return original
      if (CONFIG.USE_FALLBACK) {
        return text;
      }

      try {
        const response = await fetch(`${CONFIG.API_BASE}${CONFIG.TRANSLATE_ENDPOINT}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, targetLang })
        });

        if (!response.ok) throw new Error(`Translation failed: ${response.status}`);

        const data = await response.json();
        
        if (data.success && data.translation) {
          this.cache.set(cacheKey, data.translation);
          this.saveCache();
          return data.translation;
        }

        return text;
      } catch (error) {
        console.error('[Translation Error]', error);
        return text;
      }
    },

    // Batch translation for multiple texts
    async translateBatch(texts, targetLang) {
      if (!texts || texts.length === 0 || targetLang === 'en') return texts;

      // Filter out already cached texts
      const uncached = [];
      const results = new Map();

      texts.forEach((text, index) => {
        if (!text || text.trim() === '') {
          results.set(index, text);
          return;
        }
        
        const cacheKey = `${text.substring(0, 100)}_${targetLang}`;
        if (this.cache.has(cacheKey)) {
          results.set(index, this.cache.get(cacheKey));
        } else {
          uncached.push({ index, text, cacheKey });
        }
      });

      // If all cached, return immediately
      if (uncached.length === 0) {
        return texts.map((_, i) => results.get(i));
      }

      // For local development, return original texts
      if (CONFIG.USE_FALLBACK) {
        return texts;
      }

      try {
        const response = await fetch(`${CONFIG.API_BASE}${CONFIG.TRANSLATE_ENDPOINT}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            texts: uncached.map(u => u.text), 
            targetLang 
          })
        });

        if (!response.ok) throw new Error(`Batch translation failed: ${response.status}`);

        const data = await response.json();
        
        if (data.success && data.translations) {
          data.translations.forEach((item, i) => {
            const { index, cacheKey } = uncached[i];
            const translation = item.translation || item.original;
            results.set(index, translation);
            this.cache.set(cacheKey, translation);
          });
          this.saveCache();
        }

        return texts.map((_, i) => results.get(i) || texts[i]);
      } catch (error) {
        console.error('[Batch Translation Error]', error);
        return texts;
      }
    },

    // Translate page elements that need AI translation
    async translatePageElements(targetLang) {
      if (this.isTranslating || targetLang === 'en') return;
      
      this.currentLang = targetLang;
      this.isTranslating = true;

      // Show translation indicator
      this.showTranslatingIndicator();

      try {
        // Find elements without manual translations for target language
        const elements = document.querySelectorAll('[data-en]');
        const needsTranslation = [];

        elements.forEach(el => {
          const hasManualTranslation = el.getAttribute(`data-${targetLang}`);
          if (!hasManualTranslation) {
            const englishText = el.getAttribute('data-en');
            if (englishText && englishText.trim()) {
              needsTranslation.push({ el, text: englishText });
            }
          }
        });

        if (needsTranslation.length === 0) {
          this.hideTranslatingIndicator();
          this.isTranslating = false;
          return;
        }

        console.log(`[Translation] Translating ${needsTranslation.length} elements to ${targetLang}`);

        // Process in batches
        for (let i = 0; i < needsTranslation.length; i += CONFIG.BATCH_SIZE) {
          const batch = needsTranslation.slice(i, i + CONFIG.BATCH_SIZE);
          const texts = batch.map(item => item.text);
          
          const translations = await this.translateBatch(texts, targetLang);
          
          // Apply translations
          batch.forEach((item, index) => {
            const translation = translations[index];
            if (translation && translation !== item.text) {
              // Store the AI translation
              item.el.setAttribute(`data-${targetLang}`, translation);
              item.el.textContent = translation;
            }
          });

          // Small delay between batches to avoid rate limiting
          if (i + CONFIG.BATCH_SIZE < needsTranslation.length) {
            await new Promise(resolve => setTimeout(resolve, CONFIG.TRANSLATION_DELAY));
          }
        }

        console.log(`[Translation] Completed translating to ${targetLang}`);
      } catch (error) {
        console.error('[Page Translation Error]', error);
      } finally {
        this.hideTranslatingIndicator();
        this.isTranslating = false;
      }
    },

    // Show a subtle indicator that translation is in progress
    showTranslatingIndicator() {
      if (document.getElementById('sccf-translating-indicator')) return;
      
      const indicator = document.createElement('div');
      indicator.id = 'sccf-translating-indicator';
      indicator.innerHTML = `
        <div class="translating-content">
          <svg class="translating-spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10" stroke-dasharray="60" stroke-dashoffset="20"/>
          </svg>
          <span data-en="Translating..." data-si="පරිවර්තනය කරමින්..." data-ta="மொழிபெயர்க்கிறது...">Translating...</span>
        </div>
      `;
      indicator.style.cssText = `
        position: fixed;
        bottom: 100px;
        right: 24px;
        background: linear-gradient(135deg, #152530 0%, #1e3a4c 100%);
        color: white;
        padding: 10px 16px;
        border-radius: 24px;
        font-size: 0.85rem;
        font-weight: 500;
        z-index: 9998;
        box-shadow: 0 4px 20px rgba(0,0,0,0.2);
        animation: slideInUp 0.3s ease;
      `;
      
      // Add CSS animation
      if (!document.getElementById('sccf-translation-styles')) {
        const style = document.createElement('style');
        style.id = 'sccf-translation-styles';
        style.textContent = `
          @keyframes slideInUp {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          .translating-content {
            display: flex;
            align-items: center;
            gap: 8px;
          }
          .translating-spinner {
            width: 16px;
            height: 16px;
            animation: spin 1s linear infinite;
          }
        `;
        document.head.appendChild(style);
      }
      
      document.body.appendChild(indicator);
    },

    hideTranslatingIndicator() {
      const indicator = document.getElementById('sccf-translating-indicator');
      if (indicator) {
        indicator.style.animation = 'slideInUp 0.3s ease reverse';
        setTimeout(() => indicator.remove(), 300);
      }
    }
  };

  // Initialize translation service
  TranslationService.init();

  // Expose to global scope for main.js integration
  window.SCCFTranslationService = TranslationService;
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
      this.updatePlaceholder();
      this.updateQuickActions();
      this.updateWelcomeMessage();
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
              <div class="welcome-emoji">👋</div>
              <h4 data-en="Hi there! Welcome to SCCF" data-si="ආයුබෝවන්! SCCF වෙත සාදරයෙන් පිළිගනිමු" data-ta="வணக்கம்! SCCF க்கு வரவேற்கிறோம்">Hi there! Welcome to SCCF</h4>
              <p data-en="I'm here to help you learn about our work. Ask me anything! 😊" data-si="අපගේ වැඩ ගැන දැන ගැනීමට මම මෙහි සිටිමි. ඕනෑම දෙයක් අහන්න! 😊" data-ta="எங்கள் பணிகளைப் பற்றி அறிய நான் இங்கே இருக்கிறேன். எதையும் கேளுங்கள்! 😊">I'm here to help you learn about our work. Ask me anything! 😊</p>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="chat-quick-actions" id="chat-quick-actions">
            <button class="quick-action-btn" data-message-en="What projects does SCCF work on?" data-message-si="SCCF කුමන ව්‍යාපෘති වලද ක්‍රියා කරන්නේ?" data-message-ta="SCCF என்ன திட்டங்களில் செயல்படுகிறது?" data-en="🎯 Our Projects" data-si="🎯 ව්‍යාපෘති" data-ta="🎯 திட்டங்கள்">🎯 Our Projects</button>
            <button class="quick-action-btn" data-message-en="How can I volunteer with SCCF?" data-message-si="මම SCCF සමඟ ස්වේච්ඡාවෙන් සේවය කරන්නේ කෙසේද?" data-message-ta="SCCF உடன் தன்னார்வத் தொண்டு செய்வது எப்படி?" data-en="🤝 Volunteer" data-si="🤝 ස්වේච්ඡා" data-ta="🤝 தன்னார்வலர்">🤝 Volunteer</button>
            <button class="quick-action-btn" data-message-en="How can I donate to support SCCF?" data-message-si="SCCF සඳහා ආධාර කිරීමට මට කෙසේ පරිත්‍යාග කළ හැකිද?" data-message-ta="SCCF க்கு நன்கொடை வழங்குவது எப்படி?" data-en="💝 Donate" data-si="💝 පරිත්‍යාග" data-ta="💝 நன்கொடை">💝 Donate</button>
            <button class="quick-action-btn" data-message-en="How can I contact SCCF?" data-message-si="SCCF අමතන්නේ කෙසේද?" data-message-ta="SCCF ஐ தொடர்பு கொள்வது எப்படி?" data-en="📞 Contact Us" data-si="📞 අමතන්න" data-ta="📞 தொடர்பு">📞 Contact Us</button>
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

      // Quick actions - use language-specific messages
      document.querySelectorAll('.quick-action-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const langKey = `data-message-${this.currentLang}`;
          const message = btn.getAttribute(langKey) || btn.dataset.messageEn || btn.dataset.message;
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
          this.updateQuickActions();
          this.updateWelcomeMessage();
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

    // Update quick action buttons text based on language
    updateQuickActions() {
      document.querySelectorAll('.quick-action-btn').forEach(btn => {
        const text = btn.getAttribute(`data-${this.currentLang}`) || btn.getAttribute('data-en');
        if (text) btn.textContent = text;
      });
    },

    // Update welcome message based on language
    updateWelcomeMessage() {
      const welcomeEl = document.querySelector('.welcome-message');
      if (welcomeEl) {
        const h4 = welcomeEl.querySelector('h4');
        const p = welcomeEl.querySelector('p');
        if (h4) h4.textContent = h4.getAttribute(`data-${this.currentLang}`) || h4.getAttribute('data-en');
        if (p) p.textContent = p.getAttribute(`data-${this.currentLang}`) || p.getAttribute('data-en');
      }
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

    // Fallback responses for local development - more friendly!
    getFallbackResponse(message) {
      const lowerMessage = message.toLowerCase();
      const lang = this.currentLang;
      
      // Check for Sinhala/Tamil script in the message
      const hasSinhala = /[\u0D80-\u0DFF]/.test(message);
      const hasTamil = /[\u0B80-\u0BFF]/.test(message);
      const detectedLang = hasSinhala ? 'si' : hasTamil ? 'ta' : lang;
      
      const responses = {
        project: {
          en: "Great question! 🎯 SCCF works on civic education, youth empowerment, and community development across Sri Lanka. We run NIC mobile services, voter education programs, and human rights training. Check out our Projects page for more details!",
          si: "හොඳ ප්‍රශ්නයක්! 🎯 SCCF ශ්‍රී ලංකාව පුරා පුරවැසි අධ්‍යාපනය, තරුණ සවිබලගැන්වීම සහ ප්‍රජා සංවර්ධනය සඳහා ක්‍රියා කරයි. අපි NIC ජංගම සේවා, ඡන්දදායක අධ්‍යාපන වැඩසටහන් සහ මානව හිමිකම් පුහුණුව පවත්වමු. වැඩි විස්තර සඳහා අපගේ ව්‍යාපෘති පිටුව බලන්න!",
          ta: "நல்ல கேள்வி! 🎯 SCCF இலங்கை முழுவதும் குடிமை கல்வி, இளைஞர் அதிகாரமளித்தல் மற்றும் சமூக மேம்பாட்டில் செயல்படுகிறது. NIC மொபைல் சேவைகள், வாக்காளர் கல்வி நிகழ்ச்சிகள் மற்றும் மனித உரிமைகள் பயிற்சி நடத்துகிறோம். மேலும் விவரங்களுக்கு எங்கள் திட்டங்கள் பக்கத்தைப் பாருங்கள்!"
        },
        volunteer: {
          en: "We'd love to have you on our team! 🤝 You can sign up through the 'Get Involved' section on our website. Or email us at contact@sccflk.org - we'll get back to you soon!",
          si: "ඔබ අපේ කණ්ඩායමට එකතු වීමට අපි සතුටු වෙමු! 🤝 ඔබට අපගේ වෙබ් අඩවියේ 'සහභාගී වන්න' කොටස හරහා ලියාපදිංචි විය හැක. නැතහොත් contact@sccflk.org වෙත ඊමේල් කරන්න - අපි ඉක්මනින් ඔබව සම්බන්ධ කර ගනිමු!",
          ta: "நீங்கள் எங்கள் குழுவில் சேர்வதை நாங்கள் விரும்புகிறோம்! 🤝 எங்கள் இணையதளத்தில் 'ஈடுபடுங்கள்' பகுதி மூலம் பதிவு செய்யலாம். அல்லது contact@sccflk.org க்கு மின்னஞ்சல் அனுப்புங்கள் - விரைவில் தொடர்பு கொள்வோம்!"
        },
        donate: {
          en: "Thank you so much for wanting to support our work! 💝 Your contribution makes a real difference. Please email us at contact@sccflk.org for donation details. Every bit helps!",
          si: "අපගේ වැඩට සහාය වීමට කැමති වීම ගැන ඔබට බොහොම ස්තූතියි! 💝 ඔබේ දායකත්වය සැබෑ වෙනසක් ඇති කරයි. පරිත්‍යාග විස්තර සඳහා contact@sccflk.org වෙත ඊමේල් කරන්න. සෑම දායකත්වයක්ම වැදගත්!",
          ta: "எங்கள் பணிக்கு ஆதரவளிக்க விரும்புவதற்கு மிக்க நன்றி! 💝 உங்கள் பங்களிப்பு உண்மையான மாற்றத்தை ஏற்படுத்துகிறது. நன்கொடை விவரங்களுக்கு contact@sccflk.org க்கு மின்னஞ்சல் அனுப்புங்கள். ஒவ்வொரு பங்களிப்பும் முக்கியம்!"
        },
        contact: {
          en: "Here's how you can reach us! 📞\n\n📧 Email: contact@sccflk.org\n💬 WhatsApp: +94 70 136 5412\n🌐 Website: www.sccflk.org\n\nWe usually respond within 24 hours!",
          si: "ඔබට අප සම්බන්ධ කර ගත හැකි ආකාරය මෙන්න! 📞\n\n📧 ඊමේල්: contact@sccflk.org\n💬 WhatsApp: +94 70 136 5412\n🌐 වෙබ් අඩවිය: www.sccflk.org\n\nඅපි සාමාන්‍යයෙන් පැය 24ක් ඇතුළත ප්‍රතිචාර දක්වමු!",
          ta: "எங்களை தொடர்பு கொள்ள வழிகள்! 📞\n\n📧 மின்னஞ்சல்: contact@sccflk.org\n💬 WhatsApp: +94 70 136 5412\n🌐 இணையதளம்: www.sccflk.org\n\nநாங்கள் வழக்கமாக 24 மணி நேரத்திற்குள் பதிலளிப்போம்!"
        },
        default: {
          en: "Thanks for your message! 😊 For the best AI-powered experience, please visit our hosted website at sccflk.org. In the meantime, feel free to explore the site or contact us at contact@sccflk.org - we're always happy to help!",
          si: "ඔබේ පණිවිඩයට ස්තූතියි! 😊 හොඳම AI අත්දැකීම සඳහා, කරුණාකර sccflk.org හි අපගේ වෙබ් අඩවියට පිවිසෙන්න. එතෙක්, වෙබ් අඩවිය ගවේෂණය කරන්න හෝ contact@sccflk.org වෙත අපව සම්බන්ධ කර ගන්න - අපි සැමවිටම උදව් කිරීමට සතුටු වෙමු!",
          ta: "உங்கள் செய்திக்கு நன்றி! 😊 சிறந்த AI அனுபவத்திற்கு, sccflk.org இல் எங்கள் இணையதளத்தைப் பார்வையிடவும். இதற்கிடையில், தளத்தை ஆராயுங்கள் அல்லது contact@sccflk.org இல் எங்களை தொடர்பு கொள்ளுங்கள் - உதவ எப்போதும் மகிழ்ச்சி!"
        }
      };
      
      if (lowerMessage.includes('project') || lowerMessage.includes('ව්‍යාපෘති') || lowerMessage.includes('திட்ட')) {
        return responses.project[detectedLang];
      }
      if (lowerMessage.includes('volunteer') || lowerMessage.includes('ස්වේච්ඡා') || lowerMessage.includes('தன்னார்வ')) {
        return responses.volunteer[detectedLang];
      }
      if (lowerMessage.includes('donat') || lowerMessage.includes('පරිත්‍යාග') || lowerMessage.includes('நன்கொடை')) {
        return responses.donate[detectedLang];
      }
      if (lowerMessage.includes('contact') || lowerMessage.includes('අමත') || lowerMessage.includes('தொடர்பு')) {
        return responses.contact[detectedLang];
      }
      
      return responses.default[detectedLang];
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

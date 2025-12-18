// Vercel Serverless Function for AI Translation
// API Key is stored securely in Vercel Environment Variables

export default async function handler(req, res) {
  // Enable CORS for your domain
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { text, texts, targetLang } = req.body;

    // Support both single text and batch translations
    const isBatch = Array.isArray(texts) && texts.length > 0;
    const textsToTranslate = isBatch ? texts : [text];

    if ((!text && !isBatch) || !targetLang) {
      return res.status(400).json({ error: 'Missing text or targetLang' });
    }

    // Language mapping
    const langNames = {
      'en': 'English',
      'si': 'Sinhala (සිංහල)',
      'ta': 'Tamil (தமிழ்)'
    };

    const targetLanguage = langNames[targetLang] || targetLang;

    // For batch translations, join texts with special separator
    const separator = '|||TRANSLATE_SEP|||';
    const combinedText = textsToTranslate.join(separator);

    // Call Gemini API using the secure environment variable
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are a professional translator for SCCF (Social Community Contribution Foundation), an NGO website in Sri Lanka. Translate the following text(s) to ${targetLanguage}.

CRITICAL RULES:
1. Return ONLY the translated text(s), nothing else - no explanations, no notes
2. Maintain the exact same tone, formality, and formatting
3. Keep these unchanged: "SCCF", email addresses, phone numbers, URLs, dates, numbers
4. If multiple texts are separated by "${separator}", translate each one and keep them separated by the same separator
5. If text is already in ${targetLanguage}, return it unchanged
6. For Sinhala: Use proper සිංහල script, natural and warm tone
7. For Tamil: Use proper தமிழ் script, respectful and clear tone
8. Keep translations concise - don't add words unnecessarily

Text(s) to translate:
${combinedText}`
            }]
          }],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 2048,
          }
        })
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const translatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || combinedText;

    // Split back if batch translation
    if (isBatch) {
      const translations = translatedText.split(separator).map(t => t.trim());
      
      // Ensure we have the same number of translations as inputs
      const results = textsToTranslate.map((original, i) => ({
        original,
        translation: translations[i] || original
      }));

      return res.status(200).json({ 
        success: true,
        translations: results,
        targetLang: targetLang,
        count: results.length
      });
    }

    return res.status(200).json({ 
      success: true,
      translation: translatedText.trim(),
      originalLang: detectLanguage(text),
      targetLang: targetLang
    });

  } catch (error) {
    console.error('Translation error:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Translation failed. Please try again.' 
    });
  }
}

// Simple language detection helper
function detectLanguage(text) {
  const sinhalaPattern = /[\u0D80-\u0DFF]/;
  const tamilPattern = /[\u0B80-\u0BFF]/;
  
  if (sinhalaPattern.test(text)) return 'si';
  if (tamilPattern.test(text)) return 'ta';
  return 'en';
}

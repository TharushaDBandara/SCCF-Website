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
    const { text, targetLang } = req.body;

    if (!text || !targetLang) {
      return res.status(400).json({ error: 'Missing text or targetLang' });
    }

    // Language mapping
    const langNames = {
      'en': 'English',
      'si': 'Sinhala (සිංහල)',
      'ta': 'Tamil (தமிழ்)'
    };

    const targetLanguage = langNames[targetLang] || targetLang;

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
              text: `You are a professional translator for an NGO website. Translate the following text to ${targetLanguage}. 
              
Rules:
- Return ONLY the translated text, nothing else
- Maintain the same tone and formality
- Keep proper nouns unchanged (like "SCCF", names of places)
- If the text is already in the target language, return it as-is

Text to translate:
${text}`
            }]
          }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 1024,
          }
        })
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const translatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || text;

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

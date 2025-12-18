// Vercel Serverless Function for AI Chatbot
// API Key is stored securely in Vercel Environment Variables

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, language = 'en', conversationHistory = [] } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Missing message' });
    }

    // Language instructions
    const langInstructions = {
      'en': 'Respond in English.',
      'si': 'Respond in Sinhala (සිංහල).',
      'ta': 'Respond in Tamil (தமிழ்).'
    };

    // Build conversation context
    const systemPrompt = `You are a helpful AI assistant for SCCF (Social Community Contribution Foundation), an NGO in Sri Lanka focused on civic education, youth empowerment, and community development.

About SCCF:
- Founded in 2022
- Focus areas: Civic rights education, youth political literacy, community development
- Works across multiple districts in Sri Lanka
- Provides services like NIC camps, elderly ID card programs, human rights education
- Trilingual organization (English, Sinhala, Tamil)

Your role:
- Answer questions about SCCF's work, projects, and how to get involved
- Help visitors find information about volunteering, donating, or partnering
- Provide information about ongoing projects and their impact
- Be friendly, professional, and helpful
- If you don't know specific details, guide users to contact SCCF directly at contact@sccflk.org
- Keep responses concise but informative (2-3 paragraphs max)

${langInstructions[language] || langInstructions['en']}`;

    // Build messages array
    const messages = [
      { role: 'user', parts: [{ text: systemPrompt }] },
      { role: 'model', parts: [{ text: 'I understand. I am the SCCF virtual assistant, ready to help visitors learn about our organization and how they can get involved.' }] }
    ];

    // Add conversation history
    conversationHistory.forEach(msg => {
      messages.push({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      });
    });

    // Add current message
    messages.push({
      role: 'user',
      parts: [{ text: message }]
    });

    // Call Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: messages,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 512,
            topP: 0.8,
            topK: 40
          },
          safetySettings: [
            { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' }
          ]
        })
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Gemini API error:', errorData);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!aiResponse) {
      throw new Error('No response from AI');
    }

    return res.status(200).json({
      success: true,
      response: aiResponse.trim(),
      language: language
    });

  } catch (error) {
    console.error('Chatbot error:', error);
    
    // Fallback responses based on language
    const fallbacks = {
      'en': "I'm sorry, I'm having trouble connecting right now. Please try again or contact us directly at contact@sccflk.org",
      'si': "සමාවන්න, මට දැන් සම්බන්ධ වීමේ ගැටලුවක් තිබේ. කරුණාකර නැවත උත්සාහ කරන්න හෝ contact@sccflk.org වෙත අප හා සම්බන්ධ වන්න",
      'ta': "மன்னிக்கவும், இப்போது இணைப்பதில் சிக்கல் உள்ளது. மீண்டும் முயற்சிக்கவும் அல்லது contact@sccflk.org இல் எங்களை தொடர்பு கொள்ளவும்"
    };

    return res.status(500).json({
      success: false,
      response: fallbacks[req.body?.language] || fallbacks['en'],
      error: 'Service temporarily unavailable'
    });
  }
}

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

    // Detect user's input language (simple heuristics)
    const detectLanguage = (text) => {
      const sinhalaPattern = /[\u0D80-\u0DFF]/;
      const tamilPattern = /[\u0B80-\u0BFF]/;
      if (sinhalaPattern.test(text)) return 'si';
      if (tamilPattern.test(text)) return 'ta';
      return 'en';
    };

    // Use detected language from message OR the selected UI language
    const detectedLang = detectLanguage(message);
    const responseLang = detectedLang !== 'en' ? detectedLang : language;

    // Language-specific response style
    const langInstructions = {
      'en': `Respond in friendly, conversational English. Use simple words that everyone can understand.`,
      'si': `ප්‍රතිචාර දැක්වීම සිංහල භාෂාවෙන් කරන්න. මිත්‍රශීලී සහ සරල භාෂාවක් භාවිතා කරන්න. Respond ONLY in Sinhala (සිංහල). Use warm, friendly Sinhala language.`,
      'ta': `நட்புரீதியான தமிழில் பதிலளிக்கவும். எளிய மொழியைப் பயன்படுத்தவும். Respond ONLY in Tamil (தமிழ்). Use warm, friendly Tamil language.`
    };

    // Build conversation context with improved personality
    const systemPrompt = `You are "SCCF Helper" (SCCF සහායක / SCCF உதவியாளர்) - a warm, friendly, and helpful AI assistant for SCCF (Social Community Contribution Foundation), an NGO in Sri Lanka.

🏢 About SCCF:
- Founded in 2022, working across multiple districts in Sri Lanka
- Focus areas: Civic rights education, youth empowerment, human rights awareness, community development
- Key programs: NIC mobile services, elderly ID programs, voter education, RTI awareness, human rights training
- Contact: contact@sccflk.org | WhatsApp: +94 70 136 5412
- Website: www.sccflk.org

🎯 Your Personality & Style:
- Be WARM, FRIENDLY and CONVERSATIONAL - like chatting with a helpful friend
- Use simple, easy-to-understand language
- Add appropriate emojis to make responses feel friendly (but not too many) 😊
- Keep responses SHORT and CLEAR (2-3 sentences for simple questions, max 4-5 for complex ones)
- Be encouraging and positive
- Show genuine care for the visitor

📝 Response Guidelines:
- Start with a friendly acknowledgment of their question
- Give helpful, specific information
- End with an offer to help more OR a relevant follow-up suggestion
- If you don't know something specific, warmly guide them to contact SCCF directly
- For volunteer/donation questions, be enthusiastic and welcoming!

🗣️ IMPORTANT LANGUAGE RULES:
- The user may type in English, Sinhala (සිංහල), or Tamil (தமிழ்)
- ALWAYS respond in the SAME language the user typed in
- If user types in Sinhala script, reply FULLY in Sinhala
- If user types in Tamil script, reply FULLY in Tamil
- Current UI language preference: ${responseLang}

${langInstructions[responseLang] || langInstructions['en']}

Remember: You're not just an information bot - you're a friendly helper who makes visitors feel welcome! 🌟`;

    // Build messages array with friendlier assistant intro
    const messages = [
      { role: 'user', parts: [{ text: systemPrompt }] },
      { role: 'model', parts: [{ text: responseLang === 'si' 
        ? 'ආයුබෝවන්! 😊 මම SCCF සහායකයා. ඔබට උදව් කිරීමට සතුටුයි! කුමක්ද දැන ගන්න ඕන?' 
        : responseLang === 'ta' 
        ? 'வணக்கம்! 😊 நான் SCCF உதவியாளர். உங்களுக்கு உதவ மகிழ்ச்சி! என்ன தெரிந்து கொள்ள விரும்புகிறீர்கள்?' 
        : 'Hello! 😊 I\'m the SCCF Helper. Happy to assist you! What would you like to know?' }] }
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
            temperature: 0.8,
            maxOutputTokens: 400,
            topP: 0.9,
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

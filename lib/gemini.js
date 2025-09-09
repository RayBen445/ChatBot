import { GoogleGenerativeAI } from '@google/generative-ai';

let genAI;

export const initializeGemini = () => {
  if (!genAI) {
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('Google Gemini API key not found');
    }
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
};

export const generateChatResponse = async (message, chatHistory = []) => {
  try {
    const gemini = initializeGemini();
    const model = gemini.getGenerativeModel({ model: 'gemini-pro' });

    // Create conversation context
    let conversationContext = 'You are a helpful AI assistant similar to GitHub Copilot. ';
    conversationContext += 'Provide helpful, accurate, and friendly responses. ';
    
    if (chatHistory.length > 0) {
      conversationContext += '\n\nPrevious conversation:\n';
      chatHistory.slice(-5).forEach((msg) => {
        conversationContext += `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}\n`;
      });
    }
    
    conversationContext += `\nUser: ${message}\nAssistant:`;

    const result = await model.generateContent(conversationContext);
    const response = await result.response;
    
    return {
      success: true,
      message: response.text(),
    };
  } catch (error) {
    console.error('Error generating response:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};
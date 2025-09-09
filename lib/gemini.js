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

export const generateChatResponse = async (message, chatHistory = [], options = {}) => {
  try {
    const gemini = initializeGemini();
    const model = gemini.getGenerativeModel({ model: 'gemini-pro' });

    // Create conversation context based on subscription tier
    let conversationContext = 'You are a helpful AI assistant similar to GitHub Copilot. ';
    
    // Adjust personality based on subscription tier
    if (options.priority === 'high') {
      conversationContext += 'You are in premium mode - provide comprehensive, detailed, and expert-level responses. ';
      conversationContext += 'Include advanced insights, code examples when relevant, and thorough explanations. ';
    } else if (options.priority === 'medium') {
      conversationContext += 'You are in pro mode - provide detailed and helpful responses with good examples. ';
    } else {
      conversationContext += 'Provide helpful and accurate responses. Keep responses concise but informative. ';
    }

    // Add feature-specific instructions
    if (options.features?.advancedReasoning) {
      conversationContext += 'Use advanced reasoning and provide step-by-step explanations when helpful. ';
    }
    
    if (options.features?.codeGeneration) {
      conversationContext += 'Feel free to generate code examples, suggest optimizations, and provide technical depth. ';
    }

    // Limit context based on subscription
    const contextLimit = options.features?.longContext ? 10 : 5;
    
    if (chatHistory.length > 0) {
      conversationContext += '\n\nPrevious conversation:\n';
      chatHistory.slice(-contextLimit).forEach((msg) => {
        conversationContext += `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}\n`;
      });
    }
    
    // Add response length guidance
    if (options.maxLength) {
      conversationContext += `\n\nPlease keep your response under ${options.maxLength} characters while being helpful and complete.\n`;
    }
    
    conversationContext += `\nUser: ${message}\nAssistant:`;

    const result = await model.generateContent(conversationContext);
    const response = await result.response;
    let responseText = response.text();

    // Enforce length limits for free tier
    if (options.maxLength && responseText.length > options.maxLength) {
      responseText = responseText.substring(0, options.maxLength - 3) + '...';
      
      if (options.priority === 'low') {
        responseText += '\n\n💡 Upgrade to Pro for longer, more detailed responses!';
      }
    }
    
    return {
      success: true,
      message: responseText,
    };
  } catch (error) {
    console.error('Error generating response:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};
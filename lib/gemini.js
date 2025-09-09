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

// Feature detection patterns
const FEATURE_PATTERNS = {
  codeGeneration: /(?:write|create|generate|build).{0,20}(?:code|function|class|component|script|program)/i,
  codeCompletion: /(?:complete|finish|auto[- ]complete).{0,10}(?:code|function)/i,
  debugging: /(?:debug|fix|error|bug|troubleshoot|why.{0,10}not.{0,10}work)/i,
  codeExplanation: /(?:explain|what does|how does|understand).{0,20}(?:code|function|this)/i,
  codeRefactoring: /(?:refactor|improve|optimize|clean up|rewrite)/i,
  syntaxCorrection: /(?:syntax|correct|fix).{0,10}(?:error|mistake)/i,
  testGeneration: /(?:test|unit test|testing|test case)/i,
  codeReview: /(?:review|feedback|critique|improve).{0,10}code/i,
  apiUsage: /(?:api|how to use|example|integration)/i,
  documentation: /(?:document|docs|documentation|comment|readme)/i,
  languageTranslation: /(?:convert|translate|port).{0,20}(?:from|to).{0,10}(?:python|java|javascript|c\+\+|php|ruby|go|rust|kotlin|swift)/i,
  deployment: /(?:deploy|deployment|production|publish|release)/i,
  database: /(?:sql|database|query|schema|table|mongodb|postgres)/i,
  regex: /(?:regex|regular expression|pattern|match)/i,
  writing: /(?:write|draft|create).{0,20}(?:email|document|report|article|blog|content)/i,
  translation: /(?:translate|translation).{0,20}(?:to|from|into|in)/i,
  dataAnalysis: /(?:analyze|analysis|data|chart|graph|statistics)/i,
  summarization: /(?:summarize|summary|tldr|key points|main idea)/i
};

const detectFeatures = (message) => {
  const features = [];
  for (const [feature, pattern] of Object.entries(FEATURE_PATTERNS)) {
    if (pattern.test(message)) {
      features.push(feature);
    }
  }
  return features;
};

export const generateChatResponse = async (message, chatHistory = [], options = {}) => {
  try {
    const gemini = initializeGemini();
    const model = gemini.getGenerativeModel({ model: 'gemini-pro' });

    // Detect what the user is asking for
    const detectedFeatures = detectFeatures(message);

    // Create conversation context based on subscription tier and detected features
    let conversationContext = 'You are MindBot AI, an advanced AI assistant with extensive capabilities across development, writing, analysis, and creative tasks. ';
    
    // Add personalization if user profile is available
    if (options.userProfile?.displayName) {
      conversationContext += `The user's name is ${options.userProfile.displayName}. Address them by name when appropriate. `;
    } else if (options.userProfile?.email) {
      const firstName = options.userProfile.email.split('@')[0];
      conversationContext += `The user's name is ${firstName}. Address them by name when appropriate. `;
    };
    
    // Add specialized instructions based on detected features
    if (detectedFeatures.includes('codeGeneration')) {
      conversationContext += 'Focus on generating clean, efficient, well-documented code. Include explanations and best practices. ';
    }
    
    if (detectedFeatures.includes('debugging')) {
      conversationContext += 'Provide systematic debugging assistance. Identify potential issues, suggest fixes, and explain root causes. ';
    }
    
    if (detectedFeatures.includes('codeExplanation')) {
      conversationContext += 'Provide clear, line-by-line code explanations with context about purpose and functionality. ';
    }
    
    if (detectedFeatures.includes('codeRefactoring')) {
      conversationContext += 'Suggest improvements for code quality, performance, readability, and maintainability. ';
    }
    
    if (detectedFeatures.includes('testGeneration')) {
      conversationContext += 'Generate comprehensive test cases including edge cases, unit tests, and integration tests. ';
    }
    
    if (detectedFeatures.includes('documentation')) {
      conversationContext += 'Create clear, comprehensive documentation with examples and usage instructions. ';
    }
    
    if (detectedFeatures.includes('languageTranslation')) {
      conversationContext += 'Accurately convert code between programming languages while maintaining functionality and best practices. ';
    }
    
    if (detectedFeatures.includes('writing')) {
      conversationContext += 'Focus on creating well-structured, professional content with appropriate tone and formatting. ';
    }
    
    if (detectedFeatures.includes('dataAnalysis')) {
      conversationContext += 'Provide thorough data analysis with insights, patterns, and actionable recommendations. ';
    }

    // Adjust personality based on subscription tier
    if (options.priority === 'high') {
      conversationContext += 'You are in premium mode - provide comprehensive, expert-level responses with advanced insights, multiple approaches, and production-ready solutions. ';
    } else if (options.priority === 'medium') {
      conversationContext += 'You are in pro mode - provide detailed responses with good examples, explanations, and practical solutions. ';
    } else {
      conversationContext += 'Provide helpful and accurate responses. Keep responses informative but concise. ';
    }

    // Add feature-specific instructions based on subscription
    if (options.features?.advancedReasoning) {
      conversationContext += 'Use advanced reasoning, provide step-by-step explanations, and consider multiple perspectives. ';
    }
    
    if (options.features?.codeGeneration) {
      conversationContext += 'Generate production-quality code with error handling, optimization, and security considerations. ';
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
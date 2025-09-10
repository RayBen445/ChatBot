import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Lock, Crown, Shield, Code, FileText, Lightbulb, Database } from 'lucide-react';
import { useAuth } from './AuthProvider';
import { canUseFeature, USER_STATUS, SUBSCRIPTION_TIERS, isAdmin } from '../lib/firebase';
import Link from 'next/link';

// Feature categories for better organization
const FEATURE_CATEGORIES = {
  development: {
    icon: Code,
    title: 'Development',
    features: [
      'Code generation in any language',
      'Debugging assistance',
      'Code explanation & review',
      'Test generation',
      'API integration examples'
    ]
  },
  writing: {
    icon: FileText,
    title: 'Writing & Documentation',
    features: [
      'Technical documentation',
      'Email drafting',
      'Content creation',
      'Language translation',
      'Grammar correction'
    ]
  },
  analysis: {
    icon: Database,
    title: 'Data & Analysis',
    features: [
      'Data analysis & insights',
      'SQL query generation',
      'Chart descriptions',
      'Report summaries',
      'Research assistance'
    ]
  },
  creative: {
    icon: Lightbulb,
    title: 'Creative & Learning',
    features: [
      'Tutorial creation',
      'Problem solving',
      'Brainstorming ideas',
      'Learning assistance',
      'Creative writing'
    ]
  }
};

export default function ChatInterface() {
  const { currentUser, userProfile } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [dailyMessageCount, setDailyMessageCount] = useState(0);
  const [showFeatureGuide, setShowFeatureGuide] = useState(true);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  // Check if user can send messages
  const canSendMessage = () => {
    if (!userProfile) return false;
    
    // Admin users have unlimited access
    if (isAdmin(userProfile)) {
      return true;
    }
    
    // Check if user is banned or suspended
    if (userProfile.status === USER_STATUS.BANNED) {
      return false;
    }
    
    if (userProfile.status === USER_STATUS.SUSPENDED) {
      const suspendedUntil = userProfile.suspendedUntil;
      if (suspendedUntil && new Date() < new Date(suspendedUntil.seconds * 1000)) {
        return false;
      }
    }
    
    // Check daily message limits for free users
    if (userProfile.subscriptionTier === SUBSCRIPTION_TIERS.FREE && dailyMessageCount >= 50) {
      return false;
    }
    
    return true;
  };

  const getDailyLimit = () => {
    if (!userProfile) return 50;
    
    // Admin users have unlimited access
    if (isAdmin(userProfile)) {
      return Infinity;
    }
    
    switch (userProfile.subscriptionTier) {
      case SUBSCRIPTION_TIERS.FREE:
        return 50;
      case SUBSCRIPTION_TIERS.PRO:
      case SUBSCRIPTION_TIERS.PLUS:
        return Infinity;
      default:
        return 50;
    }
  };

  const getStatusMessage = () => {
    if (!userProfile) return null;
    
    // Admin users don't get status messages about limits
    if (isAdmin(userProfile)) {
      return null;
    }
    
    if (userProfile.status === USER_STATUS.BANNED) {
      return {
        type: 'error',
        message: 'Your account has been banned. Please contact support.',
        icon: Lock
      };
    }
    
    if (userProfile.status === USER_STATUS.SUSPENDED) {
      const suspendedUntil = userProfile.suspendedUntil;
      if (suspendedUntil && new Date() < new Date(suspendedUntil.seconds * 1000)) {
        return {
          type: 'warning',
          message: `Your account is suspended until ${new Date(suspendedUntil.seconds * 1000).toLocaleDateString()}`,
          icon: Lock
        };
      }
    }
    
    if (userProfile.subscriptionTier === SUBSCRIPTION_TIERS.FREE && dailyMessageCount >= 50) {
      return {
        type: 'warning',
        message: 'Daily message limit reached. Upgrade to Pro for unlimited messages.',
        icon: Crown,
        action: 'upgrade'
      };
    }
    
    return null;
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading || !canSendMessage()) return;

    const userMessage = { role: 'user', content: inputMessage, timestamp: Date.now() };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setShowFeatureGuide(false); // Hide feature guide once user starts chatting
    
    // Increment daily message count for free users (not admins)
    if (userProfile?.subscriptionTier === SUBSCRIPTION_TIERS.FREE && !isAdmin(userProfile)) {
      setDailyMessageCount(prev => prev + 1);
    }

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputMessage,
          chatHistory: messages.slice(-10), // Send last 10 messages for context
          userProfile: userProfile
        }),
      });

      const data = await response.json();

      if (data.success) {
        const botMessage = { 
          role: 'assistant', 
          content: data.message, 
          timestamp: Date.now() 
        };
        setMessages(prev => [...prev, botMessage]);
      } else {
        const errorMessage = { 
          role: 'assistant', 
          content: data.message || 'Sorry, I encountered an error. Please try again.', 
          timestamp: Date.now(),
          isError: true
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = { 
        role: 'assistant', 
        content: 'Sorry, I\'m having trouble connecting. Please try again.', 
        timestamp: Date.now(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const statusMessage = getStatusMessage();
  const dailyLimit = getDailyLimit();

  return (
    <div className="flex flex-col h-screen">
      {/* Status Banner */}
      {statusMessage && (
        <div className={`p-4 border-b ${
          statusMessage.type === 'error' 
            ? 'bg-red-50 border-red-200 text-red-800'
            : 'bg-yellow-50 border-yellow-200 text-yellow-800'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <statusMessage.icon className="h-5 w-5" />
              <span className="text-sm font-medium">{statusMessage.message}</span>
            </div>
            {statusMessage.action === 'upgrade' && (
              <Link
                href="/subscription"
                className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
              >
                Upgrade Now
              </Link>
            )}
          </div>
        </div>
      )}
      
      {/* Usage Counter for Free Users (not admins) */}
      {userProfile?.subscriptionTier === SUBSCRIPTION_TIERS.FREE && !isAdmin(userProfile) && (
        <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">
              Daily messages: {dailyMessageCount}/{dailyLimit}
            </span>
            <div className="flex items-center space-x-2">
              <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-300 ${
                    dailyMessageCount >= dailyLimit ? 'bg-red-500' : 'bg-blue-500'
                  }`}
                  style={{ width: `${Math.min((dailyMessageCount / dailyLimit) * 100, 100)}%` }}
                />
              </div>
              <Link
                href="/subscription"
                className="text-blue-600 hover:text-blue-700 text-xs font-medium"
              >
                Upgrade
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <Bot className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Welcome to MindBot AI
              {userProfile && currentUser && (
                <>
                  , {currentUser.displayName || currentUser.email.split('@')[0]}!
                  <span className={`ml-2 text-sm px-2 py-1 rounded-full ${
                    userProfile.subscriptionTier === SUBSCRIPTION_TIERS.FREE
                      ? 'bg-gray-100 text-gray-600'
                      : userProfile.subscriptionTier === SUBSCRIPTION_TIERS.PRO
                      ? 'bg-blue-100 text-blue-600'
                      : 'bg-yellow-100 text-yellow-600'
                  }`}>
                    {userProfile.subscriptionTier?.toUpperCase() || 'FREE'}
                  </span>
                </>
              )}
            </h3>
            <p className="text-gray-500 mb-6">I can help you with a wide range of tasks. Here&apos;s what I can do:</p>
            
            {userProfile?.subscriptionTier === SUBSCRIPTION_TIERS.FREE && !isAdmin(userProfile) && (
              <div className="mt-4 mb-6 p-3 bg-blue-50 rounded-lg inline-block">
                <p className="text-sm text-blue-700">
                  You have {dailyLimit - dailyMessageCount} free messages remaining today
                </p>
              </div>
            )}
            
            {/* Admin unlimited access notice */}
            {userProfile && isAdmin(userProfile) && (
              <div className="mt-4 mb-6 p-3 bg-gradient-to-r from-purple-100 to-indigo-100 border border-purple-300 rounded-lg inline-block">
                <p className="text-sm text-purple-700 flex items-center">
                  <Shield className="h-4 w-4 mr-1" />
                  Administrator Access - Unlimited Messages
                </p>
              </div>
            )}
            
            {/* Feature Guide */}
            {showFeatureGuide && (
              <div className="max-w-4xl mx-auto mt-6">
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
                  {Object.entries(FEATURE_CATEGORIES).map(([key, category]) => (
                    <div key={key} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-sm transition-shadow">
                      <div className="flex items-center mb-3">
                        <category.icon className="h-5 w-5 text-blue-500 mr-2" />
                        <h4 className="text-sm font-medium text-gray-900">{category.title}</h4>
                      </div>
                      <ul className="space-y-1">
                        {category.features.map((feature, idx) => (
                          <li key={idx} className="text-xs text-gray-600">• {feature}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 text-center">
                  <button
                    onClick={() => setShowFeatureGuide(false)}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Hide Features Guide
                  </button>
                </div>
                
                {/* Quick start suggestions */}
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-700 mb-2">Try asking me:</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "Write a Python function to calculate fibonacci",
                      "Explain this JavaScript code",
                      "Help me debug this error",
                      "Generate unit tests for my function",
                      "Translate this text to Spanish",
                      "Analyze this data and find insights"
                    ].map((suggestion, idx) => (
                      <button
                        key={idx}
                        onClick={() => setInputMessage(suggestion)}
                        className="text-xs px-3 py-1 bg-white border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.role === 'user'
                  ? 'message-user ml-12'
                  : message.isError
                  ? 'bg-red-100 text-red-800 border border-red-200 mr-12'
                  : 'message-bot mr-12'
              }`}
            >
              <div className="flex items-start space-x-2">
                <div className="flex-shrink-0 mt-1">
                  {message.role === 'user' ? (
                    <User className="h-4 w-4" />
                  ) : (
                    <Bot className={`h-4 w-4 ${message.isError ? 'text-red-600' : 'text-gray-600'}`} />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <span className="text-xs opacity-70 mt-1 block">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="message-bot mr-12 max-w-xs lg:max-w-md px-4 py-2 rounded-lg">
              <div className="flex items-center space-x-2">
                <Bot className="h-4 w-4 text-gray-600" />
                <Loader2 className="h-4 w-4 animate-spin text-gray-600" />
                <span className="text-sm">
                  {userProfile?.subscriptionTier === SUBSCRIPTION_TIERS.PLUS 
                    ? 'Thinking with premium AI...'
                    : userProfile?.subscriptionTier === SUBSCRIPTION_TIERS.PRO
                    ? 'Processing your message...'
                    : 'Thinking...'
                  }
                </span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t border-gray-200 p-4">
        <form onSubmit={sendMessage} className="flex space-x-4">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={
              canSendMessage() 
                ? "Type your message..."
                : statusMessage?.type === 'error'
                ? "Account restricted"
                : "Message limit reached"
            }
            className="flex-1 min-w-0 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100"
            disabled={isLoading || !canSendMessage()}
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || isLoading || !canSendMessage()}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {!canSendMessage() && statusMessage?.type === 'error' ? (
              <Lock className="h-5 w-5" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </button>
        </form>
        
        {userProfile?.subscriptionTier === SUBSCRIPTION_TIERS.FREE && !isAdmin(userProfile) && dailyMessageCount >= 40 && dailyMessageCount < 50 && (
          <div className="mt-2 text-center">
            <p className="text-sm text-orange-600">
              {dailyLimit - dailyMessageCount} messages remaining today. 
              <Link href="/subscription" className="ml-1 underline hover:text-orange-700">
                Upgrade for unlimited
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
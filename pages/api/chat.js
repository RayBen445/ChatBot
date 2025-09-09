import { generateChatResponse } from '../../lib/gemini';
import { USER_STATUS, SUBSCRIPTION_TIERS } from '../../lib/firebase';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, chatHistory, userProfile } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ 
        success: false, 
        message: 'Message is required' 
      });
    }

    // Check user status and permissions
    if (userProfile) {
      // Check if user is banned
      if (userProfile.status === USER_STATUS.BANNED) {
        return res.status(403).json({
          success: false,
          message: 'Your account has been banned. Please contact support.'
        });
      }

      // Check if user is suspended
      if (userProfile.status === USER_STATUS.SUSPENDED) {
        const suspendedUntil = userProfile.suspendedUntil;
        if (suspendedUntil && new Date() < new Date(suspendedUntil.seconds * 1000)) {
          return res.status(403).json({
            success: false,
            message: `Your account is suspended until ${new Date(suspendedUntil.seconds * 1000).toLocaleDateString()}`
          });
        }
      }
    }

    // Enhanced response based on subscription tier
    const subscriptionTier = userProfile?.subscriptionTier || SUBSCRIPTION_TIERS.FREE;
    let responseOptions = {
      maxLength: subscriptionTier === SUBSCRIPTION_TIERS.FREE ? 200 : 
                  subscriptionTier === SUBSCRIPTION_TIERS.PRO ? 500 : 1000,
      priority: subscriptionTier === SUBSCRIPTION_TIERS.PLUS ? 'high' : 
                subscriptionTier === SUBSCRIPTION_TIERS.PRO ? 'medium' : 'low',
      features: {
        advancedReasoning: subscriptionTier !== SUBSCRIPTION_TIERS.FREE,
        codeGeneration: subscriptionTier === SUBSCRIPTION_TIERS.PLUS,
        longContext: subscriptionTier === SUBSCRIPTION_TIERS.PLUS
      }
    };

    const response = await generateChatResponse(message, chatHistory, responseOptions);

    if (response.success) {
      res.status(200).json({
        success: true,
        message: response.message,
      });
    } else {
      res.status(500).json({
        success: false,
        message: response.error || 'Failed to generate response',
      });
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
}
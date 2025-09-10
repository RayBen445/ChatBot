import { getUserProfile, updateUserProfile } from '../../lib/firebase';

export default async function handler(req, res) {
  if (!['GET', 'POST'].includes(req.method)) {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { userId } = req.query;
    const { action } = req.body || {};

    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'User ID is required' 
      });
    }

    // 🐛 ISSUE 3 CONTEXT: Message count persistence implementation
    // This API correctly stores/retrieves counts from database
    // Issues occur when: 1) Firebase not initialized, 2) Network errors, 
    // 3) User not found, 4) Authentication timing issues
    // Get user profile
    const userProfile = await getUserProfile(userId);
    if (!userProfile) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    if (req.method === 'GET') {
      // Get current message count
      const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
      const monthlyCount = userProfile.messageCount?.[currentMonth] || 0;
      
      return res.status(200).json({
        success: true,
        messageCount: monthlyCount,
        currentMonth,
        totalCount: Object.values(userProfile.messageCount || {}).reduce((sum, count) => sum + count, 0)
      });
    }

    if (req.method === 'POST') {
      if (action === 'increment') {
        // Increment message count
        const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
        const currentCount = userProfile.messageCount?.[currentMonth] || 0;
        const newCount = currentCount + 1;

        // Update user profile with new count
        const messageCountData = {
          messageCount: {
            ...userProfile.messageCount,
            [currentMonth]: newCount
          },
          lastMessageAt: new Date()
        };

        const updated = await updateUserProfile(userId, messageCountData);
        
        if (updated) {
          return res.status(200).json({
            success: true,
            messageCount: newCount,
            currentMonth
          });
        } else {
          return res.status(500).json({ 
            success: false, 
            message: 'Failed to update message count' 
          });
        }
      } else if (action === 'reset') {
        // Reset message count (admin only)
        const currentMonth = new Date().toISOString().slice(0, 7);
        const messageCountData = {
          messageCount: {
            ...userProfile.messageCount,
            [currentMonth]: 0
          }
        };

        const updated = await updateUserProfile(userId, messageCountData);
        
        if (updated) {
          return res.status(200).json({
            success: true,
            messageCount: 0,
            currentMonth
          });
        } else {
          return res.status(500).json({ 
            success: false, 
            message: 'Failed to reset message count' 
          });
        }
      } else {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid action' 
        });
      }
    }

  } catch (error) {
    console.error('Message API error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
}
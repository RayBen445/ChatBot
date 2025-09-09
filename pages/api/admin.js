import { getUserProfile, getAllUsers, banUser, suspendUser, reactivateUser, updateSubscriptionTier, isAdmin } from '../../lib/firebase';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { action, userId, adminUserId, duration, subscriptionTier } = req.body;

    // Verify admin user
    const adminProfile = await getUserProfile(adminUserId);
    if (!adminProfile || !isAdmin(adminProfile)) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    let result = false;

    switch (action) {
      case 'getAllUsers':
        const users = await getAllUsers();
        return res.status(200).json({ success: true, users });
      
      case 'banUser':
        result = await banUser(userId);
        break;
      
      case 'suspendUser':
        result = await suspendUser(userId, duration);
        break;
      
      case 'reactivateUser':
        result = await reactivateUser(userId);
        break;
      
      case 'updateSubscription':
        result = await updateSubscriptionTier(userId, subscriptionTier);
        break;
      
      default:
        return res.status(400).json({ message: 'Invalid action' });
    }

    if (result) {
      return res.status(200).json({ success: true });
    } else {
      return res.status(500).json({ message: 'Operation failed' });
    }

  } catch (error) {
    console.error('Admin API error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
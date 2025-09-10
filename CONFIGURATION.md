# ChatBot Configuration Guide

This guide covers the configuration and setup of the ChatBot application, including admin management, message limits, and email verification.

## Admin Configuration

### Setting Up Admin Users

Admin users have unlimited access to all features and can access the admin dashboard to manage other users.

#### Environment Variable Configuration

Set the `ADMIN_EMAIL` environment variable in your `.env.local` file:

```bash
# Single admin email
ADMIN_EMAIL=admin@example.com

# Multiple admin emails (comma-separated)
ADMIN_EMAIL=admin1@example.com,admin2@example.com,support@example.com
```

#### Key Features:
- **Multiple Admin Support**: You can specify multiple admin emails separated by commas
- **Automatic Role Assignment**: Users with emails matching the `ADMIN_EMAIL` list are automatically assigned admin roles
- **Unlimited Access**: Admin users bypass all message limits and have access to all features

#### Admin Access Error Handling

If a user tries to access admin features without being recognized as an admin, they will receive a clear error message:
- "Access denied. Your account is not recognized as an admin account."
- Instructions to contact the system administrator
- Information about admin email configuration

### Admin Dashboard Features

Admin users can access `/admin` to:
- View all registered users
- Ban or suspend users
- Update user subscription tiers
- Manage system settings
- View usage statistics

## Message Limit System

### Overview

The message limit system tracks user message usage on a monthly basis and enforces limits based on subscription tiers.

### How It Works

1. **Persistent Storage**: Message counts are stored in the Firestore database per user
2. **Monthly Tracking**: Counts are tracked by month (YYYY-MM format)
3. **Real-time Updates**: Counts are updated immediately when messages are sent
4. **Cross-Device Sync**: Limits persist across different devices and sessions

### Subscription Tiers and Limits

| Tier | Monthly Message Limit | Features |
|------|---------------------|----------|
| Free | 1,500 messages | Basic chat |
| Pro | 15,000 messages | Advanced features |
| Plus | Unlimited | All features |
| Admin | Unlimited | Admin access |

### API Endpoints

#### Get Message Count
```http
GET /api/messages?userId={userId}
```

Response:
```json
{
  "success": true,
  "messageCount": 150,
  "currentMonth": "2024-01",
  "totalCount": 1250
}
```

#### Increment Message Count
```http
POST /api/messages?userId={userId}
```

Body:
```json
{
  "action": "increment"
}
```

#### Reset Message Count (Admin Only)
```http
POST /api/messages?userId={userId}
```

Body:
```json
{
  "action": "reset"
}
```

## Email Verification

### Overview

The application uses Firebase Authentication for email verification with improved error handling.

### Error Handling

The system provides user-friendly error messages for common issues:

- **Network Errors**: "Network error. Please check your internet connection and try again."
- **Too Many Requests**: "Too many requests. Please wait a few minutes before trying again."
- **Connection Refused**: "Unable to reach verification service. Please try again later or contact support."

### Fallback Mechanisms

- Signup continues even if email verification fails
- Users can resend verification emails from their account
- Proper fallback URLs are configured for verification links

### Configuration

Ensure your Firebase configuration includes the correct domain settings:

```javascript
// In your Firebase Console, set the authorized domains
// Include your production domain and localhost for development
```

## Troubleshooting

### Admin Access Issues

**Problem**: User with admin email cannot access admin features
**Solutions**:
1. Verify the email in `ADMIN_EMAIL` matches exactly (including case sensitivity)
2. Check that the environment variable is properly loaded
3. Restart the application after changing environment variables
4. **🔧 CRITICAL**: Ensure the user's account was created after setting the admin email

**Specific Case - oladoyeheritage445@gmail.com**:
- **CONFIRMED ISSUE**: If this email was added to `ADMIN_EMAIL` after the user account was created, the user's role in Firestore is still `'user'`
- **DIAGNOSIS**: Admin roles are only assigned during account creation (`createUserProfile` function)
- **MANUAL FIX**: Update the user's role directly in Firestore:
  1. Open Firebase Console > Firestore Database
  2. Find the user document in the `users` collection (by UID)
  3. Update the `role` field from `'user'` to `'admin'`
  4. User will have admin access on next login/page refresh

**Problem**: Multiple admin emails not working
**Solutions**:
1. Ensure emails are comma-separated with no spaces: `email1@example.com,email2@example.com`
2. Or use spaces after commas: `email1@example.com, email2@example.com`
3. Verify no trailing commas or extra characters

### Message Limit Issues

**Problem**: Message counts reset on page refresh
**Solutions**:
1. This issue has been fixed in the latest version
2. Message counts are now stored in the database
3. Clear browser cache if you're still seeing the old behavior

**Problem**: Message count API errors
**Solutions**:
1. Check Firestore connection and permissions
2. Verify user authentication is working
3. Check server logs for detailed error messages

### Email Verification Issues

**Problem**: Users not receiving verification emails
**Solutions**:
1. Check spam/junk folders
2. Verify Firebase configuration is correct
3. Check Firebase Console for domain authorization
4. Use the resend verification feature

**Problem**: ERR_CONNECTION_REFUSED error
**Solutions**:
1. This is typically a temporary network issue
2. User will see a friendly error message
3. Encourage users to try again later
4. Check Firebase service status if persistent

## Database Schema

### User Profile Structure

```javascript
{
  uid: "user_unique_id",
  email: "user@example.com",
  displayName: "User Name",
  role: "user" | "admin",
  subscriptionTier: "free" | "pro" | "plus",
  status: "active" | "banned" | "suspended",
  messageCount: {
    "2024-01": 150,
    "2024-02": 200,
    // ... monthly counts
  },
  lastMessageAt: Timestamp,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

## Environment Variables Reference

Create a `.env.local` file with the following variables:

```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Admin Configuration
ADMIN_EMAIL=admin@example.com,support@example.com

# Google Gemini AI
GOOGLE_GEMINI_API_KEY=your_gemini_api_key
```

## Recent Changes

### Version 1.1.0 Fixes & Issue Diagnosis

1. **Admin Email Recognition**: Now supports multiple admin emails
   - **🐛 CONFIRMED ISSUE**: Admin role assignment only occurs during user account creation
   - **ROOT CAUSE**: If `oladoyeheritage445@gmail.com` was added to `ADMIN_EMAIL` after their account was created, their role remains `'user'` 
   - **SOLUTION**: Implement role synchronization or manually update user role in Firestore
   
2. **Message Limit Persistence**: Message counts stored in database
   - **🐛 CONFIRMED ISSUE**: While correctly implemented, message counts can appear to reset due to:
     - Authentication timing issues (component loads before user auth completes)
     - Firebase/Firestore connection failures
     - API errors falling back to local state defaulting to 0
   - **SOLUTION**: Improve error handling, add retry mechanisms, ensure auth completion before loading

3. **Email Verification**: Improved error handling and user feedback
   - **🐛 CONFIRMED ISSUE**: ERR_CONNECTION_REFUSED occurs due to Firebase domain configuration
   - **ROOT CAUSE**: Continuation URLs may not be authorized in Firebase Console's "Authorized domains"
   - **SOLUTION**: Ensure proper domain authorization in Firebase Console settings

### Migration Notes

- Existing users will have their message counts reset when the new system is deployed
- Admin users need to be reconfigured using the new multiple email format
- **🔧 CRITICAL**: Existing admin users may need manual role updates in Firestore if added to ADMIN_EMAIL after account creation
- No database migration is required as the new fields will be created automatically

### Diagnostic Tools

Run `node diagnose-issues.js` to analyze your configuration for these common issues.
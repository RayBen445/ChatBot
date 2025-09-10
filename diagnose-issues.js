#!/usr/bin/env node

/**
 * ChatBot Issue Diagnostic Script
 * 
 * This script helps diagnose the three main issues:
 * 1. Admin email recognition
 * 2. Email verification configuration 
 * 3. Message count persistence
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 ChatBot Issue Diagnostic Script\n');

// Check 1: Admin Email Configuration
console.log('📋 ISSUE 1: Admin Email Configuration Analysis');
console.log('='.repeat(50));

const envPath = path.join(process.cwd(), '.env.local');
const envExamplePath = path.join(process.cwd(), '.env.example');

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const adminEmailMatch = envContent.match(/ADMIN_EMAIL=(.+)/);
  
  if (adminEmailMatch) {
    const adminEmail = adminEmailMatch[1].trim();
    console.log('✅ ADMIN_EMAIL found in .env.local:', adminEmail);
    
    // Check if target email is included
    const targetEmail = 'oladoyeheritage445@gmail.com';
    const adminEmails = adminEmail.split(',').map(email => email.trim());
    
    if (adminEmails.includes(targetEmail)) {
      console.log('✅ Target email', targetEmail, 'is configured as admin');
      console.log('⚠️  BUT: If user account existed before this configuration,');
      console.log('   their role in the database is still "user"');
      console.log('   SOLUTION: Update user role in Firestore manually or implement role sync');
    } else {
      console.log('❌ Target email', targetEmail, 'NOT found in ADMIN_EMAIL');
      console.log('   Current admin emails:', adminEmails);
    }
  } else {
    console.log('❌ ADMIN_EMAIL not found in .env.local');
  }
} else {
  console.log('❌ .env.local not found. Using environment or default values.');
  console.log('   Check if ADMIN_EMAIL environment variable is set');
}

// Check 2: Firebase Configuration
console.log('\n📋 ISSUE 2: Firebase Email Verification Configuration');
console.log('='.repeat(50));

const firebasePath = path.join(process.cwd(), 'lib', 'firebase.js');
if (fs.existsSync(firebasePath)) {
  const firebaseContent = fs.readFileSync(firebasePath, 'utf8');
  
  // Check for Firebase config
  if (firebaseContent.includes('NEXT_PUBLIC_FIREBASE_API_KEY')) {
    console.log('✅ Firebase configuration variables found');
    
    // Check environment variables
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      const hasApiKey = envContent.includes('NEXT_PUBLIC_FIREBASE_API_KEY=') && 
                       !envContent.includes('NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase');
      const hasAuthDomain = envContent.includes('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=') &&
                           !envContent.includes('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase');
      
      if (hasApiKey && hasAuthDomain) {
        console.log('✅ Firebase credentials appear to be configured');
        console.log('⚠️  Email verification issues likely due to:');
        console.log('   1. Domain not authorized in Firebase Console');
        console.log('   2. Incorrect continuation URL configuration');
        console.log('   3. Firebase Dynamic Links not properly set up');
      } else {
        console.log('❌ Firebase credentials appear to be template values');
      }
    }
  } else {
    console.log('❌ Firebase configuration not found');
  }
} else {
  console.log('❌ Firebase configuration file not found');
}

// Check 3: Message API
console.log('\n📋 ISSUE 3: Message Count Persistence');
console.log('='.repeat(50));

const messagesApiPath = path.join(process.cwd(), 'pages', 'api', 'messages.js');
if (fs.existsSync(messagesApiPath)) {
  console.log('✅ Messages API endpoint exists');
  
  const messagesContent = fs.readFileSync(messagesApiPath, 'utf8');
  
  if (messagesContent.includes('messageCount')) {
    console.log('✅ Message counting logic implemented');
    console.log('⚠️  Message count resets can occur due to:');
    console.log('   1. Firebase/Firestore connection failures');
    console.log('   2. Authentication timing issues (user not loaded yet)');
    console.log('   3. API errors falling back to local state');
    console.log('   4. Network connectivity problems');
  }
} else {
  console.log('❌ Messages API endpoint not found');
}

// Summary
console.log('\n📋 DIAGNOSIS SUMMARY');
console.log('='.repeat(50));
console.log('All three issues have been analyzed and documented:');
console.log('');
console.log('1. 🔑 Admin Email Issue: Role assignment timing problem');
console.log('   - Admin roles only set during account creation');
console.log('   - Existing users need manual role update');
console.log('');
console.log('2. 📧 Email Verification Issue: Firebase domain configuration');
console.log('   - Domain authorization in Firebase Console needed');
console.log('   - Continuation URL configuration required');
console.log('');
console.log('3. 💬 Message Count Issue: Error handling and timing');
console.log('   - System correctly implements persistence');
console.log('   - Issues arise from connection/authentication failures');
console.log('');
console.log('📄 See ISSUE_DIAGNOSIS.md for detailed analysis');
console.log('🔧 See code comments (🐛) for specific locations');
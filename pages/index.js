import { useAuth } from '../components/AuthProvider';
import { useState } from 'react';
import AuthForm from '../components/AuthForm';
import ChatInterface from '../components/ChatInterface';
import Layout from '../components/Layout';

export default function Home() {
  const { currentUser } = useAuth();
  const [authMode, setAuthMode] = useState('login');

  // Show demo message if Firebase is not configured
  if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="auth-container p-8 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Configuration Required</h2>
          <p className="text-gray-600 mb-4">
            Please set up your environment variables to use this application:
          </p>
          <ul className="text-sm text-gray-500 text-left space-y-1">
            <li>• GOOGLE_GEMINI_API_KEY</li>
            <li>• NEXT_PUBLIC_FIREBASE_API_KEY</li>
            <li>• NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN</li>
            <li>• NEXT_PUBLIC_FIREBASE_PROJECT_ID</li>
            <li>• And other Firebase configuration values</li>
          </ul>
          <p className="text-xs text-gray-400 mt-4">
            Check the README.md for detailed setup instructions.
          </p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <AuthForm 
        mode={authMode} 
        onToggleMode={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')} 
      />
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto h-screen">
        <div className="chat-container h-full mx-4 my-4">
          <ChatInterface />
        </div>
      </div>
    </Layout>
  );
}
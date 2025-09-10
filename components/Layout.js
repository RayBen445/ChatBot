import { useAuth } from '../components/AuthProvider';
import { LogOut, Bot, Shield, Crown, MessageCircle, Mail, RefreshCw } from 'lucide-react';
import { isAdmin } from '../lib/firebase';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import SupportModal from './SupportModal';

export default function Layout({ children }) {
  const { currentUser, userProfile, logout, resendVerification } = useAuth();
  const router = useRouter();
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [sendingVerification, setSendingVerification] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  const handleResendVerification = async () => {
    try {
      setSendingVerification(true);
      await resendVerification();
      alert('Verification email sent! Please check your inbox.');
    } catch (error) {
      alert('Error sending verification email: ' + error.message);
    } finally {
      setSendingVerification(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-6">
              <Link href="/" className="flex items-center space-x-3">
                <div className="h-8 w-8 bg-gradient-to-r from-purple-400 to-blue-600 rounded-lg flex items-center justify-center">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-xl font-bold text-white">MindBot AI</h1>
              </Link>
              
              {currentUser && (
                <div className="flex items-center space-x-4">
                  <Link
                    href="/features"
                    className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg transition-all duration-200 ${
                      router.pathname === '/features'
                        ? 'bg-white/20 text-white'
                        : 'text-white/80 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <Bot className="h-4 w-4" />
                    <span className="text-sm font-medium">Features</span>
                  </Link>
                  
                  <Link
                    href="/subscription"
                    className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg transition-all duration-200 ${
                      router.pathname === '/subscription'
                        ? 'bg-white/20 text-white'
                        : 'text-white/80 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <Crown className="h-4 w-4" />
                    <span className="text-sm font-medium">Upgrade</span>
                  </Link>
                  
                  <button
                    onClick={() => setShowSupportModal(true)}
                    className="flex items-center space-x-2 px-3 py-1.5 rounded-lg transition-all duration-200 text-white/80 hover:bg-white/10 hover:text-white"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">Support</span>
                  </button>
                  
                  {userProfile && isAdmin(userProfile) && (
                    <Link
                      href="/admin"
                      className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg transition-all duration-200 ${
                        router.pathname === '/admin'
                          ? 'bg-white/20 text-white'
                          : 'text-white/80 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <Shield className="h-4 w-4" />
                      <span className="text-sm font-medium">Admin</span>
                    </Link>
                  )}
                </div>
              )}
            </div>
            
            {currentUser && (
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="text-white/90 text-sm font-medium">
                    {currentUser.displayName || currentUser.email}
                  </div>
                  <div className="flex items-center space-x-2">
                    {userProfile ? (
                      <>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          userProfile.subscriptionTier === 'free' 
                            ? 'bg-gray-500/20 text-gray-200'
                            : userProfile.subscriptionTier === 'pro'
                            ? 'bg-blue-500/20 text-blue-200'
                            : 'bg-yellow-500/20 text-yellow-200'
                        }`}>
                          {userProfile.subscriptionTier?.toUpperCase() || 'FREE'}
                        </span>
                        {userProfile.role === 'admin' && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-200">
                            ADMIN
                          </span>
                        )}
                      </>
                    ) : (
                      // Show loading state while profile is being fetched
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-500/20 text-gray-200 animate-pulse">
                        Loading...
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all duration-200"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="text-sm">Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Email Verification Banner */}
      {currentUser && !currentUser.emailVerified && (
        <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Mail className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm text-yellow-800">
                  <strong>Email not verified</strong> - Please check your email and verify your account for full access.
                </p>
              </div>
            </div>
            <button
              onClick={handleResendVerification}
              disabled={sendingVerification}
              className="flex items-center space-x-2 text-sm text-yellow-700 hover:text-yellow-800 font-medium disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${sendingVerification ? 'animate-spin' : ''}`} />
              <span>{sendingVerification ? 'Sending...' : 'Resend Email'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>
      
      {/* Support Modal */}
      <SupportModal 
        isOpen={showSupportModal} 
        onClose={() => setShowSupportModal(false)} 
      />
    </div>
  );
}
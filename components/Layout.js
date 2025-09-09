import { useAuth } from '../components/AuthProvider';
import { LogOut, Bot, Shield, Crown } from 'lucide-react';
import { isAdmin } from '../lib/firebase';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Layout({ children }) {
  const { currentUser, userProfile, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Failed to logout:', error);
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
                <h1 className="text-xl font-bold text-white">ChatBot AI</h1>
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
                  {userProfile && (
                    <div className="flex items-center space-x-2">
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
                    </div>
                  )}
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

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
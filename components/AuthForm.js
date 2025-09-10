import { useState } from 'react';
import { useAuth } from './AuthProvider';
import { Eye, EyeOff, Mail, Lock, User, LogIn, UserPlus, RotateCcw } from 'lucide-react';

export default function AuthForm({ mode = 'login', onToggleMode }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const { login, signup, resetPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (showForgotPassword) {
        await resetPassword(email);
        setSuccess('Password reset email sent! Check your inbox.');
        setShowForgotPassword(false);
      } else if (mode === 'signup') {
        await signup(email, password, displayName);
        setSuccess('Account created! Please check your email to verify your account.');
      } else {
        await login(email, password);
      }
    } catch (error) {
      setError(error.message);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="auth-container p-8">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 bg-gradient-to-r from-purple-400 to-blue-600 rounded-full flex items-center justify-center mb-4">
              {showForgotPassword ? <RotateCcw className="h-6 w-6 text-white" /> : 
               mode === 'login' ? <LogIn className="h-6 w-6 text-white" /> : <UserPlus className="h-6 w-6 text-white" />}
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900">
              {showForgotPassword ? 'Reset Password' : 
               mode === 'login' ? 'Sign in to your account' : 'Create your account'}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {showForgotPassword ? 'Enter your email to reset your password' : 
               mode === 'login' ? 'Welcome back to ChatBot AI' : 'Join ChatBot AI today'}
            </p>
          </div>
          
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}
            
            {success && (
              <div className="bg-green-50 border border-green-200 rounded-md p-4">
                <p className="text-sm text-green-800">{success}</p>
              </div>
            )}
            
            <div className="space-y-4">
              {mode === 'signup' && !showForgotPassword && (
                <div>
                  <label htmlFor="displayName" className="sr-only">Display Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="displayName"
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="appearance-none rounded-lg relative block w-full pl-10 pr-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10"
                      placeholder="Display Name"
                    />
                  </div>
                </div>
              )}
              
              <div>
                <label htmlFor="email" className="sr-only">Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none rounded-lg relative block w-full pl-10 pr-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10"
                    placeholder="Email address"
                  />
                </div>
              </div>
              
              {!showForgotPassword && (
                <div>
                  <label htmlFor="password" className="sr-only">Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="appearance-none rounded-lg relative block w-full pl-10 pr-10 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10"
                      placeholder="Password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {loading ? 'Processing...' : 
                 showForgotPassword ? 'Send Reset Email' :
                 mode === 'login' ? 'Sign In' : 'Sign Up'}
              </button>
            </div>

            <div className="text-center space-y-2">
              {mode === 'login' && !showForgotPassword && (
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-purple-600 hover:text-purple-500 text-sm font-medium"
                >
                  Forgot your password?
                </button>
              )}
              
              {showForgotPassword ? (
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(false)}
                  className="text-purple-600 hover:text-purple-500 text-sm font-medium"
                >
                  Back to login
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onToggleMode}
                  className="text-purple-600 hover:text-purple-500 text-sm font-medium"
                >
                  {mode === 'login' 
                    ? "Don't have an account? Sign up" 
                    : "Already have an account? Sign in"
                  }
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
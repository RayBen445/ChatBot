import { useState } from 'react';
import { X, MessageCircle, Send } from 'lucide-react';
import { useAuth } from './AuthProvider';

const SupportModal = ({ isOpen, onClose }) => {
  const { currentUser, userProfile } = useAuth();
  const [message, setMessage] = useState('');
  const [issueType, setIssueType] = useState('support');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim() || loading) return;

    setLoading(true);
    try {
      const response = await fetch('/api/telegram-support', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message,
          userEmail: currentUser?.email,
          userName: currentUser?.displayName || currentUser?.email?.split('@')[0],
          issueType: issueType,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Support request sent successfully! We\'ll get back to you soon.');
        setMessage('');
        onClose();
      } else {
        // Fallback to WhatsApp
        const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '2348075614248';
        const userName = currentUser?.displayName || currentUser?.email?.split('@')[0];
        const whatsappMessage = `Hi! I'm ${userName} and I need help with MindBot AI. Issue type: ${issueType}\n\nMessage: ${message}`;
        const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;
        window.open(whatsappUrl, '_blank');
        onClose();
      }
    } catch (error) {
      console.error('Support request error:', error);
      // Fallback to WhatsApp
      const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '2348075614248';
      const userName = currentUser?.displayName || currentUser?.email?.split('@')[0];
      const whatsappMessage = `Hi! I'm ${userName} and I need help with MindBot AI. Issue type: ${issueType}\n\nMessage: ${message}`;
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;
      window.open(whatsappUrl, '_blank');
      onClose();
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Contact Support</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="issueType" className="block text-sm font-medium text-gray-700 mb-2">
                Issue Type
              </label>
              <select
                id="issueType"
                value={issueType}
                onChange={(e) => setIssueType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="support">General Support</option>
                <option value="subscription">Subscription Help</option>
                <option value="technical">Technical Issue</option>
                <option value="feature">Feature Request</option>
                <option value="billing">Billing Question</option>
                <option value="bug">Bug Report</option>
              </select>
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                Message
              </label>
              <textarea
                id="message"
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe your issue or question..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                required
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <MessageCircle className="h-5 w-5 text-blue-500 mt-0.5" />
                <div className="text-sm">
                  <p className="text-blue-800 font-medium mb-1">Support Options:</p>
                  <p className="text-blue-700 mb-2">
                    We&apos;ll send your message via Telegram for fastest response. If that fails, we&apos;ll automatically open WhatsApp for you.
                  </p>
                  <p className="text-blue-600 text-xs">
                    Response time: Usually within 1-2 hours during business hours
                  </p>
                </div>
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!message.trim() || loading}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>Sending...</>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span>Send Message</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SupportModal;
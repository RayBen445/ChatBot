import { useState } from 'react';
import { Crown, Shield, Users, Check, X, MessageCircle, Send } from 'lucide-react';
import { updateSubscriptionTier, SUBSCRIPTION_TIERS, isAdmin } from '../lib/firebase';
import { useAuth } from './AuthProvider';

const SubscriptionManager = () => {
  const { userProfile, currentUser } = useAuth();
  const [loading, setLoading] = useState(false);

  const plans = [
    {
      name: 'Free',
      tier: SUBSCRIPTION_TIERS.FREE,
      price: '$0',
      icon: Users,
      color: 'gray',
      features: [
        'Basic chat functionality',
        'Limited daily messages (50)',
        'Standard response time',
        'Basic support'
      ],
      limitations: [
        'No file uploads',
        'No voice input/output',
        'Limited chat history (7 days)',
        'No advanced AI features'
      ]
    },
    {
      name: 'Pro',
      tier: SUBSCRIPTION_TIERS.PRO,
      price: '$9.99',
      period: '/month',
      icon: Shield,
      color: 'blue',
      popular: true,
      features: [
        'Advanced chat functionality',
        'Unlimited daily messages',
        'Faster response time',
        'Voice input/output',
        'Priority support',
        'Extended chat history (30 days)',
        'Advanced AI features'
      ],
      limitations: [
        'No file uploads',
        'Limited storage space'
      ]
    },
    {
      name: 'Plus',
      tier: SUBSCRIPTION_TIERS.PLUS,
      price: '$19.99',
      period: '/month',
      icon: Crown,
      color: 'yellow',
      features: [
        'Premium chat functionality',
        'Unlimited everything',
        'Fastest response time',
        'Voice input/output',
        'File upload & analysis',
        'Premium support',
        'Unlimited chat history',
        'All AI features',
        'Custom integrations',
        'Priority processing'
      ],
      limitations: []
    }
  ];

  const handleUpgrade = async (tier) => {
    if (!currentUser || loading) return;
    
    // For paid plans, redirect to WhatsApp for subscription
    if (tier !== SUBSCRIPTION_TIERS.FREE) {
      const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
      if (!whatsappNumber) {
        alert('Subscription service is temporarily unavailable. Please try again later.');
        return;
      }
      
      const planName = plans.find(p => p.tier === tier)?.name || 'Pro';
      const userName = currentUser.displayName || currentUser.email.split('@')[0];
      
      const message = `Hi! I'm ${userName} and I'd like to upgrade to the ${planName} plan for MindBot AI. Please help me with the subscription process.`;
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
      
      window.open(whatsappUrl, '_blank');
      return;
    }
    
    setLoading(true);
    try {
      // For free tier (downgrade), update directly
      const success = await updateSubscriptionTier(currentUser.uid, tier);
      
      if (success) {
        // Reload the page to reflect changes
        window.location.reload();
      } else {
        alert('Failed to update subscription. Please try again.');
      }
    } catch (error) {
      console.error('Error updating subscription:', error);
      alert('Failed to update subscription. Please try again.');
    }
    setLoading(false);
  };

  const getColorClasses = (color, variant = 'primary') => {
    const colors = {
      gray: {
        primary: 'bg-gray-500 hover:bg-gray-600',
        secondary: 'bg-gray-100 text-gray-800 border-gray-200',
        accent: 'text-gray-600'
      },
      blue: {
        primary: 'bg-blue-500 hover:bg-blue-600',
        secondary: 'bg-blue-100 text-blue-800 border-blue-200',
        accent: 'text-blue-600'
      },
      yellow: {
        primary: 'bg-yellow-500 hover:bg-yellow-600',
        secondary: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        accent: 'text-yellow-600'
      }
    };
    return colors[color][variant];
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Plan</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Unlock powerful AI features and enhance your chat experience with our subscription plans.
        </p>
      </div>

      {/* Admin Notice */}
      {userProfile && isAdmin(userProfile) && (
        <div className="mb-8 bg-gradient-to-r from-purple-100 to-indigo-100 border-2 border-purple-300 rounded-2xl p-6">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Shield className="h-8 w-8 text-purple-600" />
            <h3 className="text-2xl font-bold text-purple-900">Administrator Access</h3>
          </div>
          <div className="text-center">
            <p className="text-purple-800 mb-4 font-medium">
              As an administrator, you have unlimited access to all features and premium functionality regardless of subscription tier.
            </p>
            <div className="inline-flex items-center space-x-2 bg-purple-200 text-purple-800 px-4 py-2 rounded-full font-semibold">
              <Crown className="h-5 w-5" />
              <span>Unlimited Access Enabled</span>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => {
          const Icon = plan.icon;
          const isCurrentPlan = userProfile?.subscriptionTier === plan.tier;
          const canDowngrade = userProfile?.subscriptionTier === SUBSCRIPTION_TIERS.PLUS && plan.tier === SUBSCRIPTION_TIERS.PRO;
          const canUpgrade = (
            (userProfile?.subscriptionTier === SUBSCRIPTION_TIERS.FREE && plan.tier !== SUBSCRIPTION_TIERS.FREE) ||
            (userProfile?.subscriptionTier === SUBSCRIPTION_TIERS.PRO && plan.tier === SUBSCRIPTION_TIERS.PLUS)
          );

          return (
            <div
              key={plan.tier}
              className={`relative bg-white rounded-2xl shadow-lg border-2 transition-all duration-300 ${
                plan.popular 
                  ? 'border-blue-500 shadow-blue-100 scale-105' 
                  : isCurrentPlan
                  ? `border-${plan.color}-400 shadow-${plan.color}-100`
                  : 'border-gray-200 hover:shadow-xl'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}

              {isCurrentPlan && (
                <div className="absolute -top-4 right-4">
                  <span className={`${getColorClasses(plan.color, 'secondary')} px-3 py-1 rounded-full text-sm font-medium border`}>
                    Current Plan
                  </span>
                </div>
              )}

              <div className="p-8">
                <div className="text-center mb-6">
                  <div className={`inline-flex p-3 rounded-full ${getColorClasses(plan.color, 'secondary')} border mb-4`}>
                    <Icon className={`h-8 w-8 ${getColorClasses(plan.color, 'accent')}`} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                    {plan.period && <span className="text-gray-600">{plan.period}</span>}
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Features</h4>
                    <ul className="space-y-2">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <Check className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                          <span className="text-sm text-gray-600">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {plan.limitations.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Limitations</h4>
                      <ul className="space-y-2">
                        {plan.limitations.map((limitation, index) => (
                          <li key={index} className="flex items-start">
                            <X className="h-5 w-5 text-red-400 mt-0.5 mr-3 flex-shrink-0" />
                            <span className="text-sm text-gray-500">{limitation}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="text-center">
                  {isCurrentPlan ? (
                    <button
                      className="w-full py-3 px-6 rounded-lg border-2 border-gray-300 text-gray-500 font-medium cursor-not-allowed"
                      disabled
                    >
                      Current Plan
                    </button>
                  ) : canUpgrade ? (
                    <button
                      onClick={() => handleUpgrade(plan.tier)}
                      disabled={loading}
                      className={`w-full py-3 px-6 rounded-lg text-white font-medium transition-all duration-200 ${getColorClasses(plan.color, 'primary')} disabled:opacity-50 flex items-center justify-center space-x-2`}
                    >
                      {loading ? (
                        <>Loading...</>
                      ) : (
                        <>
                          <MessageCircle className="h-4 w-4" />
                          <span>Contact via WhatsApp</span>
                        </>
                      )}
                    </button>
                  ) : canDowngrade ? (
                    <button
                      onClick={() => handleUpgrade(plan.tier)}
                      disabled={loading}
                      className="w-full py-3 px-6 rounded-lg border-2 border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-all duration-200 disabled:opacity-50"
                    >
                      {loading ? 'Processing...' : `Downgrade to ${plan.name}`}
                    </button>
                  ) : (
                    <button
                      className="w-full py-3 px-6 rounded-lg border-2 border-gray-300 text-gray-400 font-medium cursor-not-allowed"
                      disabled
                    >
                      Not Available
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-12 text-center">
        <p className="text-sm text-gray-500 mb-4">
          For subscription upgrades, contact us directly via WhatsApp for personalized assistance.
        </p>
        <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
          <div className="flex items-center space-x-2">
            <MessageCircle className="h-4 w-4" />
            <span>WhatsApp Support: +234 807 561 4248</span>
          </div>
          <div className="flex items-center space-x-2">
            <Send className="h-4 w-4" />
            <span>Telegram Support Available</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionManager;
import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../components/AuthProvider';
import { SUBSCRIPTION_TIERS } from '../lib/firebase';
import { 
  Code, 
  FileText, 
  Database, 
  Lightbulb, 
  Terminal,
  Globe,
  BarChart,
  Headphones,
  Shield,
  Zap,
  CheckCircle,
  XCircle,
  Crown
} from 'lucide-react';
import Link from 'next/link';

const FeatureIcon = ({ feature }) => {
  const iconMap = {
    codeGeneration: Code,
    codeCompletion: Terminal,
    debugging: Shield,
    codeExplanation: FileText,
    codeRefactoring: Zap,
    syntaxCorrection: CheckCircle,
    testGeneration: CheckCircle,
    codeReview: FileText,
    apiUsage: Database,
    documentation: FileText,
    languageTranslation: Globe,
    writing: FileText,
    translation: Globe,
    dataAnalysis: BarChart,
    summarization: FileText,
    deployment: Terminal,
    regex: Code,
    database: Database,
    security: Shield,
    performance: Zap,
    architecture: Database
  };
  
  const IconComponent = iconMap[feature] || Lightbulb;
  return <IconComponent className="h-5 w-5" />;
};

export default function FeaturesPage() {
  const { userProfile } = useAuth();
  const [features, setFeatures] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/features')
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          setFeatures(data.features);
        }
      })
      .catch(error => {
        console.error('Error loading features:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded mb-4"></div>
            <div className="h-4 bg-gray-300 rounded mb-8"></div>
            <div className="grid md:grid-cols-3 gap-6">
              {[1,2,3].map(i => (
                <div key={i} className="h-64 bg-gray-300 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const currentTier = userProfile?.subscriptionTier || SUBSCRIPTION_TIERS.FREE;

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            ChatBot AI Features
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Discover all the powerful capabilities at your fingertips
          </p>
          <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
            Your Plan: {currentTier.toUpperCase()}
            {currentTier !== SUBSCRIPTION_TIERS.PLUS && (
              <Link
                href="/subscription"
                className="ml-3 px-3 py-1 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
              >
                Upgrade
              </Link>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {features && Object.entries(features).map(([tier, tierFeatures]) => (
            <div
              key={tier}
              className={`relative p-6 rounded-2xl border-2 transition-all ${
                tier === currentTier
                  ? 'border-blue-500 bg-blue-50 scale-105 shadow-lg'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              {/* Tier Header */}
              <div className="text-center mb-6">
                <div className="flex items-center justify-center mb-2">
                  {tier === SUBSCRIPTION_TIERS.FREE && <Shield className="h-8 w-8 text-gray-500" />}
                  {tier === SUBSCRIPTION_TIERS.PRO && <Crown className="h-8 w-8 text-blue-500" />}
                  {tier === SUBSCRIPTION_TIERS.PLUS && <Crown className="h-8 w-8 text-yellow-500" />}
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">
                  {tier.charAt(0).toUpperCase() + tier.slice(1)}
                </h2>
                <p className="text-gray-600">
                  {tier === SUBSCRIPTION_TIERS.FREE && 'Essential features for getting started'}
                  {tier === SUBSCRIPTION_TIERS.PRO && 'Advanced capabilities for professionals'}
                  {tier === SUBSCRIPTION_TIERS.PLUS && 'Enterprise-grade AI assistance'}
                </p>
                {tier === currentTier && (
                  <span className="inline-block mt-2 px-3 py-1 bg-blue-500 text-white text-sm rounded-full">
                    Current Plan
                  </span>
                )}
              </div>

              {/* Features List */}
              <div className="space-y-3">
                {Object.entries(tierFeatures).map(([featureName, featureDetails]) => (
                  <div
                    key={featureName}
                    className={`flex items-start space-x-3 p-3 rounded-lg transition-colors ${
                      featureDetails.enabled
                        ? 'bg-green-50 border border-green-200'
                        : 'bg-gray-50 border border-gray-200'
                    }`}
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      {featureDetails.enabled ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <FeatureIcon feature={featureName} />
                        <h4 className={`text-sm font-medium capitalize ${
                          featureDetails.enabled ? 'text-gray-900' : 'text-gray-500'
                        }`}>
                          {featureName.replace(/([A-Z])/g, ' $1').trim()}
                        </h4>
                      </div>
                      <p className={`text-xs ${
                        featureDetails.enabled ? 'text-green-700' : 'text-gray-500'
                      }`}>
                        {featureDetails.limit}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Button */}
              <div className="mt-6 text-center">
                {tier === currentTier ? (
                  <Link
                    href="/"
                    className="w-full inline-flex justify-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Start Chatting
                  </Link>
                ) : (
                  <Link
                    href="/subscription"
                    className={`w-full inline-flex justify-center px-4 py-2 rounded-lg transition-colors ${
                      tier === SUBSCRIPTION_TIERS.PLUS
                        ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                        : 'bg-blue-500 text-white hover:bg-blue-600'
                    }`}
                  >
                    {tier === SUBSCRIPTION_TIERS.FREE ? 'Downgrade' : 'Upgrade'} to {tier.charAt(0).toUpperCase() + tier.slice(1)}
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Feature Categories Section */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
            What You Can Do
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Development */}
            <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl">
              <Code className="h-10 w-10 text-blue-500 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Development</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Generate code in 20+ languages</li>
                <li>• Debug and fix errors</li>
                <li>• Code reviews and suggestions</li>
                <li>• API integration help</li>
                <li>• Architecture planning</li>
              </ul>
            </div>

            {/* Writing & Content */}
            <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl">
              <FileText className="h-10 w-10 text-green-500 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Writing & Content</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Technical documentation</li>
                <li>• Email and report drafting</li>
                <li>• Content creation</li>
                <li>• Grammar and style correction</li>
                <li>• Language translation</li>
              </ul>
            </div>

            {/* Data & Analysis */}
            <div className="p-6 bg-gradient-to-br from-purple-50 to-violet-100 rounded-xl">
              <BarChart className="h-10 w-10 text-purple-500 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Data & Analysis</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• SQL query generation</li>
                <li>• Data analysis and insights</li>
                <li>• Chart descriptions</li>
                <li>• Report summaries</li>
                <li>• Trend identification</li>
              </ul>
            </div>

            {/* Creative & Learning */}
            <div className="p-6 bg-gradient-to-br from-orange-50 to-red-100 rounded-xl">
              <Lightbulb className="h-10 w-10 text-orange-500 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Creative & Learning</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Tutorial creation</li>
                <li>• Problem-solving guidance</li>
                <li>• Brainstorming ideas</li>
                <li>• Learning assistance</li>
                <li>• Creative writing</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl p-8">
            <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-lg opacity-90 mb-6">
              Experience the power of AI-assisted development and content creation
            </p>
            <div className="space-x-4">
              <Link
                href="/"
                className="inline-flex items-center px-6 py-3 bg-white text-blue-600 rounded-lg font-medium hover:bg-gray-100 transition-colors"
              >
                Start Chatting Now
              </Link>
              {currentTier !== SUBSCRIPTION_TIERS.PLUS && (
                <Link
                  href="/subscription"
                  className="inline-flex items-center px-6 py-3 bg-blue-700 text-white rounded-lg font-medium hover:bg-blue-800 transition-colors"
                >
                  <Crown className="h-5 w-5 mr-2" />
                  Upgrade Plan
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
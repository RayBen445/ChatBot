import { SUBSCRIPTION_TIERS } from '../../lib/firebase';

// Available features by subscription tier
const FEATURE_CATALOG = {
  [SUBSCRIPTION_TIERS.FREE]: {
    codeGeneration: { enabled: true, limit: 'Basic code snippets' },
    codeCompletion: { enabled: false, limit: 'Pro feature' },
    debugging: { enabled: true, limit: 'Basic debugging help' },
    codeExplanation: { enabled: true, limit: 'Simple explanations' },
    codeRefactoring: { enabled: false, limit: 'Pro feature' },
    syntaxCorrection: { enabled: true, limit: 'Basic syntax help' },
    testGeneration: { enabled: false, limit: 'Plus feature' },
    codeReview: { enabled: false, limit: 'Pro feature' },
    apiUsage: { enabled: true, limit: 'Basic API examples' },
    documentation: { enabled: true, limit: 'Simple documentation' },
    languageTranslation: { enabled: false, limit: 'Pro feature' },
    writing: { enabled: true, limit: 'Basic writing assistance' },
    translation: { enabled: true, limit: '3 languages' },
    dataAnalysis: { enabled: false, limit: 'Plus feature' },
    summarization: { enabled: true, limit: 'Short summaries' }
  },
  [SUBSCRIPTION_TIERS.PRO]: {
    codeGeneration: { enabled: true, limit: 'Advanced code generation' },
    codeCompletion: { enabled: true, limit: 'Intelligent completion' },
    debugging: { enabled: true, limit: 'Advanced debugging' },
    codeExplanation: { enabled: true, limit: 'Detailed explanations' },
    codeRefactoring: { enabled: true, limit: 'Code optimization' },
    syntaxCorrection: { enabled: true, limit: 'Advanced syntax help' },
    testGeneration: { enabled: true, limit: 'Unit tests' },
    codeReview: { enabled: true, limit: 'Comprehensive reviews' },
    apiUsage: { enabled: true, limit: 'Advanced API integration' },
    documentation: { enabled: true, limit: 'Professional docs' },
    languageTranslation: { enabled: true, limit: '10+ languages' },
    writing: { enabled: true, limit: 'Professional writing' },
    translation: { enabled: true, limit: '20+ languages' },
    dataAnalysis: { enabled: true, limit: 'Basic analytics' },
    summarization: { enabled: true, limit: 'Detailed summaries' },
    deployment: { enabled: true, limit: 'Deployment guidance' },
    regex: { enabled: true, limit: 'Pattern generation' }
  },
  [SUBSCRIPTION_TIERS.PLUS]: {
    codeGeneration: { enabled: true, limit: 'Production-ready code' },
    codeCompletion: { enabled: true, limit: 'AI-powered completion' },
    debugging: { enabled: true, limit: 'Expert debugging' },
    codeExplanation: { enabled: true, limit: 'In-depth analysis' },
    codeRefactoring: { enabled: true, limit: 'Enterprise refactoring' },
    syntaxCorrection: { enabled: true, limit: 'Multi-language support' },
    testGeneration: { enabled: true, limit: 'Comprehensive test suites' },
    codeReview: { enabled: true, limit: 'Expert code reviews' },
    apiUsage: { enabled: true, limit: 'Custom integrations' },
    documentation: { enabled: true, limit: 'Technical documentation' },
    languageTranslation: { enabled: true, limit: 'All programming languages' },
    writing: { enabled: true, limit: 'Expert writing assistance' },
    translation: { enabled: true, limit: 'All world languages' },
    dataAnalysis: { enabled: true, limit: 'Advanced analytics' },
    summarization: { enabled: true, limit: 'Executive summaries' },
    deployment: { enabled: true, limit: 'DevOps automation' },
    regex: { enabled: true, limit: 'Complex pattern matching' },
    database: { enabled: true, limit: 'Database design & queries' },
    security: { enabled: true, limit: 'Security audits' },
    performance: { enabled: true, limit: 'Performance optimization' },
    architecture: { enabled: true, limit: 'System architecture' }
  }
};

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { tier } = req.query;
    
    if (!tier || !FEATURE_CATALOG[tier]) {
      return res.status(200).json({
        success: true,
        features: FEATURE_CATALOG,
        message: 'All subscription tiers and their features'
      });
    }

    return res.status(200).json({
      success: true,
      tier,
      features: FEATURE_CATALOG[tier],
      message: `Features available for ${tier} subscription`
    });

  } catch (error) {
    console.error('Features API Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
}
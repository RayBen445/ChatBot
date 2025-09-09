import { generateChatResponse } from '../../lib/gemini';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, chatHistory } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    const response = await generateChatResponse(message, chatHistory);

    if (response.success) {
      res.status(200).json({
        success: true,
        message: response.message,
      });
    } else {
      res.status(500).json({
        success: false,
        error: response.error || 'Failed to generate response',
      });
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
}
// Telegram Bot Integration for Support
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const TELEGRAM_BOT_TOKEN = process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN;
  const TELEGRAM_ADMIN_ID = process.env.NEXT_PUBLIC_TELEGRAM_ADMIN_ID;

  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_ADMIN_ID) {
    return res.status(500).json({ 
      success: false, 
      message: 'Telegram configuration not available' 
    });
  }

  try {
    const { message, userEmail, userName, issueType = 'support' } = req.body;

    if (!message || !userEmail) {
      return res.status(400).json({ 
        success: false, 
        message: 'Message and user email are required' 
      });
    }

    // Format message for Telegram
    const telegramMessage = `🔔 *New Support Request*
    
👤 *User:* ${userName || userEmail}
📧 *Email:* ${userEmail}
🏷️ *Type:* ${issueType}
📝 *Message:*
${message}

🕒 *Time:* ${new Date().toLocaleString()}`;

    // Send message to admin via Telegram bot
    const response = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: TELEGRAM_ADMIN_ID,
          text: telegramMessage,
          parse_mode: 'Markdown',
        }),
      }
    );

    const telegramData = await response.json();

    if (telegramData.ok) {
      res.status(200).json({
        success: true,
        message: 'Support request sent successfully! We\'ll get back to you soon.',
      });
    } else {
      console.error('Telegram API error:', telegramData);
      res.status(500).json({
        success: false,
        message: 'Failed to send support request. Please try WhatsApp instead.',
      });
    }
  } catch (error) {
    console.error('Telegram support error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send support request. Please try WhatsApp instead.',
    });
  }
}
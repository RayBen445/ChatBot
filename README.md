# MindBot AI - Advanced AI Assistant

A modern intelligent chatbot application powered by Google Gemini AI with Firebase authentication, comprehensive admin system, subscription management, and 100+ AI capabilities across development, writing, data analysis, and creative domains.

## 🚀 Features

- **AI-Powered Chat**: Integrated with Google Gemini AI for intelligent conversations
- **User Authentication**: Firebase-based sign up and login system
- **Responsive Design**: Modern, mobile-friendly interface with glass morphism effects
- **Real-time Chat**: Instant messaging with conversation history
- **Secure**: Environment variable configuration for API keys
- **Vercel Ready**: Optimized for Vercel deployment

## 🛠️ Technologies Used

- **Frontend**: Next.js 14, React 18, Tailwind CSS
- **AI**: Google Gemini API
- **Authentication**: Firebase Auth
- **Database**: Firebase Firestore (ready for chat history)
- **Deployment**: Vercel
- **Icons**: Lucide React

## 📋 Prerequisites

Before running this application, make sure you have:

1. Node.js 16+ installed
2. A Google Cloud Platform account with Gemini API access
3. A Firebase project with Authentication enabled
4. A Vercel account (for deployment)

## ⚙️ Environment Setup

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd ChatBot
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment Variables**:
   Copy the `.env.example` file to `.env.local` and fill in your actual values:
   ```bash
   cp .env.example .env.local
   ```
   
   Then edit `.env.local` with your configuration:
   ```env
   # Google Gemini API
   GOOGLE_GEMINI_API_KEY=your_google_gemini_api_key_here

   # Firebase Configuration
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key_here
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain_here
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id_here
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket_here
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id_here
   NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id_here
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_firebase_measurement_id_here

   # Admin Configuration
   ADMIN_EMAIL=your_admin_email_here

   # Support & Contact Configuration
   NEXT_PUBLIC_WHATSAPP_NUMBER=your_whatsapp_number_here
   NEXT_PUBLIC_TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
   NEXT_PUBLIC_TELEGRAM_ADMIN_ID=your_telegram_admin_id_here
   ```

   > ⚠️ **Security Note**: Never commit your `.env.local` file to version control as it contains sensitive information!

## 🔑 Getting API Keys

### Google Gemini API Key
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the key and add it to your environment variables

### Firebase Configuration
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select an existing one
3. Enable Authentication and choose Email/Password as a sign-in method
4. Go to Project Settings > General > Your apps
5. Add a web app and copy the configuration values

### Admin Configuration
Set your admin email address in the `ADMIN_EMAIL` environment variable. Users with this email will have administrative privileges including:
- User management (ban, suspend, reactivate users)
- Subscription management
- Access to admin dashboard

### Support Configuration (Optional)
For support features, you can configure:
- **WhatsApp Support**: Set `NEXT_PUBLIC_WHATSAPP_NUMBER` (format: country code + number, e.g., `1234567890`)
- **Telegram Support**: 
  1. Create a Telegram bot via [@BotFather](https://t.me/botfather)
  2. Set `NEXT_PUBLIC_TELEGRAM_BOT_TOKEN` with your bot token
  3. Set `NEXT_PUBLIC_TELEGRAM_ADMIN_ID` with your Telegram user ID

## 🚀 Running the Application

1. **Development mode**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

2. **Build for production**:
   ```bash
   npm run build
   npm start
   ```

## 📦 Deployment on Vercel

1. **Deploy to Vercel**:
   ```bash
   npx vercel
   ```

2. **Add Environment Variables in Vercel**:
   - Go to your [Vercel dashboard](https://vercel.com/dashboard)
   - Select your project
   - Go to **Settings** > **Environment Variables**
   - Add **each** environment variable from your `.env.local` file:
     
     **Required Server-side Variables:**
     - `GOOGLE_GEMINI_API_KEY` - Your Google Gemini API key
     - `ADMIN_EMAIL` - Admin email address for privileged access
     
     **Required Client-side Variables (with NEXT_PUBLIC_ prefix):**
     - `NEXT_PUBLIC_FIREBASE_API_KEY` - Firebase API key
     - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` - Firebase auth domain
     - `NEXT_PUBLIC_FIREBASE_PROJECT_ID` - Firebase project ID
     - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` - Firebase storage bucket
     - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` - Firebase messaging sender ID
     - `NEXT_PUBLIC_FIREBASE_APP_ID` - Firebase app ID
     - `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` - Firebase measurement ID (optional)
     
     **Optional Support Configuration:**
     - `NEXT_PUBLIC_WHATSAPP_NUMBER` - WhatsApp number for support (without +)
     - `NEXT_PUBLIC_TELEGRAM_BOT_TOKEN` - Telegram bot token for support
     - `NEXT_PUBLIC_TELEGRAM_ADMIN_ID` - Telegram admin user ID
   
   > 💡 **Tip**: Copy and paste the variable names exactly as shown to avoid typos!

3. **Redeploy**:
   After adding environment variables, redeploy your application.

### 🔧 Troubleshooting Vercel Deployment

**Issue**: `Environment Variable "GOOGLE_GEMINI_API_KEY" references Secret "google-gemini-api-key", which does not exist`

**Solution**: This error occurs when the `vercel.json` file references Vercel secrets that don't exist. The current configuration uses regular environment variables instead of secrets. To fix this:

1. Remove any `vercel.json` file from your project (or ensure it doesn't contain an `env` section with `@secret-name` references)
2. Set environment variables directly in the Vercel dashboard under **Settings** > **Environment Variables**
3. Use regular variable names (not prefixed with `@`)
4. Redeploy your application

**Note**: The current setup uses standard environment variables for easier configuration and doesn't require creating Vercel secrets via CLI.

## 🎯 Additional Features That Can Be Added

### 📚 Core Features
- [ ] **Chat History Persistence**: Save conversations to Firebase Firestore
- [ ] **Multiple Conversations**: Support for multiple chat threads
- [ ] **Message Search**: Search through chat history
- [ ] **Export Conversations**: Export chat history as PDF or text files

### 🎨 UI/UX Enhancements
- [ ] **Dark/Light Mode Toggle**: Theme switching capability
- [ ] **Custom Themes**: Multiple color schemes
- [ ] **Message Reactions**: Like/dislike messages
- [ ] **Typing Indicators**: Show when AI is generating response
- [ ] **Message Timestamps**: Detailed time information

### 🔧 Advanced Features
- [ ] **Voice Input**: Speech-to-text integration
- [ ] **Voice Output**: Text-to-speech responses
- [ ] **File Upload**: Support for document analysis
- [ ] **Image Analysis**: Integration with Gemini Vision
- [ ] **Code Highlighting**: Syntax highlighting for code snippets
- [ ] **Markdown Support**: Rich text formatting in messages

### 🌐 Collaboration Features
- [ ] **Chat Sharing**: Share conversations with others
- [ ] **Team Workspaces**: Collaborate with team members
- [ ] **Role-Based Access**: Admin and user roles
- [ ] **Chat Templates**: Pre-defined conversation starters

### 📊 Analytics & Management
- [ ] **Usage Analytics**: Track user engagement
- [ ] **Rate Limiting**: Prevent API abuse
- [ ] **User Profiles**: Extended user information
- [ ] **Admin Dashboard**: Manage users and conversations

### 🔒 Security & Privacy
- [ ] **End-to-End Encryption**: Secure message storage
- [ ] **Data Export**: GDPR compliance features
- [ ] **Session Management**: Advanced security controls
- [ ] **Two-Factor Authentication**: Enhanced account security

### 🌍 Accessibility & Internationalization
- [ ] **Multi-language Support**: Internationalization (i18n)
- [ ] **Accessibility Features**: Screen reader support
- [ ] **Keyboard Navigation**: Full keyboard accessibility
- [ ] **High Contrast Mode**: Better visibility options

## 🏗️ Project Structure

```
ChatBot/
├── components/
│   ├── AuthForm.js          # Authentication form component
│   ├── AuthProvider.js      # Authentication context provider
│   ├── ChatInterface.js     # Main chat interface
│   └── Layout.js           # App layout wrapper
├── lib/
│   ├── firebase.js         # Firebase configuration
│   └── gemini.js           # Google Gemini AI integration
├── pages/
│   ├── api/
│   │   └── chat.js         # API route for chat functionality
│   ├── _app.js            # Next.js app component
│   └── index.js           # Home page
├── styles/
│   └── globals.css        # Global styles with Tailwind CSS
├── .env.example           # Environment variables template
├── .gitignore            # Git ignore rules
├── next.config.js        # Next.js configuration
├── package.json          # Project dependencies
└── tailwind.config.js    # Tailwind CSS configuration
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -am 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Google Gemini AI for the conversational AI capabilities
- Firebase for authentication and database services
- Vercel for hosting and deployment platform
- Tailwind CSS for the beautiful UI components
# AI Buddy - Mental Wellness Companion

A supportive mobile app built with React Native and Expo Router that provides a friendly AI chat interface for mental wellness support. The app features a clean, calming design with tab-based navigation across five main screens.

## Features

### 🏠 Home Screen
- Choose from 5 different AI personalities
- Each personality offers unique conversation styles
- Clean, card-based interface for personality selection

### 💬 Chat Screen (Personality-Based)
- **Calm**: Peaceful and supportive conversations
- **Sarcastic**: Witty and humorous responses
- **Sassy**: Confident and playful interactions
- **Wise**: Thoughtful and insightful guidance
- **Motivational**: Encouraging and inspiring talks
- Real-time conversation with personality-specific responses
- WhatsApp-style interface with message bubbles

### 😊 Mood Screen
- Interactive mood selection with visual feedback
- Five mood options: Happy, Okay, Lonely, Anxious, Stressed
- Color-coded mood indicators

### 📊 Progress Screen
- Mock statistics display
- Weekly check-ins counter
- Completed steps tracker
- Current streak display

### ⚙️ Settings Screen
- Basic app settings options
- Important disclaimer about mental health care
- Clean, accessible interface

## Tech Stack

- **React Native** with **Expo**
- **Expo Router** for file-based navigation
- **TypeScript** for type safety
- **Expo Vector Icons** for consistent iconography
- Clean, minimal design with soft colors

## Project Structure

```
ai-buddy-app/
├── app/
│   ├── index.tsx                 # Onboarding/Signup screen
│   └── (tabs)/                   # Main app with tab navigation
│       ├── _layout.tsx           # Tab navigation setup
│       ├── index.tsx             # Personality selection screen
│       ├── chat.tsx              # Personality-based chat interface
│       ├── mood.tsx              # Mood selection
│       ├── progress.tsx          # Progress tracking
│       └── settings.tsx          # App settings
├── components/
│   ├── chat-bubble.tsx           # Message bubble component
│   ├── chat-input.tsx            # Text input with send button
│   └── ui/                       # Reusable UI components
├── constants/
│   ├── theme.ts                  # Colors and fonts
│   └── mock-data.ts              # Personality-specific AI responses
├── services/
│   └── api.ts                    # Future backend integration
└── assets/
    └── images/                   # App assets
```

## Getting Started

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start the development server**
   ```bash
   npx expo start
   ```

3. **Run on device/emulator**
   - Scan QR code with Expo Go app
   - Press `a` for Android emulator
   - Press `i` for iOS simulator
   - Press `w` for web browser

## Development

- Uses TypeScript for type safety
- File-based routing with Expo Router
- Responsive design for mobile devices
- Dark/light theme support
- Modular component architecture

## Important Disclaimer

AI Buddy is designed to provide supportive conversation and mood tracking, but **it is not a replacement for professional mental health care**. If you're experiencing serious mental health concerns, please consult with qualified healthcare professionals.

## Future Enhancements

- Backend API integration for persistent chat history
- Advanced mood analytics and trends
- Personalized AI responses
- Integration with mental health resources
- Offline functionality
- Push notifications for mood check-ins

## Contributing

This app follows Expo's development guidelines and React Native best practices. Components are designed to be reusable and the codebase is structured for easy maintenance and extension.

## License

This project is built for educational and wellness purposes. Please respect mental health guidelines and professional standards when extending this application.

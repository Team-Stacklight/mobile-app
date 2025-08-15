# Collective Minds 🧠

**A modern learning companion app built with React Native and Expo**

Collective Minds is an intuitive mobile application designed to enhance your learning journey with personalized AI assistance, progress tracking, and seamless user experience. Built with cutting-edge React Native technology and featuring smooth animations and modern UI design.

## ✨ Features

### 🏠 **Dashboard**
- **Today's Focus**: Personalized learning recommendations
- **Progress Overview**: Visual progress tracking with interactive stats
- **Recent Activity**: Timeline of completed and ongoing learning modules
- **Modern UI**: Clean, card-based layout with themed components

### 💬 **AI Chat Assistant**
- **Collective Minds Bot**: Intelligent learning companion with avatar integration
- **Real-time Conversations**: Smooth chat interface with message bubbles
- **Modal Navigation**: Full-screen chat experience with custom headers
- **Keyboard Optimization**: Proper keyboard handling and safe area support

### 📊 **Progress Tracking**
- **Learning Streaks**: Track daily learning consistency
- **Module Completion**: Visual grid of completed learning modules
- **Achievement System**: Progress bars and milestone tracking
- **Statistics**: Comprehensive learning analytics

### 👤 **Profile Management**
- **User Profile**: Personalized avatar and account information
- **Settings**: Account, notification, and privacy controls
- **Support**: Help center and contact options
- **App Info**: Version tracking and additional resources

### 🎨 **Enhanced UX**
- **Smooth Animations**: Custom fade-in/fade-out transitions between screens
- **Haptic Feedback**: Tactile response for better user interaction
- **Theme Support**: Light and dark mode compatibility
- **Responsive Design**: Optimized for various screen sizes

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator (for iOS development)
- Android Studio (for Android development)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Team-Stacklight/mobile-app.git
   cd mobile-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npx expo start
   ```

4. **Run on your preferred platform**
   - **iOS Simulator**: Press `i` in the terminal
   - **Android Emulator**: Press `a` in the terminal
   - **Physical Device**: Scan QR code with Expo Go app
   - **Web Browser**: Press `w` for web development

## 🏗️ Project Structure

```
questie/
├── app/                          # Main application code
│   ├── (tabs)/                   # Tab-based navigation screens
│   │   ├── index.tsx            # Dashboard screen
│   │   ├── chat.tsx             # Chat list screen
│   │   ├── progress.tsx         # Progress tracking screen
│   │   ├── profile.tsx          # User profile screen
│   │   └── _layout.tsx          # Tab navigation configuration
│   ├── chat-conversation.tsx    # Modal chat conversation screen
│   └── _layout.tsx              # Root layout configuration
├── components/                   # Reusable UI components
│   ├── AnimatedScreenWrapper.tsx # Custom animation wrapper
│   ├── ThemedText.tsx           # Themed text component
│   ├── ThemedView.tsx           # Themed view component
│   └── ui/                      # UI-specific components
├── constants/                    # App constants and configuration
├── hooks/                        # Custom React hooks
└── assets/                       # Images, fonts, and other assets
```

## 🛠️ Technology Stack

- **Framework**: React Native with Expo
- **Navigation**: Expo Router (file-based routing)
- **Animations**: React Native Reanimated
- **UI Components**: Custom themed components
- **Icons**: Expo Vector Icons
- **Safe Areas**: React Native Safe Area Context
- **Image Handling**: Expo Image
- **TypeScript**: Full type safety

## 🎨 Design System

### **Animation Framework**
- **Custom AnimatedScreenWrapper**: Smooth fade-in/fade-out transitions
- **Haptic Feedback**: Enhanced tactile user experience
- **Performance Optimized**: Native animations with Reanimated

### **Theming**
- **Light/Dark Mode**: Automatic theme switching
- **Consistent Colors**: Unified color palette across components
- **Responsive Typography**: Scalable text system

### **Navigation**
- **Tab-Based**: Bottom tab navigation with custom styling
- **Modal Screens**: Full-screen overlays for focused interactions
- **Smooth Transitions**: Custom animations between screens

## 📱 Platform Support

- ✅ **iOS**: Native iOS experience with platform-specific optimizations
- ✅ **Android**: Material Design compliance with native performance
- ✅ **Web**: Progressive Web App capabilities (development/testing)

## 🔧 Development

### **Available Scripts**
```bash
npm start          # Start Expo development server
npm run android    # Run on Android emulator
npm run ios        # Run on iOS simulator
npm run web        # Run in web browser
npm run lint       # Run ESLint
npm run type-check # Run TypeScript checks
```

### **Key Development Features**
- **Hot Reload**: Instant updates during development
- **TypeScript**: Full type safety and IntelliSense
- **File-based Routing**: Intuitive navigation structure
- **Component Library**: Reusable, themed components

## 🤝 Contributing

We welcome contributions to Collective Minds! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Expo](https://expo.dev) and [React Native](https://reactnative.dev)
- Icons provided by [Expo Vector Icons](https://docs.expo.dev/guides/icons/)
- Animations powered by [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/)

---

**Made with ❤️ by Team Stacklight**

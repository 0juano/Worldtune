# Worldtune

![Worldtune](https://images.unsplash.com/photo-1516280440614-37939bbacd81?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80)

## 🌍 Overview

Worldtune is a modern communication platform inspired by Skype, built with React, TypeScript, and Tailwind CSS. It offers a sleek, responsive interface with both dark and light mode support, allowing users to make calls, send messages, and connect with others around the world.

## ✨ Features

- **Modern UI**: Clean, intuitive interface built with React and Tailwind CSS
- **Dark/Light Mode**: Seamless theme switching with system preference detection
- **Responsive Design**: Fully optimized for mobile, tablet, and desktop devices
- **Multiple Views**: Navigate between calls, messages, contacts, and settings
- **AI Call Assistant**: Enhanced calling experience with AI assistance
- **Credits System**: Add credits for premium features

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/Worldtune.git
   cd Worldtune
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn
   ```

3. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

### Environment Setup

1. Create a `.env` file in the root directory based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

2. Obtain Firebase configuration from your Firebase Console:
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select your project
   - Click on the gear icon (⚙️) and select "Project settings"
   - Under "Your apps", find your web app and click "Config"
   - Copy the configuration values to your `.env` file

3. Security best practices:
   - Never commit your `.env` file to version control
   - Rotate API keys if they've been exposed
   - Consider implementing Firebase App Check for additional security

## 🛠️ Tech Stack

- **Frontend Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with dark mode support
- **State Management**: Zustand
- **Icons**: Lucide React
- **UI Components**: Headless UI
- **Payment Processing**: Stripe
- **Build Tool**: Vite

## 📱 Application Structure

- **Layout**: Main application layout with navigation
- **Home**: Primary messaging interface
- **Dial**: Interface for making and receiving calls
- **AI Call Assistant**: AI-powered calling features
- **Theme Toggle**: Dark/light mode switcher

## 🧩 Project Structure

```
worldtune/
├── src/
│   ├── components/       # UI components
│   ├── store/            # Zustand state management
│   ├── types/            # TypeScript type definitions
│   ├── utils/            # Utility functions
│   ├── App.tsx           # Main application component
│   └── main.tsx          # Application entry point
├── public/               # Static assets
└── .claude/              # Claude AI assistant metadata
```

## 📝 Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run lint`: Run ESLint
- `npm run preview`: Preview production build

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details. 
# Zephyr Chat Pro

Zephyr Chat Pro is a sophisticated, minimalist conversational AI interface powered by Google's Gemini 3 models. It offers a clean, distraction-free environment for interacting with one of the most advanced AI models available.

## Features

- **Minimalist Interface**: No sidebars, no clutter. Just you and the AI.
- **Gemini Powered**: Leverages the latest Gemini 3 Flash models for fast, intelligent responses.
- **Search Grounding**: Responses are grounded in real-time Web Search when necessary.
- **Persistent Sessions**: Your chat history is saved locally in your browser so you can return to your work.
- **Responsive Design**: Works beautifully on mobile, tablet, and desktop.
- **Glassmorphic UI**: Modern aesthetic with blurred backgrounds and sleek animations.

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- A Gemini API Key from [Google AI Studio](https://aistudio.google.com/)

### Installation

1. Clone the project.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your environment variables. Create a `.env` file in the root directory:
   ```env
   GEMINI_API_KEY=your_actual_api_key_here
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## Technology Stack

- **Framework**: React 19
- **Type Safety**: TypeScript
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **AI Integration**: @google/genai SDK
- **Icons**: Font Awesome 6

## Development

The project structure is organized as follows:

- `/src/App.tsx`: Main application logic and layout.
- `/src/services/geminiService.ts`: Integration with the Google GenAI SDK.
- `/src/components/ChatMessage.tsx`: Component for rendering individual messages.
- `/src/types.ts`: TypeScript definitions for the application state.

## License

This project is open-source and available for everyone. Feel free to use it as a starting point for your own Gemini-powered applications.

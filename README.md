# CRE8 by Ziad - The All-in-One AI Creative Suite ✨

![CRE8 by Ziad](https://i.imgur.com/your-banner-image.png) <!-- It's recommended to replace this with a banner image of your app -->

**CRE8** is a powerful, web-based creative suite powered by the Google Gemini API. It's an all-in-one solution designed for creators, marketers, and designers to generate, edit, and enhance stunning visual and written content. From professional product photos and character art to persuasive marketing copy and dynamic video scripts, CRE8 provides the tools to bring your vision to life.

---

## 📋 Table of Contents

- [Key Features](#-key-features)
- [Creative Studios](#-creative-studios)
  - [Product Studio](#product-studio)
  - [Portrait Studio](#portrait-studio)
  - [Character Studio](#character-studio)
  - [Live AI Assistant](#live-ai-assistant)
  - [Explore Page](#explore-page-grounded-qa)
- [Mini-Apps Showcase](#-mini-apps-showcase)
- [Powered by Google Gemini API](#-powered-by-google-gemini-api)
- [Tech Stack](#-tech-stack)
- [How It Works](#-how-it-works)

---

## 🚀 Key Features

- **🎨 Core Creative Studios**: Dedicated workspaces for Product, Portrait, Character, and Video generation with advanced, context-specific controls.
- **🤖 Live AI Assistant**: A real-time conversational AI collaborator with multiple "personas" (Art Director, Coder, etc.) that analyzes your camera or screen share feed to provide live feedback and execute tasks.
- **🌐 Real-Time Grounded Answers**: An 'Explore' page that uses Google Search grounding to answer questions about recent events and topics with sourced information.
- **🧰 30+ Mini-Apps**: A massive collection of specialized, single-purpose AI tools for tasks like background removal, logo ideation, scriptwriting, and more.
- **✂️ Advanced Editing Suite**: A powerful canvas with tools for in-painting (Magic Edit), out-painting (Expand Image), upscaling, and color palette extraction.
- **📚 Workspace & History**: A persistent history panel automatically saves every creation, allowing you to restore, favorite, and manage your work.
- **🎨 Brand Kit Management**: Centralize your brand assets, including logos, primary colors, and fonts, for consistent content creation.
- **🌍 Multilingual Support**: Fully functional in both English and Arabic, with a dynamic RTL/LTR interface.

---

## 🎨 Creative Studios

### Product Studio
The ultimate tool for e-commerce and marketing imagery. Upload a single product photo and generate professional visuals across various modes:
- **Product Mode**: Place your product in entirely new, AI-generated scenes.
- **Mockup Mode**: Instantly create mockups on t-shirts, mugs, billboards, and more.
- **Social Mode**: Generate lifestyle images and posts tailored for platforms like Instagram and Facebook.
- **Design Mode**: Create artistic concepts and design alternatives inspired by your product.

### Portrait Studio
A sophisticated suite for retouching and stylizing portraits.
- **Skin Retouching**: Apply standard, detailed, or heavy retouching to smooth skin and remove blemishes.
- **Facial Features**: Whiten teeth, brighten eyes, and even change eye color.
- **AI Makeup**: Apply various makeup styles from 'Natural Glow' to 'Goth'.
- **Face Sculpting**: Subtly enhance features like the jawline, cheekbones, and lips.
- **Hair & Background**: Completely change the hairstyle or background of your portrait with a simple prompt.

### Character Studio
A dual-mode studio for character artists and storytellers.
- **Generation Mode**: Create unique characters from scratch using detailed text prompts, style references, and key object images.
- **Consistency Mode**: Upload a reference image of your character and generate new images of them in different poses, expressions, and scenes while maintaining visual consistency.

### Live AI Assistant
Experience real-time collaboration with a conversational AI.
- **Visual Context**: Share your camera or screen and get live feedback.
- **Expert Personas**: Switch between over 15 AI personas, like an Art Director, UX/UI Designer, or Web Developer, each with a unique system instruction and specialized tools.
- **Function Calling**: The AI can perform actions like highlighting areas on screen, generating code snippets, or suggesting color palettes.
- **Live Transcription**: Both user and AI speech is transcribed in real-time.

### Explore Page (Grounded Q&A)
Ask any question and get answers grounded in real-time information from Google Search. The AI provides a comprehensive answer and lists its web sources, making it perfect for research and fact-checking.

---

## 🧰 Mini-Apps Showcase

CRE8 includes a vast library of over 30 focused tools to accelerate any creative task:

| Category               | Apps                                                                                                                                                                                                                                                                                                           |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Image Editing**      | Background Remover, Magic Editor (In-painting), Image Expander (Out-painting), AI Image Enhancer, Color Palette Extractor                                                                                                                                                                                       |
| **Design & Ideation**  | Sketch to Image, Logo Ideator, Design Ideator, AI Product Packaging Designer, AI Tattoo Designer, AI Coloring Book Generator, AI Seamless Pattern Generator, AI QR Code Generator                                                                                                                                 |
| **Marketing & Content**| NeuroSales AI Copywriter, Marketing Copy Generator, Video Ad Scripter, AI Ad Copy Generator, AI Photoshoot Director, Brand Voice Guide, Product Namer, YouTube Thumbnail Generator, AI Podcast Summarizer                                                                                                       |
| **Creative Production**| Lipsync Studio, AI Video Generator, AI Presentation Generator, AI Comic Creator, AI Storyboard Artist                                                                                                                                                                                                            |
| **Lifestyle & Fun**    | AI Fashion Designer (Virtual Try-On), AI Interior Designer, AI Recipe Generator                                                                                                                                                                                                                                |

---

## 🤖 Powered by Google Gemini API

CRE8 leverages a suite of cutting-edge models from the Google Gemini API to deliver its powerful features.

-   **`gemini-2.5-flash`**: The workhorse for all text-based tasks, including chat, prompt enhancement, suggestions, and generating structured JSON for marketing copy, scripts, and guides.
-   **`gemini-2.5-flash-image`**: A powerful multimodal model that handles all image editing tasks, including background removal, in-painting (Magic Edit), out-painting (Expand Image), sketch-to-image, and virtual try-on.
-   **`imagen-4.0-generate-001`**: Used for high-quality, text-to-image generation tasks like creating logos, patterns, and artistic QR codes.
-   **`veo-2.0-generate-001`**: Powers the text-to-video and image-to-video generation features, creating short, dynamic video clips.
-   **`gemini-2.5-flash-native-audio-preview-09-2025`**: The core of the "Live Assistant," enabling real-time, low-latency, audio-in and audio-out conversations with visual context understanding and function calling.
-   **Google Search Grounding**: The `Explore` page utilizes this tool to provide answers based on real-time web search results.

---

## 🛠️ Tech Stack

-   **Frontend**: React 19, TypeScript, Tailwind CSS
-   **AI**: Google Gemini API via the `@google/genai` SDK
-   **State Management**: React Hooks (`useState`, `useContext`, `useRef`)
-   **Utilities**: `nanoid` for unique ID generation

---

## ⚙️ How It Works

1.  **Select a Tool**: Choose one of the main Creative Studios or a specialized Mini-App from the navigation.
2.  **Provide Input**: Upload images, record audio, or enter text prompts to give the AI your creative direction.
3.  **Configure Settings**: Use the intuitive control panels to adjust aspect ratios, select styles, define negative prompts, and more.
4.  **Generate**: Click the "Generate" button and let the AI bring your idea to life.
5.  **Refine and Export**: Use the built-in editing tools to refine your creation or export it directly. Your work is automatically saved to the History panel for later use.

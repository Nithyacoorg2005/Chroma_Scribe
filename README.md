ChromaScribe
Your thoughts, gestures, and voice are your paintbrush.

What it Does
ChromaScribe is an immersive 3D generative art tool that transforms your natural movements and voice into digital art.

Gesture Drawing: Use your webcam to draw in a 3D canvas with your hand. The app tracks your index finger to create art. Making a fist pauses the drawing.

Voice-Controlled Brush: Use your microphone to change the brush's color (hue) and size (volume). Move your hand forward and back (depth) to control its vibrancy (saturation).

AI Evolution: Type a text prompt (e.g., "a city of light") and click the "Evolve" button. The app sends your 3D sketch and your prompt to an AI, which generates a beautiful, photorealistic image based on your creation.

Brush Styles: Switch between different drawing modes, including a permanent "Ink" line and a fading "Smoke" trail.

Tech Stack
ChromaScribe is a 100% serverless web application.

Frontend: React, TypeScript, Vite

3D Canvas: react-three/fiber, react-three/drei

Hand Tracking: Google's MediaPipe Hand Landmarker

Voice Analysis: Web Audio API

AI Generation: Puter.js (for serverless, free AI image-to-image generation)

Styling: Tailwind CSS

Deployment: Vercel

How to Run Locally
Clone the repository.

Navigate to the project directory: cd Chroma_Scribe

Install dependencies: npm install

Run the development server: npm run dev

Open http://localhost:5173 in your browser.

You will need to add a .env file in the root directory if you are using a local API key for services, but the Puter.js version works by asking the user to log in.

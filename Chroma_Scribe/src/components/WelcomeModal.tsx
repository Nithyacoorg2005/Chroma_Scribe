import React from 'react';
import { FiZap, FiMousePointer, FiVolume2 } from 'react-icons/fi';

type WelcomeModalProps = {
    show: boolean;
    onClose: () => void;
};

const WelcomeModal: React.FC<WelcomeModalProps> = ({ show, onClose }) => {
    if (!show) {
        return null;
    }

    return (
        <div className="absolute top-0 left-0 w-full h-full z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm">
            {/* Animation Container */}
            <div 
                className="bg-vintage-bg border-2 border-vintage-accent w-full max-w-2xl p-8 shadow-2xl animate-fade-in"
                style={{
                    boxShadow: '0 0 40px 10px rgba(199, 162, 80, 0.3)',
                    animation: 'fadeInScale 0.5s ease-out forwards',
                }}
            >
                {/* Header */}
                <h1 className="font-heading text-5xl text-vintage-text mb-2">
                    Welcome to Chroma-Scribe
                </h1>
                <p className="font-body text-xl text-vintage-text opacity-80 italic mb-6">
                    Your thoughts, gestures, and voice are your paintbrush.
                </p>

                {/* How it Works */}
                <h2 className="font-heading text-2xl text-vintage-accent mb-4">
                    How It Works
                </h2>
                <div className="space-y-4 font-body text-vintage-text text-lg">
                    <div className="flex items-start gap-4">
                        <FiMousePointer size={24} className="text-vintage-accent mt-1 flex-shrink-0" />
                        <div>
                            <strong className="text-vintage-text">1. DRAW:</strong> Use your hand to draw in 3D space. Make a **fist** to stop drawing.
                        </div>
                    </div>
                    <div className="flex items-start gap-4">
                        <FiVolume2 size={24} className="text-vintage-accent mt-1 flex-shrink-0" />
                        <div>
                            <strong className="text-vintage-text">2. COLOR:</strong> Use your voice to change the brush's color (hue) and size (volume). Move your hand forward/backward to change its vibrancy.
                        </div>
                    </div>
                    <div className="flex items-start gap-4">
                        <FiZap size={24} className="text-vintage-accent mt-1 flex-shrink-0" />
                        <div>
                            <strong className="text-vintage-text">3. EVOLVE:</strong> Type a prompt (e.g., "a city of light") and click the ⚡ button to transform your sketch into an AI masterpiece.
                        </div>
                    </div>
                </div>

                {/* Button */}
                <button
                    onClick={onClose}
                    className="w-full mt-8 p-4 bg-vintage-accent text-vintage-bg font-heading text-2xl transition-all duration-200 hover:bg-opacity-80 active:scale-95"
                >
                    Let's Begin
                </button>
            </div>
        </div>
    );
};

export default WelcomeModal;
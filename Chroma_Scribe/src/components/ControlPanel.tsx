import React from 'react';
import { 
    FiMic, 
    FiMicOff, 
    FiCamera, 
    FiCameraOff, 
    FiTrash2, 
    FiDownload,
    FiZap
} from 'react-icons/fi';

// Define the new props
type ControlPanelProps = {
    micEnabled: boolean;
    cameraEnabled: boolean;
    brushStyle: 'string' | 'ink' | 'smoke';
    onToggleMic: () => void;
    onToggleCamera: () => void;
    onClearCanvas: () => void;
    onSaveSnapshot: () => void;
    onChangeBrushStyle: () => void;
    prompt: string;
    onPromptChange: (value: string) => void;
    onEvolve: () => void;
    audioData: { volume: number; pitch: number }; // <-- ADD THIS PROP
};

const ControlPanel: React.FC<ControlPanelProps> = ({
    micEnabled,
    cameraEnabled,
    brushStyle,
    onToggleMic,
    onToggleCamera,
    onClearCanvas,
    onSaveSnapshot,
    onChangeBrushStyle,
    prompt,
    onPromptChange,
    onEvolve,
    audioData // <-- GET THE PROP
}) => {

    // --- NEW: Audio-Reactive Glow ---
    // Get volume (0-100) and map it to a soft glow opacity (0.0 - 0.7)
    const volume = audioData?.volume || 0;
    const glowAlpha = Math.min(volume / 50, 0.7);
    
    // Create the inline style for the glow. We use the vintage accent color.
    const glowStyle = {
        boxShadow: `0 0 25px 8px rgba(199, 162, 80, ${glowAlpha})`,
    };
    // --- END NEW ---

    // --- NEW: Animation classes for all buttons ---
    const buttonClass = "flex flex-col items-center justify-center p-2 w-20 h-16 border-2 bg-black bg-opacity-20 transition-all duration-200 ease-in-out hover:scale-105 active:scale-95";
    const actionButtonClass = "flex items-center justify-center p-4 h-16 w-16 border-2 bg-black bg-opacity-20 transition-all duration-200 ease-in-out hover:scale-105 active:scale-95";

    return (
        <footer 
            className="absolute bottom-0 left-0 w-full z-10 pointer-events-none transition-shadow duration-300 ease-out" // Added transition-shadow
            style={glowStyle} // Apply the glow style
        >
            {/* Accent Line */}
            <div className="h-0.5 w-full bg-vintage-accent opacity-50"></div>
            
            <div className="flex justify-between items-center w-full px-8 py-4 bg-vintage-bg pointer-events-auto">
                
                {/* Left Controls: Toggles */}
                <div className="flex gap-4">
                    <button
                        onClick={onToggleMic}
                        title={micEnabled ? 'Mute Microphone' : 'Unmute Microphone'}
                        className={`${buttonClass} ${micEnabled ? 'border-vintage-accent' : 'border-gray-600'}`}
                    >
                        {micEnabled ? <FiMic size={20} /> : <FiMicOff size={20} />}
                        <span className="font-body text-sm mt-1">{micEnabled ? 'VOICE ON' : 'VOICE'}</span>
                    </button>
                    
                    <button
                        onClick={onToggleCamera}
                        title={cameraEnabled ? 'Turn Off Camera' : 'Turn On Camera'}
                        className={`${buttonClass} ${cameraEnabled ? 'border-vintage-accent' : 'border-gray-600'}`}
                    >
                        {cameraEnabled ? <FiCamera size={20} /> : <FiCameraOff size={20} />}
                        <span className="font-body text-sm mt-1">{cameraEnabled ? 'GESTURE ON' : 'GESTURE'}</span>
                    </button>
                </div>

                {/* --- Center Controls: AI Prompt and Brush --- */}
                <div className="flex-1 flex justify-center items-end gap-4">
                    <input 
                        type="text"
                        value={prompt}
                        onChange={(e) => onPromptChange(e.target.value)}
                        placeholder="e.g., A dragon made of fire..."
                        className="font-body bg-black bg-opacity-20 border-2 border-gray-600 text-vintage-text p-2 rounded-none w-1/2 h-16"
                    />
                    <div className="flex flex-col items-center">
                        <button 
                            onClick={onChangeBrushStyle}
                            title="Change Brush Style"
                            className="px-6 py-2 h-16 border-2 border-gray-600 bg-black bg-opacity-20 hover:border-vintage-accent transition-all duration-200 ease-in-out hover:scale-105 active:scale-95"
                        >
                            <span className="font-body capitalize">{brushStyle}</span>
                        </button>
                    </div>
                </div>


                {/* Right Controls: Actions */}
                <div className="flex gap-4">
                    <button 
                        onClick={onEvolve}
                        title="Evolve with AI"
                        className="flex items-center justify-center p-4 h-16 w-16 border-2 border-vintage-accent bg-vintage-accent text-vintage-bg transition-all duration-200 ease-in-out hover:scale-105 active:scale-95 hover:bg-opacity-80"
                    >
                        <FiZap size={20} />
                    </button>

                    <button 
                        onClick={onClearCanvas}
                        title="Clear Canvas"
                        className={`${actionButtonClass} border-gray-600 hover:border-vintage-accent`}
                    >
                        <FiTrash2 size={20} />
                    </button>
                    <button 
                        onClick={onSaveSnapshot}
                        title="Save Snapshot"
                        className={`${actionButtonClass} border-gray-600 hover:border-vintage-accent`}
                    >
                        <FiDownload size={20} />
                    </button>
                </div>
            </div>
        </footer>
    );
};

export default ControlPanel;
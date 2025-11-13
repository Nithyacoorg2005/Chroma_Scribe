import React from 'react';
import { 
    FiMic, 
    FiMicOff, 
    FiCamera, 
    FiCameraOff, 
    FiTrash2, 
    FiDownload,
    FiZap // <-- THE REAL FIX: This icon exists and means "evolve"
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
    
    // --- New AI Props ---
    prompt: string;
    onPromptChange: (value: string) => void;
    onEvolve: () => void;
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
    onEvolve
}) => {
    return (
        <footer className="absolute bottom-0 left-0 w-full z-10 pointer-events-none">
            {/* Accent Line */}
            <div className="h-0.5 w-full bg-vintage-accent opacity-50"></div>
            
            <div className="flex justify-between items-center w-full px-8 py-4 bg-vintage-bg pointer-events-auto">
                
                {/* Left Controls: Toggles */}
                <div className="flex gap-4">
                    <button
                        onClick={onToggleMic}
                        title={micEnabled ? 'Mute Microphone' : 'Unmute Microphone'}
                        className={`flex flex-col items-center justify-center p-2 w-20 h-16 border-2 ${micEnabled ? 'border-vintage-accent' : 'border-gray-600'} bg-black bg-opacity-20 hover:border-vintage-accent`}
                    >
                        {micEnabled ? <FiMic size={20} /> : <FiMicOff size={20} />}
                        <span className="font-body text-sm mt-1">{micEnabled ? 'VOICE ON' : 'VOICE'}</span>
                    </button>
                    
                    <button
                        onClick={onToggleCamera}
                        title={cameraEnabled ? 'Turn Off Camera' : 'Turn On Camera'}
                        className={`flex flex-col items-center justify-center p-2 w-20 h-16 border-2 ${cameraEnabled ? 'border-vintage-accent' : 'border-gray-600'} bg-black bg-opacity-20 hover:border-vintage-accent`}
                    >
                        {cameraEnabled ? <FiCamera size={20} /> : <FiCameraOff size={20} />}
                        <span className="font-body text-sm mt-1">{cameraEnabled ? 'GESTURE ON' : 'GESTURE'}</span>
                    </button>
                </div>

                {/* --- Center Controls: AI Prompt and Brush --- */}
                <div className="flex-1 flex justify-center items-end gap-4">
                    {/* New AI Prompt Input */}
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
                            className="px-6 py-2 h-16 border-2 border-gray-600 bg-black bg-opacity-20 hover:border-vintage-accent"
                        >
                            <span className="font-body capitalize">{brushStyle}</span>
                        </button>
                    </div>
                </div>


                {/* Right Controls: Actions */}
                <div className="flex gap-4">
                    {/* New Evolve Button */}
                    <button 
                        onClick={onEvolve}
                        title="Evolve with AI"
                        className="flex items-center justify-center p-4 h-16 w-16 border-2 border-vintage-accent bg-vintage-accent text-vintage-bg hover:bg-opacity-80"
                    >
                        <FiZap size={20} /> {/* <-- THE REAL FIX */}
                    </button>

                    <button 
                        onClick={onClearCanvas}
                        title="Clear Canvas"
                        className="flex items-center justify-center p-4 h-16 w-16 border-2 border-gray-600 bg-black bg-opacity-20 hover:border-vintage-accent"
                    >
                        <FiTrash2 size={20} />
                    </button>
                    <button 
                        onClick={onSaveSnapshot}
                        title="Save Snapshot"
                        className="flex items-center justify-center p-4 h-16 w-16 border-2 border-gray-600 bg-black bg-opacity-20 hover:border-vintage-accent"
                    >
                        <FiDownload size={20} />
                    </button>
                </div>
            </div>
        </footer>
    );
};

export default ControlPanel;
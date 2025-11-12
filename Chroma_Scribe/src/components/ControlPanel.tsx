import React from 'react';

// Make sure you have react-icons installed: npm install react-icons
import { 
    FiMic, 
    FiMicOff, 
    FiCamera, 
    FiCameraOff, 
    FiTrash2, 
    FiDownload 
} from 'react-icons/fi';

// STEP 1: Define the props type
type ControlPanelProps = {
    micEnabled: boolean;
    cameraEnabled: boolean;
    brushStyle: 'string' | 'ink' | 'smoke';
    onToggleMic: () => void;
    onToggleCamera: () => void;
    onClearCanvas: () => void;
    onSaveSnapshot: () => void;
    onChangeBrushStyle: () => void; // Changed to a simple toggle
};

// STEP 2: Use the props in the component
const ControlPanel: React.FC<ControlPanelProps> = ({
    micEnabled,
    cameraEnabled,
    brushStyle,
    onToggleMic,
    onToggleCamera,
    onClearCanvas,
    onSaveSnapshot,
    onChangeBrushStyle
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

                {/* Center Control: Brush */}
                <div className="flex flex-col items-center">
                    <button 
                        onClick={onChangeBrushStyle}
                        title="Change Brush Style"
                        className="px-6 py-2 border-2 border-gray-600 bg-black bg-opacity-20 hover:border-vintage-accent"
                    >
                        <span className="font-body capitalize">{brushStyle}</span>
                    </button>
                    <span className="font-body text-sm mt-1 opacity-70">BRUSH</span>
                </div>

                {/* Right Controls: Actions */}
                <div className="flex gap-4">
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
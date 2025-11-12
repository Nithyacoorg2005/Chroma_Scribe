import React, { useEffect, useRef } from 'react';

// You will need to install react-icons for these
// npm install react-icons
import { VscChromeClose, VscChromeMinimize } from 'react-icons/vsc'; 

type CameraPreviewProps = {
    stream: MediaStream | null;
    onClose: () => void;
    isMinimized: boolean;
    onToggleMinimize: () => void;
};

const CameraPreview: React.FC<CameraPreviewProps> = ({
    stream,
    onClose,
    isMinimized,
    onToggleMinimize
}) => {
    const videoRef = useRef<HTMLVideoElement>(null);

    // When the stream prop changes, attach it to the video element
    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
        }
    }, [stream]);

    if (!stream) {
        return null; // Don't render anything if the camera is off
    }

    return (
        <div
            className={`absolute top-8 right-8 z-20 bg-vintage-bg border-2 border-vintage-accent shadow-lg transition-all duration-300 ${
                isMinimized ? 'h-10 w-40' : 'h-48 w-64'
            }`}
        >
            {/* --- Header Bar --- */}
            <div className="flex justify-between items-center h-10 bg-vintage-accent px-2">
                <span className="font-body text-sm text-vintage-bg font-bold">
                    CAMERA PREVIEW
                </span>
                <div className="flex gap-2">
                    <button
                        onClick={onToggleMinimize}
                        className="text-vintage-bg hover:text-white"
                    >
                        <VscChromeMinimize size={16} />
                    </button>
                    <button
                        onClick={onClose}
                        className="text-vintage-bg hover:text-white"
                    >
                        <VscChromeClose size={16} />
                    </button>
                </div>
            </div>

            {/* --- Video Feed --- */}
            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-[calc(100%-2.5rem)] object-cover transform -scale-x-100 ${
                    isMinimized ? 'hidden' : 'block'
                }`}
            />
        </div>
    );
};

export default CameraPreview;
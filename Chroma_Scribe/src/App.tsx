import { useState, useEffect, useRef } from 'react';
import Canvas3D from './components/Canvas3D';
import ControlPanel from './components/ControlPanel';
import CameraPreview from './components/CameraPreview';
import { useHandTracking } from './hooks/useHandTracking';
import { useAudioAnalysis } from './hooks/useAudioAnalysis';
import { FiLoader } from 'react-icons/fi';
import WelcomeModal from './components/WelcomeModal';

// This lets TypeScript know that 'puter' exists on the window
declare const puter: any;

// --- Helper Components for AI ---

const ImageDisplay = ({ src, onClear }: { src: string, onClear: () => void }) => (
    <div className="absolute top-0 left-0 w-full h-full z-30 bg-black bg-opacity-70 flex items-center justify-center">
        <div className="relative">
            <img src={src} alt="Evolved AI Art" className="max-w-[80vw] max-h-[80vh]" />
            <button
                onClick={onClear}
                className="absolute top-4 right-4 text-white bg-vintage-accent p-2 rounded-full"
            >
                &times;
            </button>
        </div>
    </div>
);

const Loader = () => (
    <div className="absolute top-0 left-0 w-full h-full z-30 bg-black bg-opacity-50 flex flex-col items-center justify-center">
        <FiLoader className="animate-spin text-vintage-accent" size={64} />
        <span className="font-body text-vintage-text mt-4">Evolving your art...</span>
    </div>
);


function App() {
    // --- Standard States ---
    const [micEnabled, setMicEnabled] = useState(false);
    const [cameraEnabled, setCameraEnabled] = useState(false);
    const [brushStyle, setBrushStyle] = useState<'ink' | 'smoke' | 'string'>('ink');
    const [clearCanvas, setClearCanvas] = useState(false);
    const [takeSnapshot, setTakeSnapshot] = useState(false);
    const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
    const [isPreviewMinimized, setIsPreviewMinimized] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);

    // --- New AI States ---
    const [showModal, setShowModal] = useState(true);
    const [prompt, setPrompt] = useState("");
    const [isEvolving, setIsEvolving] = useState(false);
    const [finalImage, setFinalImage] = useState<string | null>(null);
    const [snapshotCallback, setSnapshotCallback] = useState<Function | null>(null);

    // --- Hooks ---
    const audioData = useAudioAnalysis(micEnabled);
    const { landmarks: handPosition, isInitialized: isHandtrackingInitialized, isDrawing } = useHandTracking(
        videoRef,
        cameraStream,
        cameraEnabled
    );

    // --- Camera Logic (No change) ---
    useEffect(() => {
        const initCamera = async () => {
            if (cameraEnabled) {
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({
                        video: { facingMode: 'user' },
                    });
                    setCameraStream(stream);
                    if (videoRef.current) {
                        videoRef.current.srcObject = stream;
                        await videoRef.current.play();
                    }
                } catch (error) {
                    console.error('Failed to access camera:', error);
                    setCameraEnabled(false);
                }
            } else {
                if (cameraStream) {
                    cameraStream.getTracks().forEach(track => track.stop());
                    setCameraStream(null);
                }
            }
        };
        initCamera();
        return () => {
            if (cameraStream) {
                cameraStream.getTracks().forEach(track => track.stop());
            }
        };
    }, [cameraEnabled]);

    // --- Handlers (No change) ---
    const handleToggleMic = () => setMicEnabled(prev => !prev);
    const handleToggleCamera = () => setCameraEnabled(prev => !prev);
    const handleClearCanvas = () => setClearCanvas(true);
    const handleSaveSnapshot = () => setTakeSnapshot(true);
    const handleChangeBrushStyle = () => {
        setBrushStyle(prev => {
            if (prev === 'ink') return 'smoke';
            if (prev === 'smoke') return 'string';
            return 'ink';
        });
    };
    const handleClosePreview = () => setCameraEnabled(false);

    // --- THIS IS THE FINAL AI FUNCTION ---
    const handleEvolve = () => {
        if (!prompt) {
            alert("Please enter a prompt to evolve your art.");
            return;
        }

        setIsEvolving(true);

        setSnapshotCallback(() => async (snapshotDataUrl: string) => {
            try {
                // The snapshot data looks like "data:image/png;base64,iVBORw0KGgo..."
                // We need to split it into the mime type and the raw data
                const parts = snapshotDataUrl.split(',');
                const mimeType = parts[0].match(/:(.*?);/)?.[1] || 'image/png';
                const base64Data = parts[1];

                // Call Puter.js AI with the correct model and format
                const imageElement = await puter.ai.txt2img(
                    prompt, // The text prompt
                    {
                        model: 'gemini-2.5-flash-image-preview', // The correct serverless model
                        input_image: base64Data,                // The raw base64 data
                        input_image_mime_type: mimeType         // The mime type
                    }
                );
                
                setFinalImage(imageElement.src);

            } catch (error) {
                console.error("Failed to evolve image:", error);
                alert("Failed to evolve image. Check console (F12).");
            }
            setIsEvolving(false);
            setSnapshotCallback(null);
        });
    };
    // --- END OF FUNCTION ---

    return (
        <div className="relative w-full h-screen overflow-hidden bg-canvas">
            <WelcomeModal show={showModal} onClose={() => setShowModal(false)} />
            {isEvolving && <Loader />}
            {finalImage && <ImageDisplay src={finalImage} onClear={() => setFinalImage(null)} />}

            <video ref={videoRef} className="hidden" playsInline muted />

            {/* Header Title (No change) */}
            <div className="fixed top-10 left-10 z-10 pointer-events-none">
                <div className="bg-panel px-8 py-6 border-l-4 border-t-4 border-accent-mustard shadow-lg" style={{boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)'}}>
                    <h1 className="font-heading text-5xl text-primary mb-2 leading-tight">
                        CHROMA<span className="text-accent-mustard">·</span>SCRIBE
                    </h1>
                    <p className="font-body text-xs text-primary/70 italic tracking-widest">
                        GESTURE + VOICE GENERATIVE ART
                    </p>
                </div>
            </div>

            {/* Canvas3D (No change) */}
            <Canvas3D
                handPosition={handPosition}
                audioData={audioData}
                brushStyle={brushStyle}
                isDrawing={isDrawing} 
                clearCanvas={clearCanvas}
                onClearComplete={() => setClearCanvas(false)}
                takeSnapshot={takeSnapshot || !!snapshotCallback}
                onSnapshotComplete={(dataUrl) => {
                    if (snapshotCallback) {
                        snapshotCallback(dataUrl);
                    } else {
                        const link = document.createElement('a');
                        link.setAttribute('download', 'chroma-scribe.png');
                        link.setAttribute('href', dataUrl);
                        link.click();
                    }
                    setTakeSnapshot(false);
                    setSnapshotCallback(null);
                }}
            />

            {/* CameraPreview (No change) */}
            <CameraPreview
                stream={cameraStream}
                onClose={handleClosePreview}
                isMinimized={isPreviewMinimized}
                onToggleMinimize={() => setIsPreviewMinimized(prev => !prev)}
            />

           <ControlPanel
                micEnabled={micEnabled}
                cameraEnabled={cameraEnabled}
                brushStyle={brushStyle}
                onToggleMic={handleToggleMic}
                onToggleCamera={handleToggleCamera}
                onClearCanvas={handleClearCanvas}
                onSaveSnapshot={handleSaveSnapshot}
                onChangeBrushStyle={handleChangeBrushStyle}
                prompt={prompt}
                onPromptChange={setPrompt}
                onEvolve={handleEvolve}
                audioData={audioData} // <-- ADD THIS LINE
            />
        </div>
    );
}

export default App;
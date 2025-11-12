import { useState, useEffect, useRef } from 'react';
import Canvas3D from './components/Canvas3D';
import ControlPanel from './components/ControlPanel';
import CameraPreview from './components/CameraPreview';
import { useHandTracking } from './hooks/useHandTracking';
import { useAudioAnalysis } from './hooks/useAudioAnalysis';

function App() {
  const [micEnabled, setMicEnabled] = useState(false);
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [brushStyle, setBrushStyle] = useState<'ink' | 'smoke' | 'string'>('ink');
  const [clearCanvas, setClearCanvas] = useState(false);
  const [takeSnapshot, setTakeSnapshot] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [isPreviewMinimized, setIsPreviewMinimized] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const audioData = useAudioAnalysis(micEnabled);
  const handPosition = useHandTracking(videoRef.current, cameraEnabled);

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

  const handleToggleMic = () => {
    setMicEnabled(prev => !prev);
  };

  const handleToggleCamera = () => {
    setCameraEnabled(prev => !prev);
  };

  const handleClearCanvas = () => {
    setClearCanvas(true);
  };

  const handleSaveSnapshot = () => {
    setTakeSnapshot(true);
  };

  const handleChangeBrushStyle = () => {
    setBrushStyle(prev => {
      if (prev === 'ink') return 'smoke';
      if (prev === 'smoke') return 'string';
      return 'ink';
    });
  };

  const handleClosePreview = () => {
    setCameraEnabled(false);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-canvas">
      <video ref={videoRef} className="hidden" playsInline muted />

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

      <Canvas3D
        handPosition={handPosition}
        audioData={audioData}
        brushStyle={brushStyle}
        clearCanvas={clearCanvas}
        onClearComplete={() => setClearCanvas(false)}
        onSnapshot={() => setTakeSnapshot(false)}
        takeSnapshot={takeSnapshot}
      />

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
      />
    </div>
  );
}

export default App;

import { useEffect, useRef } from 'react';
import { X, Minus, Plus } from 'lucide-react';

interface CameraPreviewProps {
  stream: MediaStream | null;
  onClose: () => void;
  isMinimized: boolean;
  onToggleMinimize: () => void;
}

export default function CameraPreview({
  stream,
  onClose,
  isMinimized,
  onToggleMinimize,
}: CameraPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  if (!stream) return null;

  return (
    <div
      className={`fixed top-8 right-8 transition-all duration-300 z-40 ${
        isMinimized ? 'w-20 h-20' : 'w-56 h-56'
      }`}
    >
      <div className="relative w-full h-full overflow-hidden border-2 border-accent-mustard bg-panel-dark" style={{boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)'}}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover scale-x-[-1]"
        />

        <div className="absolute bottom-0 right-0 flex gap-2 p-2 bg-gradient-to-t from-panel-dark to-transparent">
          <button
            onClick={onToggleMinimize}
            className="w-8 h-8 bg-panel-dark border border-accent-mustard flex items-center justify-center hover:bg-accent-mustard transition-all text-primary hover:text-panel-dark"
            aria-label={isMinimized ? 'Expand preview' : 'Minimize preview'}
            title={isMinimized ? 'Expand' : 'Minimize'}
          >
            {isMinimized ? <Plus size={16} strokeWidth={2} /> : <Minus size={16} strokeWidth={2} />}
          </button>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-panel-dark border border-accent-mustard flex items-center justify-center hover:bg-accent-mustard transition-all text-primary hover:text-panel-dark"
            aria-label="Close preview"
            title="Close"
          >
            <X size={16} strokeWidth={2} />
          </button>
        </div>

        {!isMinimized && (
          <div className="absolute top-0 left-0 right-0 text-center pt-2 pointer-events-none">
            <p className="text-primary text-xs font-body-bold opacity-70">GESTURE</p>
          </div>
        )}
      </div>
    </div>
  );
}

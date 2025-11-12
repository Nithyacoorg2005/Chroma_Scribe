import { useState } from 'react';
import { Mic, MicOff, Video, VideoOff, Trash2, Camera, ChevronUp } from 'lucide-react';

interface ControlPanelProps {
  micEnabled: boolean;
  cameraEnabled: boolean;
  brushStyle: 'ink' | 'smoke' | 'string';
  onToggleMic: () => void;
  onToggleCamera: () => void;
  onClearCanvas: () => void;
  onSaveSnapshot: () => void;
  onChangeBrushStyle: () => void;
}

export default function ControlPanel({
  micEnabled,
  cameraEnabled,
  brushStyle,
  onToggleMic,
  onToggleCamera,
  onClearCanvas,
  onSaveSnapshot,
  onChangeBrushStyle,
}: ControlPanelProps) {
  const [brushDropdownOpen, setBrushDropdownOpen] = useState(false);

  const brushNames = {
    ink: 'Ink Ribbon',
    smoke: 'Smoke Trail',
    string: 'String',
  };

  const brushOptions: Array<'ink' | 'smoke' | 'string'> = ['ink', 'smoke', 'string'];

  const handleBrushSelect = (style: 'ink' | 'smoke' | 'string') => {
    if (style !== brushStyle) {
      onChangeBrushStyle();
    }
    setBrushDropdownOpen(false);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-panel border-t-2 border-accent-mustard">
      <div className="px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-center gap-3">
            <button
              onClick={onToggleMic}
              className={`toggle-switch ${micEnabled ? 'active' : ''}`}
              aria-label="Toggle microphone"
              title={micEnabled ? 'Voice enabled' : 'Voice disabled'}
            >
              <div className="toggle-indicator" />
            </button>
            <span className="control-label">Voice</span>
          </div>

          <div className="divider-line" />

          <div className="flex flex-col items-center gap-3">
            <button
              onClick={onToggleCamera}
              className={`toggle-switch ${cameraEnabled ? 'active' : ''}`}
              aria-label="Toggle camera"
              title={cameraEnabled ? 'Gesture enabled' : 'Gesture disabled'}
            >
              <div className="toggle-indicator" />
            </button>
            <span className="control-label">Gesture</span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="divider-line" />

          <div className="brush-dropdown">
            <button
              onClick={() => setBrushDropdownOpen(!brushDropdownOpen)}
              className="analog-button flex items-center justify-between gap-3"
              aria-label="Select brush style"
              aria-haspopup="true"
              aria-expanded={brushDropdownOpen}
            >
              <span className="font-body-bold">{brushNames[brushStyle]}</span>
              <ChevronUp
                size={16}
                className={`transition-transform ${brushDropdownOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {brushDropdownOpen && (
              <div className="brush-dropdown-menu">
                {brushOptions.map(option => (
                  <button
                    key={option}
                    onClick={() => handleBrushSelect(option)}
                    className="brush-dropdown-item"
                    data-selected={option === brushStyle}
                  >
                    {brushNames[option]}
                    {option === brushStyle && ' ✓'}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="divider-line" />

          <div className="flex flex-col items-center gap-3">
            <button
              onClick={onClearCanvas}
              className="analog-button-icon"
              aria-label="Clear canvas"
              title="Clear all artwork"
            >
              <Trash2 size={20} strokeWidth={1.5} />
            </button>
            <span className="control-label">Clear</span>
          </div>

          <div className="flex flex-col items-center gap-3">
            <button
              onClick={onSaveSnapshot}
              className="analog-button-icon"
              aria-label="Save snapshot"
              title="Save artwork as PNG"
            >
              <Camera size={20} strokeWidth={1.5} />
            </button>
            <span className="control-label">Save</span>
          </div>
        </div>
      </div>
    </div>
  );
}

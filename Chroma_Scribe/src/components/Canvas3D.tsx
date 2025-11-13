import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Sphere, Trail, Line } from '@react-three/drei';
import * as THREE from 'three';

// --- Type Definitions ---
// (No changes to types)
type Canvas3DProps = {
    handPosition: any;
    audioData: { volume: number; pitch: number };
    brushStyle: 'ink' | 'smoke' | 'string';
    clearCanvas: boolean;
    onClearComplete: () => void;
    takeSnapshot: boolean;
    onSnapshotComplete: (dataUrl: string) => void;
};

type BrushProps = {
    handPosition: any;
    audioData: { volume: number; pitch: number };
    brushRef: React.RefObject<THREE.Mesh>;
};

type ArtRendererProps = Canvas3DProps;

// --- 1. The Brush Component (The moving dot) ---
// (No changes to this component)
function Brush({ handPosition, audioData, brushRef }: BrushProps) {
    const brushColor = new THREE.Color().setHSL(audioData.volume / 100, 1.0, 0.5);
    const brushScale = 0.1 + (audioData.volume / 50);

    useFrame(() => {
        if (handPosition && handPosition.length > 0 && handPosition[0][8]) {
            const indexFingerTip = handPosition[0][8];
            const x = (indexFingerTip.x - 0.5) * -15;
            const y = (indexFingerTip.y - 0.5) * -10;
            const z = -indexFingerTip.z * 5;
            const newPoint = new THREE.Vector3(x, y, z);

            if (brushRef.current) {
                brushRef.current.position.lerp(newPoint, 0.5);
            }
        }
    });

    return (
        <Sphere ref={brushRef} args={[brushScale, 32, 32]}>
            <meshStandardMaterial
                color={brushColor}
                emissive={brushColor}
                emissiveIntensity={2}
            />
        </Sphere>
    );
}

// --- 2. The Main Scene Renderer (This is where all the logic moves) ---
function SceneRenderer(props: ArtRendererProps) {
    const { gl } = useThree();
    const { 
        handPosition, 
        audioData, 
        brushStyle, 
        takeSnapshot, 
        onSnapshotComplete, 
        clearCanvas, 
        onClearComplete 
    } = props;
    
    const brushRef = useRef<THREE.Mesh>(null!);
    
    // --- THIS IS THE NEW LOGIC ---
    // We now store a list of permanent points for the line
    const [points, setPoints] = useState<THREE.Vector3[]>([]);
    const [isDrawing, setIsDrawing] = useState(false);
    
    // This state controls resetting the components
    const [renderKey, setRenderKey] = useState(0);

    // Audio-driven values
    const brushColor = new THREE.Color().setHSL(audioData.volume / 100, 1.0, 0.5);
    const baseScale = (0.1 + (audioData.volume / 50));

    // Update drawing state based on hand presence
    useFrame(() => {
        if (handPosition && handPosition.length > 0 && handPosition[0][8]) {
            if (!isDrawing) setIsDrawing(true); // Set drawing to true

            // Add the brush's current position to the points list
            // We only do this for line-based brushes
            if (brushStyle === 'string' || brushStyle === 'ink') {
                if (brushRef.current) {
                    // Only add point if it's different from the last one
                    const newPoint = brushRef.current.position.clone();
                    setPoints(prevPoints => {
                        if (prevPoints.length === 0 || !prevPoints[prevPoints.length - 1].equals(newPoint)) {
                            return [...prevPoints, newPoint];
                        }
                        return prevPoints;
                    });
                }
            }
        } else {
            if (isDrawing) setIsDrawing(false); // Set drawing to false
        }
    });

    // Handle 'takeSnapshot'
    useEffect(() => {
        if (takeSnapshot) {
            const dataUrl = gl.domElement.toDataURL('image/png');
            onSnapshotComplete(dataUrl);
        }
    }, [takeSnapshot, gl, onSnapshotComplete]);

    // Handle 'clearCanvas'
    useEffect(() => {
        if (clearCanvas) {
            setPoints([]); // Clear the permanent points
            setRenderKey(prevKey => prevKey + 1); // Reset fading components
            onClearComplete();
        }
    }, [clearCanvas, onClearComplete]);

    // --- Brush Style Config ---
    let trailConfig = {
        width: 1,
        length: 1,
        attenuation: (t: number) => 0
    };
    
    let lineConfig = {
        lineWidth: 1,
    };

    if (brushStyle === 'string') {
        lineConfig.lineWidth = baseScale * 10;
    } else if (brushStyle === 'ink') {
        lineConfig.lineWidth = baseScale * 25; // Much thicker
    } else if (brushStyle === 'smoke') {
        trailConfig = {
            width: baseScale * 4.0,
            length: 30,
            attenuation: (t: number) => t // Fades linearly
        };
    }

    return (
        <>
            {/* 1. The visible brush dot */}
            <Brush
                brushRef={brushRef}
                handPosition={handPosition}
                audioData={audioData}
            />

            {/* 2. The Art Component (Conditional Rendering) */}
            
            {/* If 'smoke', use the fading Trail */}
            {brushStyle === 'smoke' && isDrawing && (
                <Trail
                    key={`trail-${renderKey}`} // Key to reset
                    target={brushRef}
                    width={trailConfig.width}
                    length={trailConfig.length}
                    color={brushColor}
                    attenuation={trailConfig.attenuation}
                />
            )}

            {/* If 'string' or 'ink', use a permanent Line */}
            {(brushStyle === 'string' || brushStyle === 'ink') && points.length > 1 && (
                <Line
                    key={`line-${renderKey}`} // Key to reset
                    points={points}
                    color={brushColor}
                    lineWidth={lineConfig.lineWidth}
                />
            )}
        </>
    );
}

// --- 3. The Main Canvas Component ---
// (No changes)
const Canvas3D: React.FC<Canvas3DProps> = (props) => {
    return (
        <div className="absolute top-0 left-0 w-full h-full z-0">
            <Canvas camera={{ position: [0, 0, 8] }} gl={{ preserveDrawingBuffer: true }}>
                <color attach="background" args={['#28282D']} />
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} />
                <SceneRenderer {...props} />
            </Canvas>
        </div>
    );
};

export default Canvas3D;
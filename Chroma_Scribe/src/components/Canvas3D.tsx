import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Sphere, Trail, Line } from '@react-three/drei';
import * as THREE from 'three';

// --- Type Definitions ---
type Canvas3DProps = {
    handPosition: any;
    audioData: { volume: number; pitch: number };
    brushStyle: 'ink' | 'smoke' | 'string';
    isDrawing: boolean;
    clearCanvas: boolean;
    onClearComplete: () => void;
    takeSnapshot: boolean;
    onSnapshotComplete: (dataUrl: string) => void;
};

type BrushProps = {
    handPosition: any;
    audioData: { volume: number; pitch: number };
    brushRef: React.RefObject<THREE.Mesh>;
    saturation: number;
};

// THIS IS THE CORRECTED TYPE FOR ARTTRAIL
type ArtTrailProps = {
    audioData: { volume: number; pitch: number };
    brushRef: React.RefObject<THREE.Object3D>;
    brushStyle: 'ink' | 'smoke' | 'string';
    saturation: number;
};

// --- 1. The Brush Component (The moving dot) ---
function Brush({ handPosition, audioData, brushRef, saturation }: BrushProps) {
    const brushColor = new THREE.Color().setHSL(
        audioData.volume / 100, // Hue
        saturation,              // Saturation
        0.5                      // Lightness
    );
    
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

// --- 2. The Art Trail Component ---
// This now uses the correct ArtTrailProps type
function ArtTrail({ audioData, brushRef, brushStyle, saturation }: ArtTrailProps) {
    const brushColor = new THREE.Color().setHSL(
        audioData.volume / 100, // Hue
        saturation,              // Saturation
        0.5                      // Lightness
    );
    
    const baseScale = (0.1 + (audioData.volume / 50));

    let trailConfig = { width: 1, length: 1, attenuation: (t: number) => 0 };

    if (brushStyle === 'smoke') {
        trailConfig = {
            width: baseScale * 4.0,
            length: 30,
            attenuation: (t: number) => t
        };
    } else {
      // 'string' or 'ink' are handled by SceneRenderer, but we must return a Trail for 'smoke'
      return null;
    }

    // Only return the Trail for 'smoke' style
    return (
        <Trail
            target={brushRef}
            width={trailConfig.width}
            length={trailConfig.length}
            color={brushColor}
            attenuation={trailConfig.attenuation}
        />
    );
}

// --- 3. The Main Scene Renderer ---
function SceneRenderer(props: Canvas3DProps) {
    const { gl } = useThree();
    const { 
        handPosition, 
        audioData, 
        brushStyle, 
        isDrawing,
        takeSnapshot, 
        onSnapshotComplete, 
        clearCanvas, 
        onClearComplete 
    } = props;
    
    const brushRef = useRef<THREE.Mesh>(null!);
    const [points, setPoints] = useState<THREE.Vector3[]>([]);
    const [renderKey, setRenderKey] = useState(0);
    const [saturation, setSaturation] = useState(1.0);

    useFrame(() => {
        if (brushRef.current) {
            const z = brushRef.current.position.z;
            const newSaturation = THREE.MathUtils.clamp(z + 0.5, 0.4, 1.0);
            setSaturation(newSaturation);

            if (isDrawing && (brushStyle === 'string' || brushStyle === 'ink')) {
                const newPoint = brushRef.current.position.clone();
                setPoints(prevPoints => {
                    if (prevPoints.length === 0 || !prevPoints[prevPoints.length - 1].equals(newPoint)) {
                        return [...prevPoints, newPoint];
                    }
                    return prevPoints;
                });
            }
        }
    });

    useEffect(() => {
        if (takeSnapshot) {
            const dataUrl = gl.domElement.toDataURL('image/png');
            onSnapshotComplete(dataUrl);
        }
    }, [takeSnapshot, gl, onSnapshotComplete]);

    useEffect(() => {
        if (clearCanvas) {
            setPoints([]); 
            setRenderKey(prevKey => prevKey + 1);
            onClearComplete();
        }
    }, [clearCanvas, onClearComplete]);

    const baseScale = (0.1 + (audioData.volume / 50));
    let lineConfig = { lineWidth: 1 };
    if (brushStyle === 'string') {
        lineConfig.lineWidth = baseScale * 10;
    } else if (brushStyle === 'ink') {
        lineConfig.lineWidth = baseScale * 25;
    }
    const brushColor = new THREE.Color().setHSL(audioData.volume / 100, saturation, 0.5);

    return (
        <>
            <Brush
                brushRef={brushRef}
                handPosition={handPosition}
                audioData={audioData}
                saturation={saturation}
            />

            {/* Fading trail for 'smoke' */}
            {brushStyle === 'smoke' && isDrawing && (
                <ArtTrail
                    key={`trail-${renderKey}`}
                    brushRef={brushRef}
                    audioData={audioData}
                    brushStyle={brushStyle}
                    saturation={saturation}
                    // {...props} has been removed
                />
            )}

            {/* Permanent line for 'string' or 'ink' */}
            {(brushStyle === 'string' || brushStyle === 'ink') && points.length > 1 && (
                <Line
                    key={`line-${renderKey}`}
                    points={points}
                    color={brushColor}
                    lineWidth={lineConfig.lineWidth}
                />
            )}
        </>
    );
}

// --- 4. The Main Canvas Component ---
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
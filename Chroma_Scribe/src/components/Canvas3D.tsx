import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Sphere, Trail } from '@react-three/drei';
import * as THREE from 'three';

// --- Type Definitions ---

type Canvas3DProps = {
    handPosition: any;
    audioData: { volume: number; pitch: number };
    brushStyle: 'ink' | 'smoke' | 'string';
    clearCanvas: boolean;
    onClearComplete: () => void;
    takeSnapshot: boolean;
    onSnapshot: () => void;
};

type BrushProps = {
    handPosition: any;
    audioData: { volume: number; pitch: number };
    brushRef: React.RefObject<THREE.Mesh>;
};

type ArtTrailProps = {
    audioData: { volume: number; pitch: number };
    brushRef: React.RefObject<THREE.Object3D>;
    brushStyle: 'ink' | 'smoke' | 'string';
};

// --- 1. The Brush Component (The moving dot) ---
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

// --- 2. The Art Trail Component ---
// This function definition should be clean.
// It should ONLY return the <Trail> component.
function ArtTrail({ audioData, brushRef, brushStyle }: ArtTrailProps) {
    const brushColor = new THREE.Color().setHSL(audioData.volume / 100, 1.0, 0.5);
    const baseScale = (0.1 + (audioData.volume / 50));

    let trailConfig = {
        width: baseScale,
        length: 100,
        attenuation: (t: number) => t * t // 'string' style
    };

    if (brushStyle === 'ink') {
        trailConfig = {
            width: baseScale * 2.0, // Thicker
            length: 80,
            attenuation: (t: number) => t * 0.5 // Fades slower
        };
    } else if (brushStyle === 'smoke') {
        trailConfig = {
            width: baseScale * 4.0, // Widest
            length: 30, // Shorter trail
            attenuation: (t: number) => t // Fades linearly (like smoke)
        };
    }

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
// THIS is where the logic for clearing/changing the brush belongs.
function SceneRenderer(props: Canvas3DProps) {
    const { gl } = useThree();
    const { takeSnapshot, onSnapshot, clearCanvas, onClearComplete } = props;
    const brushRef = useRef<THREE.Mesh>(null!);
    
    const [trailKey, setTrailKey] = useState(0);

    // Handle 'takeSnapshot'
    useEffect(() => {
        if (takeSnapshot) {
            const link = document.createElement('a');
            link.setAttribute('download', 'chroma-scribe.png');
            link.setAttribute('href', gl.domElement.toDataURL('image/png').replace('image/png', 'image/octet-stream'));
            link.click();
            onSnapshot();
        }
    }, [takeSnapshot, gl, onSnapshot]);

    // Handle 'clearCanvas'
    useEffect(() => {
        if (clearCanvas) {
            setTrailKey(prevKey => prevKey + 1); // Change key to reset
            onClearComplete();
        }
    }, [clearCanvas, onClearComplete]);

    return (
        <>
            <Brush
                brushRef={brushRef}
                handPosition={props.handPosition}
                audioData={props.audioData}
            />

            {/* THIS IS THE <ArtTrail> CALL.
              It goes inside SceneRenderer.
            */}
            <ArtTrail
                key={trailKey + props.brushStyle} // This key resets the component
                brushRef={brushRef}
                audioData={props.audioData}
                brushStyle={props.brushStyle}
            />
        </>
    );
}

// --- 4. The Main Canvas Component ---
const Canvas3D: React.FC<Canvas3DProps> = (props) => {
    return (
        <div className="absolute top-0 left-0 w-full h-full z-0">
            <Canvas camera={{ position: [0, 0, 8] }}>
                <color attach="background" args={['#28282D']} />
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} />
                <SceneRenderer {...props} />
            </Canvas>
        </div>
    );
};

export default Canvas3D;
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { HandPosition } from '../hooks/useHandTracking';
import { AudioData } from '../hooks/useAudioAnalysis';

interface Canvas3DProps {
  handPosition: HandPosition | null;
  audioData: AudioData;
  brushStyle: 'ink' | 'smoke' | 'string';
  clearCanvas: boolean;
  onClearComplete: () => void;
  onSnapshot: () => void;
  takeSnapshot: boolean;
}

export default function Canvas3D({
  handPosition,
  audioData,
  brushStyle,
  clearCanvas,
  onClearComplete,
  onSnapshot,
  takeSnapshot,
}: Canvas3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const trailGroupRef = useRef<THREE.Group | null>(null);
  const lastPositionRef = useRef<THREE.Vector3 | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x28282d);
    scene.fog = new THREE.Fog(0x28282d, 5, 15);

    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xefefef, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xefefef, 0.8);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    const trailGroup = new THREE.Group();
    scene.add(trailGroup);

    sceneRef.current = scene;
    cameraRef.current = camera;
    rendererRef.current = renderer;
    trailGroupRef.current = trailGroup;

    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      containerRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  useEffect(() => {
    if (clearCanvas && trailGroupRef.current) {
      trailGroupRef.current.children.forEach(child => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          if (Array.isArray(child.material)) {
            child.material.forEach(mat => mat.dispose());
          } else {
            child.material.dispose();
          }
        }
      });
      trailGroupRef.current.clear();
      lastPositionRef.current = null;
      onClearComplete();
    }
  }, [clearCanvas, onClearComplete]);

  useEffect(() => {
    if (takeSnapshot && rendererRef.current) {
      const canvas = rendererRef.current.domElement;
      canvas.toBlob(blob => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `chroma-scribe-${Date.now()}.png`;
          link.click();
          URL.revokeObjectURL(url);
        }
      });
      onSnapshot();
    }
  }, [takeSnapshot, onSnapshot]);

  useEffect(() => {
    if (!handPosition || !sceneRef.current || !trailGroupRef.current) {
      lastPositionRef.current = null;
      return;
    }

    const currentPosition = new THREE.Vector3(
      handPosition.x * 3,
      handPosition.y * 3,
      handPosition.z - 2
    );

    if (!lastPositionRef.current) {
      lastPositionRef.current = currentPosition.clone();
      return;
    }

    const distance = currentPosition.distanceTo(lastPositionRef.current);
    if (distance < 0.05) return;

    const color = getColorFromPitch(audioData.pitch);
    const size = 0.05 + audioData.volume * 0.3;

    if (brushStyle === 'ink') {
      createInkRibbon(lastPositionRef.current, currentPosition, color, size, handPosition.rotation);
    } else if (brushStyle === 'smoke') {
      createSmokeTrail(currentPosition, color, size);
    } else if (brushStyle === 'string') {
      createString(lastPositionRef.current, currentPosition, color);
    }

    lastPositionRef.current = currentPosition.clone();
  }, [handPosition, audioData, brushStyle]);

  const getColorFromPitch = (pitch: number): THREE.Color => {
    const colors = [
      new THREE.Color(0xc7a250),
      new THREE.Color(0x598280),
      new THREE.Color(0xb86a4c),
    ];

    if (pitch < 0.33) {
      return new THREE.Color().lerpColors(colors[0], colors[1], pitch * 3);
    } else if (pitch < 0.67) {
      return new THREE.Color().lerpColors(colors[1], colors[2], (pitch - 0.33) * 3);
    } else {
      return new THREE.Color().lerpColors(colors[2], colors[0], (pitch - 0.67) * 3);
    }
  };

  const createInkRibbon = (
    start: THREE.Vector3,
    end: THREE.Vector3,
    color: THREE.Color,
    width: number,
    rotation: { x: number; y: number; z: number }
  ) => {
    if (!trailGroupRef.current) return;

    const direction = new THREE.Vector3().subVectors(end, start);
    const length = direction.length();
    direction.normalize();

    const geometry = new THREE.PlaneGeometry(width, length);
    const material = new THREE.MeshStandardMaterial({
      color: color,
      side: THREE.DoubleSide,
      emissive: color,
      emissiveIntensity: 0.2,
    });

    const ribbon = new THREE.Mesh(geometry, material);
    ribbon.position.copy(start).add(direction.multiplyScalar(length / 2));
    ribbon.lookAt(end);
    ribbon.rotateZ(rotation.z);

    trailGroupRef.current.add(ribbon);
  };

  const createSmokeTrail = (position: THREE.Vector3, color: THREE.Color, size: number) => {
    if (!trailGroupRef.current) return;

    for (let i = 0; i < 3; i++) {
      const geometry = new THREE.SphereGeometry(size * (0.5 + Math.random() * 0.5), 8, 8);
      const material = new THREE.MeshStandardMaterial({
        color: color,
        transparent: true,
        opacity: 0.6 - i * 0.15,
        emissive: color,
        emissiveIntensity: 0.4,
      });

      const particle = new THREE.Mesh(geometry, material);
      particle.position.copy(position);
      particle.position.x += (Math.random() - 0.5) * size;
      particle.position.y += (Math.random() - 0.5) * size;
      particle.position.z += (Math.random() - 0.5) * size;

      trailGroupRef.current.add(particle);

      setTimeout(() => {
        if (trailGroupRef.current && particle.parent) {
          trailGroupRef.current.remove(particle);
          geometry.dispose();
          material.dispose();
        }
      }, 2000 + i * 500);
    }
  };

  const createString = (start: THREE.Vector3, end: THREE.Vector3, color: THREE.Color) => {
    if (!trailGroupRef.current) return;

    const points = [start, end];
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ color: color, linewidth: 2 });

    const line = new THREE.Line(geometry, material);
    trailGroupRef.current.add(line);
  };

  return <div ref={containerRef} className="fixed inset-0" />;
}

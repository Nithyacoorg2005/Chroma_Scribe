import { useEffect, useRef, useState } from 'react';
import { HandLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

export interface HandPosition {
  x: number;
  y: number;
  z: number;
  rotation: {
    x: number;
    y: number;
    z: number;
  };
}

export function useHandTracking(videoElement: HTMLVideoElement | null, enabled: boolean) {
  const [handPosition, setHandPosition] = useState<HandPosition | null>(null);
  const handLandmarkerRef = useRef<HandLandmarker | null>(null);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    let isMounted = true;

    const initializeHandTracking = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm'
        );

        const handLandmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
            delegate: 'GPU',
          },
          numHands: 1,
          runningMode: 'VIDEO',
          minHandDetectionConfidence: 0.5,
          minHandPresenceConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });

        if (isMounted) {
          handLandmarkerRef.current = handLandmarker;
        }
      } catch (error) {
        console.error('Failed to initialize hand tracking:', error);
      }
    };

    if (enabled) {
      initializeHandTracking();
    }

    return () => {
      isMounted = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [enabled]);

  useEffect(() => {
    if (!enabled || !videoElement || !handLandmarkerRef.current) {
      setHandPosition(null);
      return;
    }

    const detectHands = async () => {
      if (!videoElement || !handLandmarkerRef.current || videoElement.readyState < 2) {
        animationFrameRef.current = requestAnimationFrame(detectHands);
        return;
      }

      try {
        const result = handLandmarkerRef.current.detectForVideo(
          videoElement,
          performance.now()
        );

        if (result.landmarks && result.landmarks.length > 0) {
          const landmarks = result.landmarks[0];
          const indexTip = landmarks[8];
          const wrist = landmarks[0];
          const middleTip = landmarks[12];

          const dx = indexTip.x - wrist.x;
          const dy = indexTip.y - wrist.y;
          const dz = indexTip.z - wrist.z;

          const rotationX = Math.atan2(dy, Math.sqrt(dx * dx + dz * dz));
          const rotationY = Math.atan2(dx, dz);
          const rotationZ = Math.atan2(middleTip.y - indexTip.y, middleTip.x - indexTip.x);

          setHandPosition({
            x: indexTip.x * 2 - 1,
            y: -(indexTip.y * 2 - 1),
            z: indexTip.z * 5,
            rotation: {
              x: rotationX,
              y: rotationY,
              z: rotationZ,
            },
          });
        } else {
          setHandPosition(null);
        }
      } catch (error) {
        console.error('Hand detection error:', error);
      }

      animationFrameRef.current = requestAnimationFrame(detectHands);
    };

    detectHands();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [enabled, videoElement]);

  return handPosition;
}

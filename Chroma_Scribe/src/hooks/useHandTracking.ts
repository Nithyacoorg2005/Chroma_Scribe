import { useState, useEffect } from 'react';
import {
    HandLandmarker,
    FilesetResolver
} from '@mediapipe/tasks-vision';

let lastVideoTime = -1;
let handLandmarker: HandLandmarker | null = null;
let runningMode: "IMAGE" | "VIDEO" = "VIDEO";

// This hook now accepts the video element and the stream
export const useHandTracking = (
    videoRef: React.RefObject<HTMLVideoElement | null>,
    stream: MediaStream | null,
    cameraEnabled: boolean
) => {
    const [landmarks, setLandmarks] = useState(null);
    const [isInitialized, setIsInitialized] = useState(false);

    // Step 1: Create the hand landmarker
    useEffect(() => {
        const createHandLandmarker = async () => {
            const vision = await FilesetResolver.forVisionTasks(
                "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
            );
            handLandmarker = await HandLandmarker.createFromOptions(vision, {
                baseOptions: {
                    modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
                    delegate: "GPU"
                },
                runningMode: runningMode,
                numHands: 2
            });
            console.log("Hand Landmarker created");
            setIsInitialized(true);
        };
        createHandLandmarker();
    }, []);

    // Step 2: Run predictions when the stream is active
    useEffect(() => {
        if (!stream || !videoRef.current || !handLandmarker || !cameraEnabled) {
            setLandmarks(null);
            return;
        }

        const video = videoRef.current;
        let animationFrameId: number;

        const predictWebcam = () => {
            if (video.currentTime !== lastVideoTime && video.readyState >= 2) {
                lastVideoTime = video.currentTime;
                const results = handLandmarker!.detectForVideo(video, performance.now());
                
                if (results.landmarks && results.landmarks.length > 0) {
                    setLandmarks(results.landmarks as any);
                } else {
                    setLandmarks(null);
                }
            }
            animationFrameId = requestAnimationFrame(predictWebcam);
        };

        predictWebcam();

        return () => {
            cancelAnimationFrame(animationFrameId);
            setLandmarks(null);
        };

    }, [stream, videoRef, cameraEnabled, isInitialized]); // Re-run if any of these change

    return { landmarks, isInitialized };
};
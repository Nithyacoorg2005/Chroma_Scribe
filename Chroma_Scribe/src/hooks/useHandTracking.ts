import { useState, useEffect } from 'react';
import {
    HandLandmarker,
    FilesetResolver
} from '@mediapipe/tasks-vision';

let lastVideoTime = -1;
let handLandmarker: HandLandmarker | null = null;
let runningMode: "IMAGE" | "VIDEO" = "VIDEO";

// This is our new fist detection logic
const isFist = (hand) => {
    if (!hand || hand.length === 0) return false;
    // Check if index and middle fingertips are below their knuckles
    const indexTip = hand[8];
    const indexKnuckle = hand[5];
    const middleTip = hand[12];
    const middleKnuckle = hand[9];
    
    // In MediaPipe, a higher 'y' means lower on the screen
    return indexTip.y > indexKnuckle.y && middleTip.y > middleKnuckle.y;
};

export const useHandTracking = (
    videoRef: React.RefObject<HTMLVideoElement | null>,
    stream: MediaStream | null,
    cameraEnabled: boolean
) => {
    const [landmarks, setLandmarks] = useState(null);
    const [isInitialized, setIsInitialized] = useState(false);
    // This is our new state
    const [isDrawing, setIsDrawing] = useState(false);

    // Step 1: Create the hand landmarker (no change)
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
                numHands: 1 // Only track one hand for simplicity
            });
            console.log("Hand Landmarker created");
            setIsInitialized(true);
        };
        createHandLandmarker();
    }, []);

    // Step 2: Run predictions
    useEffect(() => {
        if (!stream || !videoRef.current || !handLandmarker || !cameraEnabled) {
            setLandmarks(null);
            setIsDrawing(false); // Stop drawing
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
                    // Set drawing state based on fist
                    setIsDrawing(!isFist(results.landmarks[0])); 
                } else {
                    setLandmarks(null);
                    setIsDrawing(false); // No hand, no drawing
                }
            }
            animationFrameId = requestAnimationFrame(predictWebcam);
        };

        predictWebcam();

        return () => {
            cancelAnimationFrame(animationFrameId);
            setLandmarks(null);
            setIsDrawing(false);
        };

    }, [stream, videoRef, cameraEnabled, isInitialized]);

    // Return the landmarks and the new drawing state
    return { landmarks, isInitialized, isDrawing };
};
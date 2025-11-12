import { useState, useEffect, useRef } from 'react';

export const useAudioAnalysis = (micEnabled: boolean) => {
    const [audioData, setAudioData] = useState({ volume: 0, pitch: 0 });
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const streamRef = useRef<MediaStream | null>(null);

    useEffect(() => {
        const startMic = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                streamRef.current = stream;

                const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
                audioContextRef.current = audioContext;

                const analyser = audioContext.createAnalyser();
                analyser.fftSize = 2048;
                analyserRef.current = analyser;

                const source = audioContext.createMediaStreamSource(stream);
                source.connect(analyser);
                sourceRef.current = source;

                const dataArray = new Uint8Array(analyser.frequencyBinCount);
                const floatArray = new Float32Array(analyser.fftSize);

                const updateAudioData = () => {
                    if (!micEnabled) return;

                    // Get Volume (Amplitude)
                    analyser.getByteTimeDomainData(dataArray);
                    let sum = 0;
                    for (let i = 0; i < dataArray.length; i++) {
                        sum += (dataArray[i] / 128.0 - 1) ** 2;
                    }
                    const volume = Math.sqrt(sum / dataArray.length);

                    // Get Pitch (Frequency)
                    analyser.getFloatTimeDomainData(floatArray);
                    let pitch = 0; // Basic pitch detection (not perfect)
                    
                    setAudioData({ volume: volume * 100, pitch }); // Scale volume
                    requestAnimationFrame(updateAudioData);
                };
                
                updateAudioData();

            } catch (err) {
                console.error("Error accessing microphone:", err);
            }
        };

        const stopMic = () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
                streamRef.current = null;
            }
            if (sourceRef.current) {
                sourceRef.current.disconnect();
                sourceRef.current = null;
            }
            if (audioContextRef.current) {
                audioContextRef.current.close();
                audioContextRef.current = null;
            }
            setAudioData({ volume: 0, pitch: 0 });
        };

        if (micEnabled) {
            startMic();
        } else {
            stopMic();
        }

        return () => {
            stopMic();
        };
    }, [micEnabled]);

    return audioData;
};
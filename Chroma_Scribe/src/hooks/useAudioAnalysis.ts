import { useEffect, useRef, useState } from 'react';

export interface AudioData {
  volume: number;
  pitch: number;
}

export function useAudioAnalysis(enabled: boolean) {
  const [audioData, setAudioData] = useState<AudioData>({ volume: 0, pitch: 0 });
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    let isMounted = true;

    const initializeAudio = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

        if (!isMounted) {
          stream.getTracks().forEach(track => track.stop());
          return;
        }

        streamRef.current = stream;
        const audioContext = new AudioContext();
        const analyser = audioContext.createAnalyser();
        const source = audioContext.createMediaStreamSource(stream);

        analyser.fftSize = 2048;
        analyser.smoothingTimeConstant = 0.8;
        source.connect(analyser);

        audioContextRef.current = audioContext;
        analyserRef.current = analyser;
      } catch (error) {
        console.error('Failed to initialize audio:', error);
      }
    };

    if (enabled) {
      initializeAudio();
    }

    return () => {
      isMounted = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [enabled]);

  useEffect(() => {
    if (!enabled || !analyserRef.current) {
      setAudioData({ volume: 0, pitch: 0 });
      return;
    }

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const frequencyArray = new Float32Array(bufferLength);

    const analyze = () => {
      if (!analyserRef.current) return;

      analyserRef.current.getByteTimeDomainData(dataArray);
      analyserRef.current.getFloatFrequencyData(frequencyArray);

      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        const normalized = (dataArray[i] - 128) / 128;
        sum += normalized * normalized;
      }
      const rms = Math.sqrt(sum / bufferLength);
      const volume = Math.min(rms * 5, 1);

      let maxValue = -Infinity;
      let maxIndex = 0;
      for (let i = 0; i < bufferLength / 4; i++) {
        if (frequencyArray[i] > maxValue) {
          maxValue = frequencyArray[i];
          maxIndex = i;
        }
      }

      const sampleRate = audioContextRef.current?.sampleRate || 44100;
      const frequency = (maxIndex * sampleRate) / (2 * bufferLength);
      const normalizedPitch = Math.min(Math.max(frequency / 500, 0), 1);

      setAudioData({
        volume: volume,
        pitch: normalizedPitch,
      });

      animationFrameRef.current = requestAnimationFrame(analyze);
    };

    analyze();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [enabled]);

  return audioData;
}

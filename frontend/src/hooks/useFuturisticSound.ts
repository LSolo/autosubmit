import { useCallback, useRef } from 'react';

// Futuristic / Sci-Fi Sound Engine
export function useFuturisticSound() {
  const audioContext = useRef<AudioContext | null>(null);

  const getContext = useCallback(() => {
    if (!audioContext.current) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioContext.current = new AudioContextClass();
    }
    if (audioContext.current.state === 'suspended') {
      audioContext.current.resume();
    }
    return audioContext.current;
  }, []);

  const playTone = useCallback((freq: number, type: OscillatorType, duration: number, delay: number = 0, volume: number = 0.1) => {
    const ctx = getContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
    
    // Lowpass filter for smoother "tech" sound
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2000, ctx.currentTime + delay);
    filter.Q.value = 1;

    gain.gain.setValueAtTime(0, ctx.currentTime + delay);
    gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + delay + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime + delay);
    osc.stop(ctx.currentTime + delay + duration);
  }, [getContext]);

  const playClick = useCallback(() => {
    // High-tech blip
    playTone(1200, 'sine', 0.1, 0, 0.05);
    playTone(2000, 'sine', 0.05, 0.02, 0.03);
  }, [playTone]);

  const playHover = useCallback(() => {
    // Subtle holographic hum
    playTone(400, 'sine', 0.05, 0, 0.02);
  }, [playTone]);

  const playSuccess = useCallback(() => {
    // Futuristic "Task Complete" chord
    playTone(440, 'sine', 0.4, 0, 0.1); // A4
    playTone(660, 'sine', 0.4, 0.1, 0.1); // E5
    playTone(880, 'triangle', 0.6, 0.2, 0.1); // A5
    playTone(1108, 'sine', 0.8, 0.3, 0.05); // C#6
  }, [playTone]);

  const playError = useCallback(() => {
    // "Access Denied" buzz
    playTone(150, 'sawtooth', 0.3, 0, 0.1);
    playTone(100, 'sawtooth', 0.3, 0.1, 0.1);
  }, [playTone]);

  return { playClick, playHover, playSuccess, playError };
}

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

const STORAGE_KEY = 'lain-sound-enabled';

type ToneOptions = {
  duration?: number;
  type?: OscillatorType;
  vol?: number;
  freqEnd?: number | null;
};

interface Sounds {
  click: () => void;
  modalOpen: () => void;
  modalClose: () => void;
  toast: () => void;
  terminal: () => void;
  themeToggle: () => void;
  copy: () => void;
}

interface SoundContextValue {
  enabled: boolean;
  toggleEnabled: () => void;
  sounds: Sounds;
}

const SoundContext = createContext<SoundContextValue | null>(null);

export function SoundProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabled] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === '1';
    } catch {
      return false;
    }
  });
  const ctxRef = useRef<AudioContext | null>(null);
  const enabledRef = useRef(enabled);
  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  const getCtx = useCallback(() => {
    if (!ctxRef.current) {
      ctxRef.current = new AudioContext();
    }
    if (ctxRef.current.state === 'suspended') void ctxRef.current.resume();
    return ctxRef.current;
  }, []);

  const tone = useCallback(
    (freq: number, { duration = 80, type = 'sine', vol = 0.08, freqEnd = null }: ToneOptions = {}) => {
      if (!enabledRef.current) return;
      try {
        const c = getCtx();
        const osc = c.createOscillator();
        const gain = c.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, c.currentTime);
        if (freqEnd !== null) {
          osc.frequency.linearRampToValueAtTime(freqEnd, c.currentTime + duration / 1000);
        }

        gain.gain.setValueAtTime(vol, c.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + duration / 1000);

        osc.connect(gain);
        gain.connect(c.destination);
        osc.start(c.currentTime);
        osc.stop(c.currentTime + duration / 1000);
      } catch {
        /* AudioContext unavailable — silent fail */
      }
    },
    [getCtx],
  );

  const sounds = useMemo<Sounds>(
    () => ({
      click: () => tone(400, { duration: 50, vol: 0.06, freqEnd: 300 }),
      modalOpen: () => tone(300, { duration: 120, vol: 0.07, freqEnd: 480 }),
      modalClose: () => tone(480, { duration: 100, vol: 0.05, freqEnd: 260 }),
      toast: () => tone(520, { duration: 90, type: 'triangle', vol: 0.05, freqEnd: 600 }),
      terminal: () => tone(550, { duration: 30, type: 'square', vol: 0.04 }),
      themeToggle: () => tone(360, { duration: 140, vol: 0.06, freqEnd: 520 }),
      copy: () => {
        tone(440, { duration: 60, vol: 0.05 });
        setTimeout(() => tone(660, { duration: 60, vol: 0.04 }), 70);
      },
    }),
    [tone],
  );

  const toggleEnabled = useCallback(() => {
    setEnabled((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY, next ? '1' : '0');
      } catch {
        /* localStorage unavailable */
      }
      if (next) sounds.click();
      return next;
    });
  }, [sounds]);

  const value = useMemo(() => ({ enabled, toggleEnabled, sounds }), [enabled, toggleEnabled, sounds]);

  return <SoundContext.Provider value={value}>{children}</SoundContext.Provider>;
}

const NOOP_SOUNDS: Sounds = {
  click: () => {},
  modalOpen: () => {},
  modalClose: () => {},
  toast: () => {},
  terminal: () => {},
  themeToggle: () => {},
  copy: () => {},
};

/** Safe to call even outside a SoundProvider — returns no-op sounds in that case. */
export function useSoundDesign(): SoundContextValue {
  const ctx = useContext(SoundContext);
  return ctx ?? { enabled: false, toggleEnabled: () => {}, sounds: NOOP_SOUNDS };
}

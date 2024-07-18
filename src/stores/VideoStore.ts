import { create } from "zustand";

interface VideoStore {
  isPlaying: boolean;
  volume: number;
  isMuted: boolean;

  play: () => void;
  pause: () => void;
  setVolume: (newVolume: number) => void;
  increaseVolume: (increaseAmount: number) => void;
  decreaseVolume: (decreaseAmount: number) => void;
  mute: () => void;
  unMute: () => void;
}

const minVolume = 0;
const maxVolume = 1;

const increaseVolume = (increaseAmount: number, currentVolume: number) => {
  return Math.min(maxVolume, currentVolume + increaseAmount);
};

const decreaseVolume = (decreaseAmount: number, currentVolume: number) => {
  return Math.max(minVolume, currentVolume - decreaseAmount);
};

const useVideoStore = create<VideoStore>((set) => ({
  isPlaying: false,
  volume: 0.5,
  isMuted: false,
  play: () => set(() => ({ isPlaying: true })),
  pause: () => set(() => ({ isPlaying: false })),
  setVolume: (newVolume) => set(() => ({ volume: newVolume })),
  increaseVolume: (increaseAmount) =>
    set((state) => ({ volume: increaseVolume(increaseAmount, state.volume) })),
  decreaseVolume: (decreaseAmount) =>
    set((state) => ({ volume: decreaseVolume(decreaseAmount, state.volume) })),
  mute: () => set(() => ({ isMuted: true })),
  unMute: () => set(() => ({ isMuted: false })),
}));

export default useVideoStore;

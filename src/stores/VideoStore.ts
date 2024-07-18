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
  umMute: () => void;
}

const useVideoStore = create<VideoStore>((set) => ({
  isPlaying: false,
  volume: 0,
  isMuted: false,
  play: () => set(() => ({ isPlaying: true })),
  pause: () => set(() => ({ isPlaying: false })),
  setVolume: (newVolume) => set(() => ({ volume: newVolume })),
  increaseVolume: (increaseAmount) =>
    set((state) => ({ volume: state.volume + increaseAmount })),
  decreaseVolume: (decreaseAmount) =>
    set((state) => ({ volume: state.volume - decreaseAmount })),
  mute: () => set(() => ({ isMuted: true })),
  umMute: () => set(() => ({ isMuted: false })),
}));

export default useVideoStore;

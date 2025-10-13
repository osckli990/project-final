import { create } from "zustand";
import dayjs from "dayjs";

export const useMoodStore = create((set) => ({
  entries: [],
  addEntry: (mood, note) => set((s) => ({
    entries: [...s.entries, { mood, note, date: dayjs().toISOString() }]
  })),
}));

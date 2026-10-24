import { useSyncExternalStore } from "react";

export type LogEntry = { id: string; username: string; facility: string; at: string; approved: boolean; reason?: string | undefined };
type State = { username: string | null; log: LogEntry[] };

const KEY = "campusconnect-demo";
let state: State = { username: null, log: [] };
let loaded = false;
const subs = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try { state = { ...state, ...JSON.parse(localStorage.getItem(KEY) || "{}") }; } catch { /* ignore */ }
}
function set(next: Partial<State>) {
  state = { ...state, ...next };
  localStorage.setItem(KEY, JSON.stringify(state));
  subs.forEach((f) => f());
}
const SERVER: State = { username: null, log: [] };

export function useStore() {
  return useSyncExternalStore(
    (f) => { subs.add(f); return () => subs.delete(f); },
    () => { load(); return state; },
    () => SERVER,
  );
}
export const signIn = (username: string) => set({ username });
export const signOut = () => set({ username: null });
export const addLog = (e: Omit<LogEntry, "id" | "at">) =>
  set({ log: [{ ...e, id: crypto.randomUUID(), at: new Date().toISOString() }, ...state.log].slice(0, 50) });

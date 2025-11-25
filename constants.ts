
import { GameKey } from './types';

export const GAME_DURATION = 30; // in seconds
export const NOTE_SPEED = 200; // pixels per second
export const NOTE_SPAWN_RATE_MS = 500; // ms between new notes

export const KEYS: GameKey[] = ['a', 's', 'd', 'f'];

export const SCORES: Record<Exclude<keyof import('./types').HitStats, 'miss'>, number> = {
  perfect: 25,
  good: 15,
  bad: 5,
};

// Target line position from the left
export const TARGET_X = 50; 

// Timing windows in pixels from the target line
export const PERFECT_WINDOW = 10;
export const GOOD_WINDOW = 25;
export const BAD_WINDOW = 40;

// Colors for notes and lanes
export const KEY_VISUALS: Record<GameKey, { color: string, bgColor: string }> = {
    a: { color: 'text-cyan-400', bgColor: 'bg-cyan-900' },
    s: { color: 'text-pink-500', bgColor: 'bg-pink-900' },
    d: { color: 'text-lime-400', bgColor: 'bg-lime-900' },
    f: { color: 'text-yellow-400', bgColor: 'bg-yellow-900' },
};

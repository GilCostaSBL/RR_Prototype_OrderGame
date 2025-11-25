
export type GameKey = 'a' | 's' | 'd' | 'f';

export interface Note {
  id: number;
  key: GameKey;
  positionX: number;
  status: 'active' | 'hit' | 'missed';
}

export type GameStatus = 'idle' | 'playing' | 'finished';

export type HitScore = 'perfect' | 'good' | 'bad' | 'miss';

export interface HitStats {
  perfect: number;
  good: number;
  bad: number;
  miss: number;
}

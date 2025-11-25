import React, { useState, useEffect, useCallback } from 'react';
import { Game } from './components/Game';
import { EndScreen } from './components/EndScreen';
import { HitStats, GameStatus } from './types';
import { GAME_DURATION } from './constants';

const App: React.FC = () => {
  const [gameStatus, setGameStatus] = useState<GameStatus>('idle');
  const [timer, setTimer] = useState<number>(GAME_DURATION);
  const [score, setScore] = useState<number>(0);
  const [stats, setStats] = useState<HitStats>({
    perfect: 0,
    good: 0,
    bad: 0,
    miss: 0,
  });

  useEffect(() => {
    if (gameStatus !== 'playing') {
      return;
    }

    if (timer <= 0) {
      setGameStatus('finished');
      return;
    }

    const intervalId = setInterval(() => {
      setTimer((prevTimer) => prevTimer - 1);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [gameStatus, timer]);

  const startGame = () => {
    setTimer(GAME_DURATION);
    setScore(0);
    setStats({ perfect: 0, good: 0, bad: 0, miss: 0 });
    setGameStatus('playing');
  };

  const restartGame = () => {
    setGameStatus('idle');
  }

  const handleScoreUpdate = useCallback((points: number) => {
    setScore((prevScore) => prevScore + points);
  }, []);

  const handleStatsUpdate = useCallback((type: keyof HitStats) => {
    setStats((prevStats) => ({
      ...prevStats,
      [type]: prevStats[type] + 1,
    }));
  }, []);

  return (
    <div className="bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center p-4 selection:bg-cyan-400 selection:text-black">
      <div className="w-full max-w-4xl border-4 border-cyan-400 bg-black p-4 md:p-8 shadow-[8px_8px_0px_0px_rgba(0,255,255,0.3)]">
        <header className="flex justify-between items-center mb-4 border-b-4 border-dashed border-pink-500 pb-4">
          <h1 className="text-xl sm:text-2xl md:text-4xl text-cyan-400">Order up!!</h1>
          {gameStatus === 'playing' && (
             <div className="flex flex-col sm:flex-row sm:space-x-8 space-y-2 sm:space-y-0 text-right">
                <div className="text-lg md:text-2xl">TIME: <span className="text-lime-400">{timer}</span></div>
                <div className="text-lg md:text-2xl">$$$: <span className="text-yellow-400">{score}</span></div>
             </div>
          )}
        </header>
        <main className="relative">
          {gameStatus === 'idle' && (
            <div className="text-center flex flex-col items-center justify-center h-96">
                <p className="text-lg mb-8">Press A, S, D, F when the notes hit the line!</p>
                <button 
                  onClick={startGame}
                  className="bg-lime-500 text-black px-8 py-4 text-2xl border-4 border-black hover:bg-lime-400 active:translate-y-1 active:translate-x-1 shadow-[4px_4px_0px_0px_#000]">
                    START GAME
                </button>
            </div>
          )}
          {gameStatus === 'playing' && (
            <Game 
              onScoreUpdate={handleScoreUpdate}
              onStatsUpdate={handleStatsUpdate}
            />
          )}
          {gameStatus === 'finished' && (
            <EndScreen score={score} onRestart={restartGame} />
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
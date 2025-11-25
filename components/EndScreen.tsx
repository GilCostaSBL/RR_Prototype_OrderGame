
import React from 'react';

interface EndScreenProps {
  score: number;
  onRestart: () => void;
}

export const EndScreen: React.FC<EndScreenProps> = ({ score, onRestart }) => {
  return (
    <div className="text-center flex flex-col items-center justify-center h-96 bg-black p-6">
      <h2 className="text-4xl text-red-500 mb-8">Order's Up!</h2>
      <div className="text-3xl mb-12">
        You earned: <span className="text-yellow-400">${score}</span>
      </div>

      <button
        onClick={onRestart}
        className="bg-cyan-500 text-black px-8 py-4 text-2xl border-4 border-black hover:bg-cyan-400 active:translate-y-1 active:translate-x-1 shadow-[4px_4px_0px_0px_#000]"
      >
        PLAY AGAIN
      </button>
    </div>
  );
};

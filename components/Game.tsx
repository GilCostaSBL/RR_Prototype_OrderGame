
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Note as NoteType, GameKey, HitStats } from '../types';
import {
  NOTE_SPEED,
  NOTE_SPAWN_RATE_MS,
  KEYS,
  SCORES,
  TARGET_X,
  PERFECT_WINDOW,
  GOOD_WINDOW,
  BAD_WINDOW,
  KEY_VISUALS,
} from '../constants';

interface GameProps {
  onScoreUpdate: (points: number) => void;
  onStatsUpdate: (type: keyof HitStats) => void;
}

interface Feedback {
    id: number;
    text: string;
    color: string;
    y: number;
}

export const Game: React.FC<GameProps> = ({ onScoreUpdate, onStatsUpdate }) => {
  const [notes, setNotes] = useState<NoteType[]>([]);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const animationFrameId = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  const noteIdCounter = useRef<number>(0);

  const laneHeight = 80;

  const handleHit = useCallback((note: NoteType) => {
      const distance = Math.abs(note.positionX - TARGET_X);
      let hitScore: keyof HitStats = 'miss';
      let points = 0;
      let feedbackText = 'MISS';
      let feedbackColor = 'text-red-500';

      if (distance <= PERFECT_WINDOW) {
          hitScore = 'perfect';
          points = SCORES.perfect;
          feedbackText = 'PERFECT!';
          feedbackColor = 'text-yellow-400';
      } else if (distance <= GOOD_WINDOW) {
          hitScore = 'good';
          points = SCORES.good;
          feedbackText = 'GOOD';
          feedbackColor = 'text-lime-400';
      } else if (distance <= BAD_WINDOW) {
          hitScore = 'bad';
          points = SCORES.bad;
          feedbackText = 'BAD';
          feedbackColor = 'text-pink-500';
      }

      if (hitScore !== 'miss') {
          onScoreUpdate(points);
          onStatsUpdate(hitScore);
          
          const laneIndex = KEYS.indexOf(note.key);
          const feedbackY = laneIndex * laneHeight + laneHeight / 2 - 10;
          const newFeedback = { id: Date.now(), text: feedbackText, color: feedbackColor, y: feedbackY };
          setFeedback(f => [...f, newFeedback]);
          setTimeout(() => {
              setFeedback(f => f.filter(fb => fb.id !== newFeedback.id));
          }, 500);
      }
  }, [onScoreUpdate, onStatsUpdate, laneHeight]);


  const handleKeyDown = useCallback((event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (!KEYS.includes(key as GameKey)) return;

      setNotes(prevNotes => {
        const targetNoteIndex = prevNotes.findIndex(
            (note) => note.key === key && note.status === 'active' && Math.abs(note.positionX - TARGET_X) < BAD_WINDOW + 20
        );

        if (targetNoteIndex !== -1) {
            const newNotes = [...prevNotes];
            const hitNote = newNotes[targetNoteIndex];
            handleHit(hitNote);
            newNotes[targetNoteIndex] = { ...hitNote, status: 'hit' };
            return newNotes;
        }
        return prevNotes;
      });
  }, [handleHit]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  const gameLoop = useCallback((timestamp: number) => {
    if (!lastTimeRef.current) {
        lastTimeRef.current = timestamp;
    }
    const deltaTime = (timestamp - lastTimeRef.current) / 1000;
    lastTimeRef.current = timestamp;

    setNotes(prevNotes => {
      const newNotes = prevNotes.map(note => ({
        ...note,
        positionX: note.positionX - NOTE_SPEED * deltaTime,
      }));

      const updatedNotes = newNotes.filter(note => {
        if (note.status === 'active' && note.positionX < TARGET_X - BAD_WINDOW) {
          onStatsUpdate('miss');
          return false; // Remove missed notes
        }
        return note.positionX > -50; // Clean up notes far off-screen
      });

      return updatedNotes;
    });

    animationFrameId.current = requestAnimationFrame(gameLoop);
  }, [onStatsUpdate]);
  
  useEffect(() => {
      animationFrameId.current = requestAnimationFrame(gameLoop);
      return () => {
          if (animationFrameId.current) {
              cancelAnimationFrame(animationFrameId.current);
          }
      };
  }, [gameLoop]);

  useEffect(() => {
    const spawnInterval = setInterval(() => {
      if (gameAreaRef.current) {
        const randomKeyIndex = Math.floor(Math.random() * KEYS.length);
        const newNote: NoteType = {
          id: noteIdCounter.current++,
          key: KEYS[randomKeyIndex],
          positionX: gameAreaRef.current.offsetWidth,
          status: 'active',
        };
        setNotes(prevNotes => [...prevNotes, newNote]);
      }
    }, NOTE_SPAWN_RATE_MS);

    return () => clearInterval(spawnInterval);
  }, []);

  return (
    <div ref={gameAreaRef} className="relative h-96 w-full bg-black border-4 border-gray-700 overflow-hidden">
      {/* Lanes */}
      {KEYS.map((key, index) => (
        <div key={key} className={`absolute w-full h-[${laneHeight}px] ${KEY_VISUALS[key].bgColor} opacity-30`} style={{ top: `${index * laneHeight}px` }}></div>
      ))}

      {/* Target Line */}
      <div className="absolute top-0 bottom-0 bg-white w-1" style={{ left: `${TARGET_X}px` }}>
        {KEYS.map((key, index) => (
             <div 
             key={key} 
             className={`absolute flex items-center justify-center w-12 h-12 text-2xl -translate-x-1/2 -translate-y-1/2 border-2 ${KEY_VISUALS[key].color} border-current`}
             style={{ top: `${index * laneHeight + laneHeight/2}px`, left: `2px` }}
           >
             {key.toUpperCase()}
           </div>
        ))}
      </div>

      {/* Notes */}
      {notes.map(note => (
        note.status !== 'hit' && (
          <div
            key={note.id}
            className={`absolute flex items-center justify-center w-12 h-12 text-2xl border-2 ${KEY_VISUALS[note.key].color} border-current bg-black`}
            style={{
              left: `${note.positionX}px`,
              top: `${KEYS.indexOf(note.key) * laneHeight + (laneHeight - 48)/2}px`,
              transform: 'translateX(-50%)',
            }}
          >
            {note.key.toUpperCase()}
          </div>
        )
      ))}

      {/* Feedback Text */}
       {feedback.map(fb => (
            <div
                key={fb.id}
                className={`absolute text-2xl font-bold animate-ping-and-fade ${fb.color}`}
                style={{
                    left: `${TARGET_X + 30}px`,
                    top: `${fb.y}px`,
                }}
            >
                {fb.text}
            </div>
        ))}
        <style>{`
            @keyframes ping-and-fade {
                0% { transform: scale(1); opacity: 1; }
                50% { transform: scale(1.2); opacity: 0.7; }
                100% { transform: scale(1.5); opacity: 0; }
            }
            .animate-ping-and-fade {
                animation: ping-and-fade 0.5s ease-out forwards;
            }
        `}</style>
    </div>
  );
};

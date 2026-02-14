import { useState, useEffect, useCallback } from 'react';
import JungleFuryCanvas from './game/JungleFuryCanvas';
import GameHUD from './components/GameHUD';
import { useJungleFuryGame } from './game/useJungleFuryGame';

type GameState = 'start' | 'playing' | 'gameOver' | 'won';

function App() {
  const [gameState, setGameState] = useState<GameState>('start');
  const { gameSnapshot, startGame, resetGame, updatePlayerInput } = useJungleFuryGame();

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== 'playing') return;
      
      if (e.key === 'ArrowLeft') {
        updatePlayerInput('left', true);
        e.preventDefault();
      } else if (e.key === 'ArrowRight') {
        updatePlayerInput('right', true);
        e.preventDefault();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (gameState !== 'playing') return;
      
      if (e.key === 'ArrowLeft') {
        updatePlayerInput('left', false);
        e.preventDefault();
      } else if (e.key === 'ArrowRight') {
        updatePlayerInput('right', false);
        e.preventDefault();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState, updatePlayerInput]);

  // Monitor game status from snapshot
  useEffect(() => {
    if (gameState === 'playing') {
      if (!gameSnapshot.playerAlive) {
        setGameState('gameOver');
      } else if (gameSnapshot.playerFinished) {
        setGameState('won');
      }
    }
  }, [gameSnapshot.playerAlive, gameSnapshot.playerFinished, gameState]);

  const handleStart = useCallback(() => {
    startGame();
    setGameState('playing');
  }, [startGame]);

  const handleRestart = useCallback(() => {
    resetGame();
    setGameState('start');
  }, [resetGame]);

  return (
    <div className="min-h-screen bg-jungle-dark flex flex-col">
      <main className="flex-1 flex flex-col items-center justify-center p-4 relative">
        <div className="w-full max-w-2xl">
          <GameHUD
            gameState={gameState}
            onStart={handleStart}
            onRestart={handleRestart}
          />
          
          <div className="mt-4 rounded-lg overflow-hidden shadow-2xl border-4 border-jungle-accent">
            <JungleFuryCanvas
              gameSnapshot={gameSnapshot}
              isPlaying={gameState === 'playing'}
            />
          </div>
        </div>
      </main>

      <footer className="py-4 text-center text-sm text-jungle-light">
        <p>
          Built with love using{' '}
          <a
            href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
              typeof window !== 'undefined' ? window.location.hostname : 'jungle-fury'
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-jungle-accent hover:text-jungle-bright transition-colors"
          >
            caffeine.ai
          </a>
        </p>
        <p className="text-xs mt-1 text-jungle-muted">
          © {new Date().getFullYear()} Jungle Fury: Finish Line
        </p>
      </footer>
    </div>
  );
}

export default App;

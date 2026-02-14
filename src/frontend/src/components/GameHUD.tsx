import { Trophy, Skull, Play, RotateCcw, LogIn, LogOut, User } from 'lucide-react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';

type GameState = 'start' | 'playing' | 'gameOver' | 'won';

interface GameHUDProps {
  gameState: GameState;
  onStart: () => void;
  onRestart: () => void;
}

export default function GameHUD({ gameState, onStart, onRestart }: GameHUDProps) {
  const { identity, login, clear, loginStatus, isLoggingIn, isLoginError, loginError } = useInternetIdentity();
  
  const isAuthenticated = identity && !identity.getPrincipal().isAnonymous();
  const principalText = isAuthenticated 
    ? identity.getPrincipal().toString()
    : '';
  
  // Shorten principal for display (first 8 and last 4 characters)
  const shortenedPrincipal = principalText.length > 16 
    ? `${principalText.slice(0, 8)}...${principalText.slice(-4)}`
    : principalText;

  return (
    <div className="bg-jungle-card rounded-lg p-6 shadow-xl border-2 border-jungle-accent">
      <div className="flex items-start justify-between mb-2">
        <h1 className="text-4xl font-bold text-jungle-bright tracking-tight flex-1">
          Jungle Fury: Finish Line
        </h1>
        
        <div className="flex flex-col items-end gap-2 ml-4">
          {isAuthenticated ? (
            <>
              <div className="flex items-center gap-2 text-jungle-light text-xs bg-jungle-dark/50 px-3 py-1.5 rounded-full">
                <User className="w-3 h-3" />
                <span className="font-mono">{shortenedPrincipal}</span>
              </div>
              <button
                onClick={clear}
                disabled={isLoggingIn}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-jungle-muted hover:bg-jungle-dark text-jungle-light text-sm rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign out
              </button>
            </>
          ) : (
            <button
              onClick={login}
              disabled={isLoggingIn}
              className="flex items-center gap-1.5 px-4 py-2 bg-jungle-accent hover:bg-jungle-bright text-jungle-dark font-semibold text-sm rounded-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              <LogIn className="w-4 h-4" />
              {isLoggingIn ? 'Signing in...' : 'Sign in'}
            </button>
          )}
        </div>
      </div>
      
      {isLoginError && loginError && (
        <div className="mb-3 p-2 bg-destructive/10 border border-destructive/30 rounded text-destructive text-xs">
          Authentication error: {loginError.message}
        </div>
      )}
      
      <div className="text-center mb-4">
        {gameState === 'start' && (
          <p className="text-jungle-light text-sm">
            Use <kbd className="px-2 py-1 bg-jungle-dark rounded text-jungle-accent font-mono">←</kbd>{' '}
            <kbd className="px-2 py-1 bg-jungle-dark rounded text-jungle-accent font-mono">→</kbd>{' '}
            arrow keys to steer your car
          </p>
        )}
        
        {gameState === 'playing' && (
          <div className="flex items-center justify-center gap-2 text-jungle-bright">
            <div className="w-2 h-2 bg-jungle-success rounded-full animate-pulse"></div>
            <span className="font-semibold">Racing...</span>
          </div>
        )}
        
        {gameState === 'gameOver' && (
          <div className="flex items-center justify-center gap-2 text-destructive">
            <Skull className="w-5 h-5" />
            <span className="font-bold text-lg">Game Over!</span>
          </div>
        )}
        
        {gameState === 'won' && (
          <div className="flex items-center justify-center gap-2 text-jungle-success">
            <Trophy className="w-6 h-6" />
            <span className="font-bold text-xl">You Won!</span>
          </div>
        )}
      </div>

      <div className="flex justify-center gap-3">
        {gameState === 'start' && (
          <button
            onClick={onStart}
            className="px-6 py-3 bg-jungle-accent hover:bg-jungle-bright text-jungle-dark font-bold rounded-lg transition-all transform hover:scale-105 shadow-lg flex items-center gap-2"
          >
            <Play className="w-5 h-5" />
            Start Race
          </button>
        )}
        
        {(gameState === 'gameOver' || gameState === 'won') && (
          <button
            onClick={onRestart}
            className="px-6 py-3 bg-jungle-accent hover:bg-jungle-bright text-jungle-dark font-bold rounded-lg transition-all transform hover:scale-105 shadow-lg flex items-center gap-2"
          >
            <RotateCcw className="w-5 h-5" />
            Restart
          </button>
        )}
      </div>
    </div>
  );
}

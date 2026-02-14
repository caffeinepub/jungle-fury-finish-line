import { useRef, useEffect } from 'react';
import type { GameSnapshot } from './useJungleFuryGame';
import { loadAssets, type GameAssets } from './assets';

interface JungleFuryCanvasProps {
  gameSnapshot: GameSnapshot;
  isPlaying: boolean;
}

const JUNGLE_GREEN = '#146414';
const TRACK_BROWN = '#64462a';
const PLAYER_COLOR = '#ffff00';
const AI_COLOR = '#969696';
const OBSTACLE_COLOR = '#c83232';
const ROCK_COLOR = '#646464';
const FINISH_COLOR = '#ffffff';

export default function JungleFuryCanvas({ gameSnapshot, isPlaying }: JungleFuryCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const assetsRef = useRef<GameAssets | null>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);

  // Load assets
  useEffect(() => {
    loadAssets().then((assets) => {
      assetsRef.current = assets;
    });
  }, []);

  // Render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      const assets = assetsRef.current;
      
      // Clear canvas
      ctx.clearRect(0, 0, gameSnapshot.width, gameSnapshot.height);

      // Draw background
      if (assets?.background) {
        ctx.drawImage(assets.background, 0, 0, gameSnapshot.width, gameSnapshot.height);
      } else {
        ctx.fillStyle = JUNGLE_GREEN;
        ctx.fillRect(0, 0, gameSnapshot.width, gameSnapshot.height);
      }

      // Draw track
      ctx.fillStyle = TRACK_BROWN;
      ctx.fillRect(gameSnapshot.trackLeft, 0, gameSnapshot.trackRight - gameSnapshot.trackLeft, gameSnapshot.height);

      // Draw finish line
      if (gameSnapshot.finishY > 0 && gameSnapshot.finishY < gameSnapshot.height) {
        if (assets?.finishLine) {
          ctx.drawImage(
            assets.finishLine,
            gameSnapshot.trackLeft,
            gameSnapshot.finishY,
            gameSnapshot.trackRight - gameSnapshot.trackLeft,
            20
          );
        } else {
          ctx.fillStyle = FINISH_COLOR;
          ctx.fillRect(gameSnapshot.trackLeft, gameSnapshot.finishY, gameSnapshot.trackRight - gameSnapshot.trackLeft, 20);
        }
      }

      // Draw obstacles
      gameSnapshot.obstacles.forEach((obs) => {
        if (assets?.obstacleAnimal) {
          ctx.drawImage(assets.obstacleAnimal, obs.x - 15, obs.y - 15, 30, 30);
        } else {
          ctx.fillStyle = OBSTACLE_COLOR;
          ctx.beginPath();
          ctx.arc(obs.x, obs.y, 15, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Draw rocks
      gameSnapshot.rocks.forEach((rock) => {
        if (assets?.obstacleRock) {
          ctx.drawImage(assets.obstacleRock, rock.x - 20, rock.y - 20, 40, 40);
        } else {
          ctx.fillStyle = ROCK_COLOR;
          ctx.beginPath();
          ctx.arc(rock.x, rock.y, 20, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Draw AI cars
      gameSnapshot.aiCars.forEach((ai) => {
        if (ai.alive) {
          if (assets?.carAi) {
            ctx.drawImage(assets.carAi, ai.x, ai.y, 30, 50);
          } else {
            ctx.fillStyle = AI_COLOR;
            ctx.fillRect(ai.x, ai.y, 30, 50);
          }
        }
      });

      // Draw player
      if (gameSnapshot.playerAlive) {
        if (assets?.carPlayer) {
          ctx.drawImage(assets.carPlayer, gameSnapshot.playerX, gameSnapshot.playerY, 30, 50);
        } else {
          ctx.fillStyle = PLAYER_COLOR;
          ctx.fillRect(gameSnapshot.playerX, gameSnapshot.playerY, 30, 50);
        }
      }

      if (isPlaying) {
        animationFrameRef.current = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      if (animationFrameRef.current !== undefined) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [gameSnapshot, isPlaying]);

  return (
    <canvas
      ref={canvasRef}
      width={gameSnapshot.width}
      height={gameSnapshot.height}
      className="w-full h-auto bg-jungle-dark"
      tabIndex={0}
    />
  );
}

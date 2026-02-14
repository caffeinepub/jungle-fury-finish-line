import { useRef, useEffect, useCallback, useState } from 'react';

const WIDTH = 500;
const HEIGHT = 700;
const CAR_WIDTH = 30;
const CAR_HEIGHT = 50;
const TRACK_LEFT = 80;
const TRACK_RIGHT = WIDTH - 80;

export interface Car {
  x: number;
  y: number;
  speed: number;
  alive: boolean;
  finished: boolean;
}

export interface Obstacle {
  x: number;
  y: number;
}

export interface GameSnapshot {
  playerX: number;
  playerY: number;
  playerAlive: boolean;
  playerFinished: boolean;
  aiCars: Car[];
  obstacles: Obstacle[];
  rocks: Obstacle[];
  finishY: number;
  width: number;
  height: number;
  trackLeft: number;
  trackRight: number;
}

export function useJungleFuryGame() {
  const [isRunning, setIsRunning] = useState(false);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const lastTimeRef = useRef<number>(0);
  
  // Game state refs
  const playerRef = useRef({
    x: WIDTH / 2,
    y: HEIGHT - 120,
    speed: 6,
    alive: true,
    finished: false,
  });
  
  const inputRef = useRef({
    left: false,
    right: false,
  });
  
  const aiCarsRef = useRef<Car[]>([]);
  const obstaclesRef = useRef<Obstacle[]>([]);
  const rocksRef = useRef<Obstacle[]>([]);
  const finishYRef = useRef(-2000);
  
  // Snapshot for rendering
  const [gameSnapshot, setGameSnapshot] = useState<GameSnapshot>({
    playerX: WIDTH / 2,
    playerY: HEIGHT - 120,
    playerAlive: true,
    playerFinished: false,
    aiCars: [],
    obstacles: [],
    rocks: [],
    finishY: -2000,
    width: WIDTH,
    height: HEIGHT,
    trackLeft: TRACK_LEFT,
    trackRight: TRACK_RIGHT,
  });

  const initializeGame = useCallback(() => {
    playerRef.current = {
      x: WIDTH / 2,
      y: HEIGHT - 120,
      speed: 6,
      alive: true,
      finished: false,
    };
    
    aiCarsRef.current = [];
    for (let i = 0; i < 7; i++) {
      aiCarsRef.current.push({
        x: Math.random() * (TRACK_RIGHT - TRACK_LEFT - CAR_WIDTH) + TRACK_LEFT,
        y: Math.random() * (HEIGHT - 200) + 100,
        speed: Math.random() * 2 + 3,
        alive: true,
        finished: false,
      });
    }
    
    obstaclesRef.current = [];
    rocksRef.current = [];
    finishYRef.current = -2000;
    inputRef.current = { left: false, right: false };
  }, []);

  const spawnObstacle = useCallback(() => {
    if (Math.random() < 0.033) {
      obstaclesRef.current.push({
        x: Math.random() * (TRACK_RIGHT - TRACK_LEFT - 30) + TRACK_LEFT + 15,
        y: -50,
      });
    }
  }, []);

  const spawnRock = useCallback(() => {
    if (Math.random() < 0.05) {
      const x1 = Math.random() * 40 + 30;
      const x2 = Math.random() * 40 + (WIDTH - 70);
      rocksRef.current.push({ x: x1, y: -50 });
      rocksRef.current.push({ x: x2, y: -50 });
    }
  }, []);

  const checkCollision = useCallback(
    (x1: number, y1: number, w1: number, h1: number, x2: number, y2: number, w2: number, h2: number) => {
      return x1 < x2 + w2 && x1 + w1 > x2 && y1 < y2 + h2 && y1 + h1 > y2;
    },
    []
  );

  const gameLoop = useCallback((currentTime: number) => {
    const deltaTime = currentTime - lastTimeRef.current;
    lastTimeRef.current = currentTime;

    const player = playerRef.current;
    
    if (!player.alive || player.finished) {
      setGameSnapshot({
        playerX: player.x,
        playerY: player.y,
        playerAlive: player.alive,
        playerFinished: player.finished,
        aiCars: [...aiCarsRef.current],
        obstacles: [...obstaclesRef.current],
        rocks: [...rocksRef.current],
        finishY: finishYRef.current,
        width: WIDTH,
        height: HEIGHT,
        trackLeft: TRACK_LEFT,
        trackRight: TRACK_RIGHT,
      });
      return;
    }

    // Move finish line
    finishYRef.current += 3;

    // Player controls
    if (inputRef.current.left && player.x > TRACK_LEFT + 5) {
      player.x -= player.speed;
    }
    if (inputRef.current.right && player.x < TRACK_RIGHT - CAR_WIDTH - 5) {
      player.x += player.speed;
    }
    
    // Player forward movement
    player.y -= 2;

    // Spawn obstacles and rocks
    spawnObstacle();
    spawnRock();

    // Update obstacles
    obstaclesRef.current = obstaclesRef.current.filter((obs) => {
      obs.y += 6;
      
      // Check collision with player
      if (player.alive && checkCollision(player.x, player.y, CAR_WIDTH, CAR_HEIGHT, obs.x - 15, obs.y - 15, 30, 30)) {
        player.alive = false;
      }
      
      // Check collision with AI cars
      aiCarsRef.current.forEach((ai) => {
        if (ai.alive && checkCollision(ai.x, ai.y, CAR_WIDTH, CAR_HEIGHT, obs.x - 15, obs.y - 15, 30, 30)) {
          ai.alive = false;
        }
      });
      
      return obs.y < HEIGHT;
    });

    // Update rocks
    rocksRef.current = rocksRef.current.filter((rock) => {
      rock.y += 6;
      
      // Check collision with player
      if (player.alive && checkCollision(player.x, player.y, CAR_WIDTH, CAR_HEIGHT, rock.x - 20, rock.y - 20, 40, 40)) {
        player.alive = false;
      }
      
      return rock.y < HEIGHT;
    });

    // Update AI cars
    aiCarsRef.current.forEach((ai) => {
      if (ai.alive) {
        ai.y += ai.speed;
        if (ai.y > HEIGHT) {
          ai.y = -50;
          ai.x = Math.random() * (TRACK_RIGHT - TRACK_LEFT - CAR_WIDTH) + TRACK_LEFT;
        }
      }
    });

    // Check finish
    if (player.alive && player.y < finishYRef.current) {
      player.finished = true;
    }

    // Update snapshot
    setGameSnapshot({
      playerX: player.x,
      playerY: player.y,
      playerAlive: player.alive,
      playerFinished: player.finished,
      aiCars: [...aiCarsRef.current],
      obstacles: [...obstaclesRef.current],
      rocks: [...rocksRef.current],
      finishY: finishYRef.current,
      width: WIDTH,
      height: HEIGHT,
      trackLeft: TRACK_LEFT,
      trackRight: TRACK_RIGHT,
    });

    if (isRunning) {
      animationFrameRef.current = requestAnimationFrame(gameLoop);
    }
  }, [isRunning, spawnObstacle, spawnRock, checkCollision]);

  useEffect(() => {
    if (isRunning) {
      lastTimeRef.current = performance.now();
      animationFrameRef.current = requestAnimationFrame(gameLoop);
    }
    
    return () => {
      if (animationFrameRef.current !== undefined) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isRunning, gameLoop]);

  const startGame = useCallback(() => {
    initializeGame();
    setIsRunning(true);
  }, [initializeGame]);

  const resetGame = useCallback(() => {
    setIsRunning(false);
    if (animationFrameRef.current !== undefined) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    initializeGame();
    setGameSnapshot({
      playerX: WIDTH / 2,
      playerY: HEIGHT - 120,
      playerAlive: true,
      playerFinished: false,
      aiCars: [],
      obstacles: [],
      rocks: [],
      finishY: -2000,
      width: WIDTH,
      height: HEIGHT,
      trackLeft: TRACK_LEFT,
      trackRight: TRACK_RIGHT,
    });
  }, [initializeGame]);

  const updatePlayerInput = useCallback((direction: 'left' | 'right', pressed: boolean) => {
    inputRef.current[direction] = pressed;
  }, []);

  return {
    gameSnapshot,
    startGame,
    resetGame,
    updatePlayerInput,
  };
}

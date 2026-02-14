export interface GameAssets {
  background: HTMLImageElement | null;
  carPlayer: HTMLImageElement | null;
  carAi: HTMLImageElement | null;
  obstacleAnimal: HTMLImageElement | null;
  obstacleRock: HTMLImageElement | null;
  finishLine: HTMLImageElement | null;
}

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => {
      console.warn(`Failed to load image: ${src}`);
      resolve(null);
    };
    img.src = src;
  });
}

export async function loadAssets(): Promise<GameAssets> {
  const [background, carPlayer, carAi, obstacleAnimal, obstacleRock, finishLine] = await Promise.all([
    loadImage('/assets/generated/jungle-bg.dim_1600x900.png'),
    loadImage('/assets/generated/car-player-yellow.dim_128x128.png'),
    loadImage('/assets/generated/car-ai-grey.dim_128x128.png'),
    loadImage('/assets/generated/obstacle-animal.dim_128x128.png'),
    loadImage('/assets/generated/obstacle-rock.dim_128x128.png'),
    loadImage('/assets/generated/finish-line.dim_512x128.png'),
  ]);

  return {
    background,
    carPlayer,
    carAi,
    obstacleAnimal,
    obstacleRock,
    finishLine,
  };
}

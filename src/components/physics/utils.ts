export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 600;

export const GRID_WIDTH = 16;
export const GRID_HEIGHT = 12;

export const CELL_WIDTH = CANVAS_WIDTH / GRID_WIDTH;
export const CELL_HEIGHT = CANVAS_HEIGHT / GRID_HEIGHT;

export function getCellIndex(x: number, y: number) {
  return (
    Math.floor((x / CANVAS_WIDTH) * GRID_WIDTH) +
    Math.floor((y / CANVAS_HEIGHT) * GRID_HEIGHT) * GRID_WIDTH
  );
}

export const randomInt = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export function randomColor() {
  var h = randomInt(0, 360);
  var s = randomInt(42, 98);
  var l = randomInt(40, 90);
  return `hsl(${h},${s}%,${l}%)`;
}

export function clearScreen(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, 800, 600);
}

export function drawBall(
  ctx: CanvasRenderingContext2D,
  x = 0,
  y = 0,
  radius = 20,
  color = 'white'
) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, 2 * Math.PI);
  ctx.fill();
}

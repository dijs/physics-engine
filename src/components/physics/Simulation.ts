import Solver from './Solver';
import {
  CELL_HEIGHT,
  CELL_WIDTH,
  clearScreen,
  drawBall,
  GRID_WIDTH,
  randomColor,
  randomInt,
} from './utils';
import VerletCircle from './VerletCircle';

const frameTime = 1 / 60;
const spawnTime = 1000;

export default class Simulation {
  private solver = new Solver();
  private shouldStop = false;
  private lastSpawn = Date.now();
  private times: number[] = [];

  public fps: number = 0;
  public running = false;

  constructor(private ctx: CanvasRenderingContext2D) {
    // const leftRoot = new VerletCircle(260, 300, 7, 'red', true);
    // const rightRoot = new VerletCircle(530, 300, 7, 'red', true);
    // const objects = [leftRoot];
    // for (let i = 0; i < 24; i++) {
    //   const ball = new VerletCircle(270 + 10 * i, 300, 5, 'orange');
    //   objects.push(ball);
    // }
    // objects.push(rightRoot);
    // for (const object of objects) {
    //   this.solver.addObject(object);
    // }
    // this.solver.addChain(objects, 16);
  }

  start() {
    if (this.running) return;
    this.shouldStop = false;
    this.running = true;
    this.gameLoop();
  }

  stop() {
    this.running = false;
    this.shouldStop = true;
  }

  private calculateFps() {
    const now = performance.now();
    while (this.times.length > 0 && this.times[0] <= now - 1000) {
      this.times.shift();
    }
    this.times.push(now);
    this.fps = this.times.length;
  }

  private gameLoop() {
    this.calculateFps();
    this.solver.update(frameTime);
    clearScreen(this.ctx);
    // Draw constraint area
    // drawBall(this.ctx, 400, 300, 200, 'white');
    // Draw info
    const count = this.solver.count();
    this.ctx.fillStyle = 'white';
    this.ctx.font = '20px Arial';
    this.ctx.fillText(`Balls: ${count}`, 10, 30);
    this.ctx.font = '13px Arial';
    this.ctx.fillText(`FPS: ${this.fps}`, 10, 50);
    this.ctx.fillText(`Collisions: ${this.solver.collisionCount}`, 10, 70);
    // Draw balls
    for (let i = 0; i < count; i++) {
      const ball = this.solver.get(i) as VerletCircle;
      this.ctx.fillStyle = '#90EE90';
      // draw grid cell
      const gx = ball.cellIndex % GRID_WIDTH;
      const gy = Math.floor(ball.cellIndex / GRID_WIDTH);

      this.ctx.fillRect(
        gx * CELL_WIDTH,
        gy * CELL_HEIGHT,
        CELL_WIDTH,
        CELL_HEIGHT
      );

      drawBall(
        this.ctx,
        ball.position.x,
        ball.position.y,
        ball.radius,
        ball.color
      );
    }
    // Spawn objects
    if (Date.now() - this.lastSpawn > spawnTime) {
      this.lastSpawn = Date.now();
      this.solver.addObject(
        new VerletCircle(500, 150, randomInt(4, 8), randomColor())
      );
    }
    if (this.shouldStop) return;
    requestAnimationFrame(() => this.gameLoop());
  }
}

import Solver from './Solver';
import { clearScreen, drawBall, randomColor, randomInt } from './utils';
import VerletCircle from './VerletCircle';

const frameTime = 1 / 60;
const spawnTime = 300;

export default class Simulation {
  private solver = new Solver();
  private shouldStop = false;
  private lastSpawn = Date.now();

  constructor(private ctx: CanvasRenderingContext2D) {}

  start() {
    this.gameLoop();
  }

  stop() {
    this.shouldStop = true;
  }

  gameLoop() {
    this.solver.update(frameTime);
    clearScreen(this.ctx);
    // Draw constraint area
    drawBall(this.ctx, 400, 300, 200, 'white');
    // Draw info
    const count = this.solver.count();
    this.ctx.fillStyle = 'white';
    this.ctx.font = '20px Arial';
    this.ctx.fillText(`Balls: ${count}`, 10, 30);
    // Draw balls
    for (let i = 0; i < count; i++) {
      const ball = this.solver.get(i) as VerletCircle;
      drawBall(
        this.ctx,
        ball.position.x,
        ball.position.y,
        ball.radius,
        ball.color
      );
    }
    // Handle user input
    if (Date.now() - this.lastSpawn > spawnTime) {
      this.lastSpawn = Date.now();
      this.solver.addObject(
        new VerletCircle(500, 150, randomInt(10, 20), randomColor())
      );
    }
    if (this.shouldStop) return;
    requestAnimationFrame(() => this.gameLoop());
  }
}

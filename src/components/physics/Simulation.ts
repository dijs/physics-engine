import QuadTreeNode from './QuadTreeNode';
import Solver from './Solver';
import {
  CELL_HEIGHT,
  CELL_WIDTH,
  clearScreen,
  CollisionCheck,
  drawBall,
  getGridPosition,
  randomColor,
  randomInt,
} from './utils';
import VerletCircle from './VerletCircle';

const frameTime = 1 / 60;
const spawnTime = 70;

export default class Simulation {
  private solver = new Solver();
  private shouldStop = false;
  private lastSpawn = Date.now();
  private times: number[] = [];

  public fps: number = 0;
  public running = false;
  public showGrid = false;
  public showQuadTree = true;

  constructor(private ctx: CanvasRenderingContext2D) {
    const leftRoot = new VerletCircle(260, 300, 7, 'red', true);
    const rightRoot = new VerletCircle(530, 300, 7, 'red', true);
    const objects = [leftRoot];
    for (let i = 0; i < 24; i++) {
      const ball = new VerletCircle(270 + 10 * i, 300, 5, 'orange');
      objects.push(ball);
    }
    objects.push(rightRoot);
    for (const object of objects) {
      this.solver.addObject(object);
    }
    this.solver.addChain(objects, 16);
  }

  setCheck(type: CollisionCheck) {
    this.solver.check = type;
  }

  renderQuadTree(node: QuadTreeNode) {
    this.ctx.strokeStyle = 'red';
    this.ctx.strokeRect(
      node.bounds.x,
      node.bounds.y,
      node.bounds.width,
      node.bounds.height
    );
    this.ctx.fillStyle = 'white';
    this.ctx.font = '12px Arial';
    this.ctx.fillText(
      `${node.objects.length}`,
      node.bounds.x + node.bounds.width / 2,
      node.bounds.y + node.bounds.height * 0.1
    );
    for (const child of node.children) {
      this.renderQuadTree(child);
    }
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
    drawBall(this.ctx, 400, 300, 200, 'rgba(255, 255, 255, 0.1)');
    // Draw info
    const count = this.solver.count();
    this.ctx.fillStyle = 'white';
    this.ctx.font = '20px Arial';
    this.ctx.fillText(`Balls: ${count}`, 10, 30);
    this.ctx.font = '13px Arial';
    this.ctx.fillText(`FPS: ${this.fps}`, 10, 50);
    this.ctx.fillText(`Collisions: ${this.solver.collisionCount}`, 10, 70);
    this.ctx.fillText(
      `Collision Checks: ${this.solver.collisionChecks.toLocaleString()} (using ${
        this.solver.check
      })`,
      10,
      90
    );
    // Draw balls
    for (let i = 0; i < count; i++) {
      const ball = this.solver.get(i) as VerletCircle;
      this.ctx.strokeStyle = '#90EE90';
      // draw grid cell
      if (this.showGrid) {
        const pos = getGridPosition(ball.cellIndex);
        this.ctx.strokeRect(
          pos.x * CELL_WIDTH,
          pos.y * CELL_HEIGHT,
          CELL_WIDTH,
          CELL_HEIGHT
        );
      }
      if (this.showQuadTree) {
        this.renderQuadTree(this.solver.quadTree);
      }
      drawBall(
        this.ctx,
        ball.position.x,
        ball.position.y,
        ball.radius,
        ball.color
      );
    }
    // Spawn objects
    if (this.solver.count() < 800 && Date.now() - this.lastSpawn > spawnTime) {
      this.lastSpawn = Date.now();
      this.solver.addObject(
        new VerletCircle(500, 150, randomInt(4, 8), randomColor())
      );
    }
    if (this.shouldStop) return;
    requestAnimationFrame(() => this.gameLoop());
  }

  addBall(x: number, y: number) {
    this.solver.addObject(new VerletCircle(x, y, 7, 'purple'));
  }
}

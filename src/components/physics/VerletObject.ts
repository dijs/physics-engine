import { getCellIndex } from './utils';
import Vec2 from './Vec2';

// TODO: Maybe add sleeping to objects
export default class VerletObject {
  private position_old: Vec2;
  private acceleration: Vec2;

  position: Vec2;
  cellIndex: number;

  constructor(x = 0, y = 0, public isStatic: boolean = false) {
    this.position = new Vec2(x, y);
    this.position_old = new Vec2(x, y);
    this.cellIndex = getCellIndex(x, y);
    this.acceleration = new Vec2();
  }

  updatePosition(dt: number) {
    if (this.isStatic) return;
    const velocity = this.position.sub(this.position_old);
    this.position_old = this.position;
    // Verlet integration
    this.position = this.position
      .add(velocity)
      .add(this.acceleration.times(dt * dt));
    this.cellIndex = getCellIndex(this.position.x, this.position.y);
    // Reset acceleration
    this.acceleration = Vec2.ZERO;
  }

  accelerate(acc: Vec2) {
    this.acceleration = this.acceleration.add(acc);
  }

  distance(v: Vec2) {
    return this.position.distance(v);
  }

  setPosition(v: Vec2) {
    this.position = v;
  }

  move(v: Vec2) {
    if (this.isStatic) return;
    this.position = this.position.add(v);
  }
}

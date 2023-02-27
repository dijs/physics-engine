import { getCellIndex } from './utils';
import Vec2 from './Vec2';

export default class VerletObject {
  private position_old: Vec2;
  private acceleration: Vec2;
  // private sleepChecks = 0;
  // sleeping: boolean = false;

  lastSpeed: number = 0;

  position: Vec2;
  cellIndex: number;
  handledCollisionDuringFrame: boolean = false;

  constructor(x = 0, y = 0, public isStatic: boolean = false) {
    this.position = new Vec2(x, y);
    this.position_old = new Vec2(x, y);
    this.cellIndex = getCellIndex(x, y);
    this.acceleration = new Vec2();
  }

  // speed() {
  //   return this.position.sub(this.position_old).length();
  // }

  updatePosition(dt: number) {
    if (this.isStatic) return;
    // if (this.sleeping) return;

    const velocity = this.position.sub(this.position_old);

    this.lastSpeed = velocity.length();

    // if (velocity.length() < 0.05) {
    //   this.sleepChecks++;
    //   if (this.sleepChecks > 10) {
    //     this.sleeping = true;
    //     this.sleepChecks = 0;
    //   }
    // }

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

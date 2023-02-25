import Vec2 from './Vec2';

// TODO: Add static objects as well which do not move, but collide

export default class VerletObject {
  position: Vec2;
  position_old: Vec2;
  acceleration: Vec2;

  constructor(x = 0, y = 0) {
    this.position = new Vec2(x, y);
    this.position_old = new Vec2(x, y);
    this.acceleration = new Vec2();
  }

  updatePosition(dt: number) {
    const velocity = this.position.sub(this.position_old);
    this.position_old = this.position;
    // Verlet integration
    this.position = this.position
      .add(velocity)
      .add(this.acceleration.times(dt * dt));
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
}

export default class Vec2 {
  constructor(public x: number = 0, public y: number = 0) {}

  static ZERO = new Vec2(0, 0);

  sub(v: Vec2) {
    return new Vec2(this.x - v.x, this.y - v.y);
  }
  add(v: Vec2) {
    return new Vec2(this.x + v.x, this.y + v.y);
  }
  times(n: number) {
    return new Vec2(this.x * n, this.y * n);
  }
  distance(v: Vec2) {
    return Math.hypot(this.x - v.x, this.y - v.y);
  }
  length() {
    return Math.hypot(this.x, this.y);
  }
}

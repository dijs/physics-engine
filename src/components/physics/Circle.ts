export default class Circle {
  constructor(public x: number, public y: number, public radius: number) {}

  contains(x: number, y: number) {
    return Math.hypot(x - this.x, y - this.y) < this.radius;
  }
}

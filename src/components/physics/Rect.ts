import Circle from './Circle';

export default class Rect {
  constructor(
    public x: number,
    public y: number,
    public width: number,
    public height: number
  ) {}

  contains(x: number, y: number) {
    const outside =
      x < this.x ||
      x > this.x + this.width ||
      y < this.y ||
      y > this.y + this.height;
    return !outside;
  }

  intersects(other: Circle) {
    const x = Math.max(this.x, Math.min(other.x, this.x + this.width));
    const y = Math.max(this.y, Math.min(other.y, this.y + this.height));
    const distance = Math.hypot(x - other.x, y - other.y);
    return distance < other.radius;
  }
}

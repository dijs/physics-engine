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

  intersects(other: Rect) {
    const outside =
      other.x > this.x + this.width ||
      other.x + other.width < this.x ||
      other.y > this.y + this.height ||
      other.y + other.height < this.y;
    return !outside;
  }
}

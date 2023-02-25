import VerletObject from './VerletObject';

export default class Link {
  constructor(
    private a: VerletObject,
    private b: VerletObject,
    private targetDistance: number = 0
  ) {}

  apply() {
    const axis = this.a.position.sub(this.b.position);
    const distance = axis.length();
    const n = axis.times(1 / distance);
    const delta = this.targetDistance - distance;
    const correction = n.times(delta * 0.5);
    this.a.move(correction);
    this.b.move(correction.negate());
  }
}

import VerletObject from './VerletObject';

export default class VerletCircle extends VerletObject {
  radius: number;
  color: string;

  constructor(x = 0, y = 0, radius = 20, color = 'red') {
    super(x, y);
    this.radius = radius;
    this.color = color;
  }
}

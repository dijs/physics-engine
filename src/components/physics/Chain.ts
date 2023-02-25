import Link from './Link';
import VerletObject from './VerletObject';

export default class Chain {
  private links: Link[] = [];

  constructor(objects: VerletObject[], targetDistance: number = 0) {
    for (let i = 0; i < objects.length - 1; i++) {
      this.links.push(new Link(objects[i], objects[i + 1], targetDistance));
    }
  }

  apply() {
    for (const link of this.links) {
      link.apply();
    }
  }
}

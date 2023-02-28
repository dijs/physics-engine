import Circle from './Circle';
import Rect from './Rect';
import VerletObject from './VerletObject';

export default class QuadTreeNode {
  objects: VerletObject[] = [];
  children: QuadTreeNode[] = [];

  constructor(public bounds: Rect, private capacity: number = 4) {}

  query(range: Circle): VerletObject[] {
    const found: VerletObject[] = [];
    if (!this.bounds.intersects(range)) {
      return found;
    }
    for (const object of this.objects) {
      if (range.contains(object.position.x, object.position.y)) {
        found.push(object);
      }
    }
    if (this.children.length > 0) {
      for (const child of this.children) {
        found.push(...child.query(range));
      }
    }
    return found;
  }

  insert(object: VerletObject) {
    if (!this.bounds.contains(object.position.x, object.position.y)) {
      return false;
    }
    if (this.objects.length < this.capacity) {
      this.objects.push(object);
      return true;
    } else {
      if (this.children.length === 0) {
        this.subdivide();
      }
      for (const child of this.children) {
        if (child.insert(object)) {
          return true;
        }
      }
    }
    return false;
  }

  subdivide() {
    const halfWidth = this.bounds.width / 2;
    const halfHeight = this.bounds.height / 2;
    this.children.push(
      // North West
      new QuadTreeNode(
        new Rect(this.bounds.x, this.bounds.y, halfWidth, halfHeight),
        this.capacity
      ),
      // North East
      new QuadTreeNode(
        new Rect(
          this.bounds.x + halfWidth,
          this.bounds.y,
          halfWidth,
          halfHeight
        ),
        this.capacity
      ),
      // South West
      new QuadTreeNode(
        new Rect(
          this.bounds.x,
          this.bounds.y + halfHeight,
          halfWidth,
          halfHeight
        ),
        this.capacity
      ),
      // South East
      new QuadTreeNode(
        new Rect(
          this.bounds.x + halfWidth,
          this.bounds.y + halfHeight,
          halfWidth,
          halfHeight
        ),
        this.capacity
      )
    );
  }
}

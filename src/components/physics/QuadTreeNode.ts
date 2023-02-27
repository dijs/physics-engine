import Rect from './Rect';
import VerletObject from './VerletObject';

// Source: https://gamedev.stackexchange.com/questions/10202/quad-trees-grid-based-collision-putting-logic-into-action/10253#10253
export default class QuadTreeNode {
  objects: VerletObject[] = [];
  children: QuadTreeNode[] = [];

  constructor(public bounds: Rect, private capacity: number = 4) {}

  insert(object: VerletObject) {
    if (!this.bounds.contains(object.position.x, object.position.y)) {
      return;
    }

    if (this.objects.length < this.capacity) {
      this.objects.push(object);
    } else {
      if (this.children.length === 0) {
        this.subdivide();
      }
      for (const child of this.children) {
        child.insert(object);
      }
    }
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

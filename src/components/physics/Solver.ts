import Chain from './Chain';
import {
  getCellIndex,
  getCellIndexFromGridPosition,
  GRID_HEIGHT,
  GRID_WIDTH,
} from './utils';
import Vec2 from './Vec2';
import VerletCircle from './VerletCircle';

export default class Solver {
  private gravity = new Vec2(0, 1000);
  private objects: VerletCircle[] = [];
  private chains: Chain[] = [];

  private cells: { [key: number]: VerletCircle[] } = {};

  collisionCount = 0;
  collisionChecks = 0;
  debug = '';

  constructor(private subSteps: number = 8) {
    for (let i = 0; i < GRID_WIDTH * GRID_HEIGHT; i++) {
      this.cells[i] = [];
    }
  }

  addObject(object: VerletCircle) {
    this.objects.push(object);
  }

  addChain(objects: VerletCircle[], targetDistance: number = 0) {
    this.chains.push(new Chain(objects, targetDistance));
  }

  update(dt: number) {
    const sub_dt = dt / this.subSteps;
    for (let i = 0; i < this.subSteps; i++) {
      this.applyGravity();
      // TODO: Should be able to add more constraints
      this.applyConstraint(new Vec2(400, 300), 200);
      this.solveGridCollisions();
      for (const chain of this.chains) {
        chain.apply();
      }
      this.updatePositions(sub_dt);
    }
  }

  updatePositions(dt: number) {
    for (const object of this.objects) {
      const lastCellIndex = object.cellIndex;
      object.updatePosition(dt);

      // TODO: Keep updated list of which object is in which cell
      const cellIndex = object.cellIndex;

      if (cellIndex !== lastCellIndex) {
        // Remove from old cell
        this.cells[lastCellIndex].splice(
          this.cells[lastCellIndex].indexOf(object),
          1
        );
        // Add to new cell
        this.cells[cellIndex].push(object);
      }
    }
  }

  applyGravity() {
    for (const object of this.objects) {
      object.accelerate(this.gravity);
    }
  }

  applyConstraint(center: Vec2, radius: number) {
    for (const object of this.objects) {
      const delta = object.position.sub(center);
      const dist = delta.length();
      if (dist > radius - object.radius) {
        const n = delta.times(1 / dist);
        object.setPosition(center.add(n.times(radius - object.radius)));
      }
    }
  }

  getObjectsInCell(cellIndex: number) {
    return this.objects.filter((object) => object.cellIndex === cellIndex);
  }

  // TODO: Trying to do less checks thn 80k
  // Collision count was 737
  solveGridCollisions() {
    this.collisionCount = 0;
    this.collisionChecks = 0;
    this.debug = '';
    for (let y = 1; y < GRID_HEIGHT - 1; y++) {
      for (let x = 1; x < GRID_WIDTH - 1; x++) {
        const cellIndex = x + y * GRID_WIDTH;

        // const objects = this.cells[cellIndex];
        // const n = objects.length;
        // this.solveCollisions(objects);

        // this.debug += n + ',';
        // this.collisionChecks += n * (n - 1);
        for (let dx = -1; dx <= 1; dx++) {
          for (let dy = -1; dy <= 1; dy++) {
            // Skip self
            // if (dx === 0 && dy === 0) continue;
            const nx = x + dx;
            const ny = y + dy;
            const cellIndexOther = nx + ny * GRID_WIDTH;

            this.solveCellCollisions(
              this.cells[cellIndex],
              this.cells[cellIndexOther]
            );
            // this.solveCellCollisions(objects1, objects2);
          }
        }
        // }
      }
    }
  }

  // TODO: Use object indexes instead of objects here...
  solveCellCollisions(list1: VerletCircle[], list2: VerletCircle[]) {
    for (const object1 of list1) {
      for (const object2 of list2) {
        if (object1 !== object2) {
          this.solveCollision(object1, object2);
        }
      }
    }
  }

  // solveCollisionsNaive() {
  //   this.collisionCount = 0;
  //   this.collisionChecks = 0;
  //   this.solveCollisions(this.objects);
  // }

  solveCollisions(objects: VerletCircle[]) {
    const len = objects.length;
    for (let i = 0; i < len; i++) {
      for (let j = i + 1; j < len; j++) {
        if (i !== j) {
          this.solveCollision(objects[i], objects[j]);
        }
      }
    }
  }

  solveCollision(object1: VerletCircle, object2: VerletCircle) {
    this.collisionChecks++;
    const collisionAxis = object1.position.sub(object2.position);
    const distance = collisionAxis.length();
    const radiusSum = object1.radius + object2.radius;
    // Detect overlaps
    if (distance < radiusSum) {
      this.collisionCount++;
      const axis_direction = collisionAxis.times(1 / distance);
      // Calculate the overlap
      const overlap = radiusSum - distance;
      // We move both objects by half the overlap
      const move = axis_direction.times(overlap * 0.5);
      object1.move(move);
      object2.move(move.negate());
    }
  }

  get(index: number) {
    return this.objects[index];
  }

  count() {
    return this.objects.length;
  }
}

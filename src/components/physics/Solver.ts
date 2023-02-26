import Chain from './Chain';
import { GRID_HEIGHT, GRID_WIDTH } from './utils';
import Vec2 from './Vec2';
import VerletCircle from './VerletCircle';

export default class Solver {
  private gravity = new Vec2(0, 1000);
  private objects: VerletCircle[] = [];
  private chains: Chain[] = [];
  private activeCells: { [key: number]: VerletCircle[] } = {};

  collisionCount = 0;

  constructor(private subSteps: number = 8) {}

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
      // this.solveCollisionsOld();
      // this.solveCollisions();
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
      if (lastCellIndex !== object.cellIndex) {
        // Remove object from old cell
        if (this.activeCells[lastCellIndex]) {
          this.activeCells[lastCellIndex].splice(
            this.activeCells[lastCellIndex].indexOf(object),
            1
          );
        }
        // Add object to new cell
        if (!this.activeCells[object.cellIndex]) {
          this.activeCells[object.cellIndex] = [];
        }
        this.activeCells[object.cellIndex].push(object);
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

  solveGridCollisions() {
    this.collisionCount = 0;
    for (let cx = 1; cx < GRID_WIDTH - 1; cx++) {
      for (let cy = 1; cy < GRID_HEIGHT - 1; cy++) {
        this.solveCollisions(this.findPotentialCollisionObjects(cx, cy));
      }
    }
  }

  findPotentialCollisionObjects(cx: number, cy: number) {
    let objects: VerletCircle[] = [];
    // For each inner cell, check the 8 surrounding cells
    for (let dx = 0; dx < 3; dx++) {
      for (let dy = 0; dy < 3; dy++) {
        const cellIndex = cx + dx + (cy + dy) * GRID_WIDTH;
        const objs = this.activeCells[cellIndex];
        if (objs) {
          for (const obj of objs) {
            objects.push(obj);
          }
        }
      }
    }
    return objects;
  }

  solveCollisions(objects: VerletCircle[]) {
    for (let i = 0; i < objects.length; i++) {
      for (let j = i + 1; j < objects.length; j++) {
        if (i !== j) {
          this.solveCollision(objects[i], objects[j]);
        }
      }
    }
  }

  solveCollision(object1: VerletCircle, object2: VerletCircle) {
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

  // TODO: Make this more efficient by using a quadtree
  solveCollisionsOld() {
    this.collisionCount = 0;
    for (let i = 0; i < this.objects.length; i++) {
      for (let j = 0; j < this.objects.length; j++) {
        if (i === j) continue;
        this.solveCollision(this.objects[i], this.objects[j]);
      }
    }
  }

  get(index: number) {
    return this.objects[index];
  }

  count() {
    return this.objects.length;
  }
}

import Chain from './Chain';
import Vec2 from './Vec2';
import VerletCircle from './VerletCircle';

export default class Solver {
  private gravity = new Vec2(0, 1000);
  private objects: VerletCircle[] = [];
  private chains: Chain[] = [];

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
      this.solveCollisions();
      for (const chain of this.chains) {
        chain.apply();
      }
      this.updatePositions(sub_dt);
    }
  }

  updatePositions(dt: number) {
    for (const object of this.objects) {
      object.updatePosition(dt);
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

  // TODO: Make this more efficient by using a quadtree
  solveCollisions() {
    for (let i = 0; i < this.objects.length; i++) {
      for (let j = 0; j < this.objects.length; j++) {
        if (i === j) continue;
        const collisionAxis = this.objects[i].position.sub(
          this.objects[j].position
        );
        const distance = collisionAxis.length();
        const radiusSum = this.objects[i].radius + this.objects[j].radius;
        // Detect overlaps
        if (distance < radiusSum) {
          const axis_direction = collisionAxis.times(1 / distance);
          // Calculate the overlap
          const overlap = radiusSum - distance;
          // We move both objects by half the overlap
          const move = axis_direction.times(overlap * 0.5);
          this.objects[i].move(move);
          this.objects[j].move(move.negate());
        }
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

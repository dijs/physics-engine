import { useEffect, useRef } from 'react';

// Source: https://www.youtube.com/watch?v=lS_qeBy3aQI

// TODO: Extract classes to separate files

const randomInt = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

function randomColor() {
  var h = randomInt(0, 360);
  var s = randomInt(42, 98);
  var l = randomInt(40, 90);
  return `hsl(${h},${s}%,${l}%)`;
}

function clearScreen(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, 800, 600);
}

function drawBall(
  ctx: CanvasRenderingContext2D,
  x = 0,
  y = 0,
  radius = 20,
  color = 'white'
) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, 2 * Math.PI);
  ctx.fill();
}

type Vec2 = {
  x: number;
  y: number;
  sub: (v: Vec2) => Vec2;
  add: (v: Vec2) => Vec2;
  times: (n: number) => Vec2;
  distance: (v: Vec2) => number;
  length: () => number;
};

function Vec2(x = 0, y = 0) {
  return {
    x,
    y,
    sub: (v: Vec2) => Vec2(x - v.x, y - v.y),
    add: (v: Vec2) => Vec2(x + v.x, y + v.y),
    times: (n: number) => Vec2(x * n, y * n),
    distance: (v: Vec2) => Math.sqrt((x - v.x) ** 2 + (y - v.y) ** 2),
    length: () => Math.sqrt(x ** 2 + y ** 2),
  };
}

class VerletObject {
  position: Vec2;
  position_old: Vec2;
  acceleration: Vec2;

  constructor(x = 0, y = 0) {
    this.position = Vec2(x, y);
    this.position_old = Vec2(x, y);
    this.acceleration = Vec2();
  }

  updatePosition(dt: number) {
    const velocity = this.position.sub(this.position_old);
    this.position_old = this.position;
    // Verlet integration
    this.position = this.position
      .add(velocity)
      .add(this.acceleration.times(dt * dt));
    // Reset acceleration
    this.acceleration = Vec2();
  }

  accelerate(acc: Vec2) {
    this.acceleration = this.acceleration.add(acc);
  }

  distance(v: Vec2) {
    return this.position.distance(v);
  }

  setPosition(v: Vec2) {
    this.position = v;
  }
}

class VerletCircle extends VerletObject {
  radius: number;
  color: string;

  constructor(x = 0, y = 0, radius = 20, color = 'red') {
    super(x, y);
    this.radius = radius;
    this.color = color;
  }
}

function Solver() {
  const gravity = Vec2(0, 1000);
  const objects: VerletCircle[] = [];
  const subSteps = 2;

  function addObject(object: VerletCircle) {
    objects.push(object);
  }

  function update(dt: number) {
    const sub_dt = dt / subSteps;
    for (let i = 0; i < subSteps; i++) {
      applyGravity();
      applyConstraint(Vec2(400, 300), 200);
      solveCollisions();
      updatePositions(sub_dt);
    }
  }

  function updatePositions(dt: number) {
    for (const object of objects) {
      object.updatePosition(dt);
    }
  }

  function applyGravity() {
    for (const object of objects) {
      object.accelerate(gravity);
    }
  }

  function applyConstraint(center: Vec2, radius: number) {
    for (const object of objects) {
      const delta = object.position.sub(center);
      const dist = delta.length();
      if (dist > radius - object.radius) {
        const n = delta.times(1 / dist);
        object.setPosition(center.add(n.times(radius - object.radius)));
      }
    }
  }

  // TODO: Make this more efficient by using a quadtree
  function solveCollisions() {
    for (let i = 0; i < objects.length; i++) {
      for (let j = 0; j < objects.length; j++) {
        if (i === j) continue;
        const collisionAxis = objects[i].position.sub(objects[j].position);
        const distance = collisionAxis.length();
        const k = objects[i].radius + objects[j].radius;
        if (distance < k) {
          const n = collisionAxis.times(1 / distance);
          const delta = k - distance;
          const move = n.times(delta * 0.5);
          objects[i].setPosition(objects[i].position.add(move));
          objects[j].setPosition(objects[j].position.sub(move));
        }
      }
    }
  }

  function get(index: number) {
    return objects[index];
  }

  return {
    addObject,
    update,
    get,
    count: () => objects.length,
  };
}

function simulation(ctx: CanvasRenderingContext2D) {
  const frameTime = 1 / 60;
  const solver = Solver();
  const spawnTime = 300;

  let shouldStop = false;
  let lastSpawn = Date.now();

  function stop() {
    shouldStop = true;
  }

  function gameLoop() {
    solver.update(frameTime);
    clearScreen(ctx);
    // Draw constraint area
    drawBall(ctx, 400, 300, 200, 'white');
    // Draw info
    const count = solver.count();
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText(`Balls: ${count}`, 10, 30);
    // Draw balls
    for (let i = 0; i < count; i++) {
      const ball = solver.get(i) as VerletCircle;
      drawBall(ctx, ball.position.x, ball.position.y, ball.radius, ball.color);
    }
    // Handle user input
    if (Date.now() - lastSpawn > spawnTime) {
      lastSpawn = Date.now();
      solver.addObject(
        new VerletCircle(500, 150, randomInt(10, 20), randomColor())
      );
    }
    if (shouldStop) return;
    requestAnimationFrame(gameLoop);
  }

  gameLoop();

  return {
    stop,
  };
}

export default function PhysicsPage() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const sim = useRef<any>(null);

  useEffect(() => {
    const ctx = canvas.current?.getContext('2d');
    if (ctx) {
      if (sim.current) sim.current.stop();
      sim.current = simulation(ctx);
    }
  });

  return (
    <main>
      <h1>Physics</h1>
      <p>Physics is the science of matter and energy and their interactions.</p>
      <canvas ref={canvas} width="800" height="600"></canvas>
    </main>
  );
}

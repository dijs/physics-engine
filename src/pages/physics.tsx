import { useEffect, useRef } from 'react';

// Source: https://www.youtube.com/watch?v=lS_qeBy3aQI

// TODO: Make radius a property of the VerletObject

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

type VerletObject = {
  setPosition: (v: Vec2) => void;
  position: () => Vec2;
  updatePosition: (dt: number) => void;
  accelerate: (acc: Vec2) => void;
  distance: (v: Vec2) => number;
};

function VerletObject(x = 0, y = 0) {
  let position_current = Vec2(x, y);
  let position_old = Vec2(x, y);
  let acceleration = Vec2();

  function updatePosition(dt: number) {
    const velocity = position_current.sub(position_old);
    position_old = position_current;
    // Verlet integration
    position_current = position_current
      .add(velocity)
      .add(acceleration.times(dt * dt));
    // Reset acceleration
    acceleration = Vec2();
  }

  function accelerate(acc: Vec2) {
    acceleration = acceleration.add(acc);
  }

  function distance(v: Vec2) {
    return position_current.distance(v);
  }

  function setPosition(v: Vec2) {
    position_current = v;
  }

  return {
    setPosition,
    updatePosition,
    accelerate,
    distance,
    position: () => position_current,
  };
}

function Solver() {
  const objects: VerletObject[] = [];

  function addObject(object: VerletObject) {
    objects.push(object);
  }

  function update(dt: number) {
    applyGravity();
    applyConstraint();
    solveCollisions();
    updatePositions(dt);
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

  function applyConstraint() {
    const center = Vec2(400, 300);
    const radius = 200;

    for (const object of objects) {
      const delta = object.position().sub(center);
      const dist = delta.length();
      // 20 is ball radius
      if (dist > radius - 20) {
        const n = delta.times(1 / dist);
        object.setPosition(center.add(n.times(radius - 20)));
      }
    }
  }

  function solveCollisions() {
    for (let i = 0; i < objects.length; i++) {
      for (let j = 0; j < objects.length; j++) {
        if (i === j) continue;
        const collisionAxis = objects[i].position().sub(objects[j].position());
        const distance = collisionAxis.length();
        const k = 40; // radius of each ball added together
        if (distance < k) {
          const n = collisionAxis.times(1 / distance);
          const delta = k - distance;
          const move = n.times(delta * 0.5);
          objects[i].setPosition(objects[i].position().add(move));
          objects[j].setPosition(objects[j].position().sub(move));
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

const gravity = Vec2(0, 1000);
const frameTime = 1 / 60;

export default function PhysicsPage() {
  const canvas = useRef<HTMLCanvasElement>(null);

  let interval = useRef<NodeJS.Timeout>();

  const solver = useRef(Solver());

  useEffect(() => {
    const ctx = canvas.current?.getContext('2d');
    if (ctx) {
      solver.current.addObject(VerletObject(500, 150));

      clearInterval(interval.current);
      interval.current = setInterval(() => {
        clearScreen(ctx);

        drawBall(ctx, 400, 300, 200, 'white');

        solver.current.update(frameTime);
        for (let i = 0; i < solver.current.count(); i++) {
          const ball = solver.current.get(i);
          drawBall(ctx, ball.position().x, ball.position().y, 20, 'red');
        }
      }, 1000 / 60);

      console.log('Physics page loaded');
    }
  });

  function handleClick() {
    solver.current.addObject(VerletObject(500, 150));
  }

  return (
    <main onClick={handleClick}>
      <h1>Physics</h1>
      <p>Physics is the science of matter and energy and their interactions.</p>
      <canvas ref={canvas} width="800" height="600"></canvas>
    </main>
  );
}

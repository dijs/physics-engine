import Simulation from 'components/physics/Simulation';
import { CollisionCheck } from 'components/physics/utils';
import { useEffect, useRef, useState } from 'react';

export default function PhysicsPage() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const sim = useRef<Simulation | null>(null);

  const [running, setRunning] = useState(true);

  useEffect(() => {
    const ctx = canvas.current?.getContext('2d');
    if (ctx) {
      if (!sim.current) {
        sim.current = new Simulation(ctx);
      }
      if (running && !sim.current.running) {
        sim.current.start();
      }
      if (!running && sim.current.running) {
        sim.current.stop();
      }
    }
  }, [running]);

  function handleCanvasClick(e: React.MouseEvent<HTMLCanvasElement>) {
    const rect = canvas.current?.getBoundingClientRect();
    if (rect) {
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      sim.current?.addBall(x, y);
    }
  }

  return (
    <main>
      <h1>Demo</h1>
      <canvas
        onClick={handleCanvasClick}
        ref={canvas}
        width="800"
        height="600"
      ></canvas>
      <br />
      <button disabled={!running} onClick={() => setRunning(false)}>
        Stop
      </button>
      <button disabled={running} onClick={() => setRunning(true)}>
        Start
      </button>
      <button
        onClick={() =>
          sim.current && (sim.current.showGrid = !sim.current.showGrid)
        }
      >
        Toggle Grid
      </button>
      <button
        onClick={() =>
          sim.current && (sim.current.showQuadTree = !sim.current.showQuadTree)
        }
      >
        Toggle QuadTree
      </button>
      <button
        onClick={() =>
          sim.current && sim.current.setCheck(CollisionCheck.Naive)
        }
      >
        Use Naive
      </button>
      <button
        onClick={() => sim.current && sim.current.setCheck(CollisionCheck.Grid)}
      >
        Use Grid
      </button>
      <button
        onClick={() =>
          sim.current && sim.current.setCheck(CollisionCheck.QuadTree)
        }
      >
        Use QuadTree
      </button>
      <button onClick={() => sim.current && sim.current.reset()}>Reset</button>
    </main>
  );
}

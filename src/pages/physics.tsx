import Simulation from 'components/physics/Simulation';
import { useEffect, useRef, useState } from 'react';

// Source: https://www.youtube.com/watch?v=lS_qeBy3aQI

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

  return (
    <main>
      <h1>Physics</h1>
      <p>Physics is the science of matter and energy and their interactions.</p>
      <canvas ref={canvas} width="800" height="600"></canvas>
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
    </main>
  );
}

import Simulation from 'components/physics/Simulation';
import { useEffect, useRef } from 'react';

// Source: https://www.youtube.com/watch?v=lS_qeBy3aQI

export default function PhysicsPage() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const sim = useRef<Simulation | null>(null);

  useEffect(() => {
    const ctx = canvas.current?.getContext('2d');
    if (ctx) {
      if (sim.current) {
        sim.current.stop();
      }
      sim.current = new Simulation(ctx);
      sim.current.start();
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

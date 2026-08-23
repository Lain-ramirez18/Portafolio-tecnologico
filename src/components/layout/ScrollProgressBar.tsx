import { useScrollProgress } from '../../hooks/useScrollProgress';

export function ScrollProgressBar() {
  const pct = useScrollProgress();

  return (
    <div
      className="scroll-progress"
      id="scroll-progress"
      role="progressbar"
      aria-label="Progreso de lectura"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
      style={{ width: `${pct}%` }}
    />
  );
}

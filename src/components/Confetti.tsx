import { useEffect, useState } from "react";

const COLORS = ["#6366f1", "#a855f7", "#ec4899", "#22c55e", "#f59e0b"];

export function Confetti({ count = 40 }: { count?: number }) {
  const [pieces] = useState(() =>
    Array.from({ length: count }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.6,
      duration: 1.6 + Math.random() * 1.2,
      color: COLORS[i % COLORS.length],
      size: 6 + Math.random() * 6,
    }))
  );

  return (
    <div className="pointer-events-none fixed inset-0 z-[100] overflow-hidden">
      {pieces.map((p) => (
        <span
          key={p.id}
          className="absolute top-0 rounded-sm"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size,
            background: p.color,
            animation: `confetti-fall ${p.duration}s ${p.delay}s linear forwards`,
          }}
        />
      ))}
    </div>
  );
}
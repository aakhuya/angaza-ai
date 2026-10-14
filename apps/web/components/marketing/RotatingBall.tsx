/**
 * Decorative rotating football. Purely ornamental — hidden from assistive
 * tech. Respects prefers-reduced-motion: the rotation stops, but the ball
 * itself remains visible.
 */
export function RotatingBall({ size = 120 }: { size?: number }) {
  return (
    <div
      aria-hidden
      className="pointer-events-none select-none"
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 120 120"
        className="h-full w-full motion-safe:animate-[spin_32s_linear_infinite]"
      >
        <defs>
          <radialGradient id="ball-shade" cx="0.35" cy="0.3" r="0.85">
            <stop offset="0%" stopColor="#F1F4F8" stopOpacity="0.9" />
            <stop offset="55%" stopColor="#9AA5B5" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#263241" stopOpacity="0.9" />
          </radialGradient>
          <linearGradient id="ball-accent" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#E8BC67" />
            <stop offset="100%" stopColor="#A67C2B" />
          </linearGradient>
        </defs>

        {/* Outer sphere */}
        <circle cx="60" cy="60" r="56" fill="url(#ball-shade)" />
        <circle cx="60" cy="60" r="56" fill="none" stroke="url(#ball-accent)" strokeWidth="1.2" opacity="0.55" />

        {/* Classic pentagon panel — center */}
        <polygon
          points="60,40 74,50 68,66 52,66 46,50"
          fill="#080B10"
          stroke="url(#ball-accent)"
          strokeWidth="0.8"
        />

        {/* Surrounding pentagons — rotated around the sphere */}
        {[
          { cx: 60, cy: 22, rot: 0 },
          { cx: 92, cy: 42, rot: 72 },
          { cx: 82, cy: 84, rot: 144 },
          { cx: 38, cy: 84, rot: 216 },
          { cx: 28, cy: 42, rot: 288 },
        ].map((p, i) => (
          <polygon
            key={i}
            points="0,-9 8,-3 5,8 -5,8 -8,-3"
            transform={`translate(${p.cx} ${p.cy}) rotate(${p.rot})`}
            fill="#080B10"
            stroke="url(#ball-accent)"
            strokeWidth="0.7"
            opacity="0.85"
          />
        ))}

        {/* Seam lines */}
        <g stroke="#080B10" strokeWidth="0.6" opacity="0.55" fill="none">
          <path d="M60 40 L60 22" />
          <path d="M74 50 L92 42" />
          <path d="M68 66 L82 84" />
          <path d="M52 66 L38 84" />
          <path d="M46 50 L28 42" />
        </g>

        {/* Highlight */}
        <ellipse cx="42" cy="36" rx="16" ry="10" fill="#F1F4F8" opacity="0.18" />
      </svg>
    </div>
  );
}

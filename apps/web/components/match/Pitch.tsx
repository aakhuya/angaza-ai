"use client";

export type Formation =
  | "4-3-3"
  | "4-2-3-1"
  | "4-4-2"
  | "3-5-2"
  | "5-3-2";

export type PitchMarker = {
  id: string;
  /** 0..1, from left (home goal) to right (away goal). */
  x: number;
  /** 0..1, from top to bottom. */
  y: number;
  label?: string;
  number?: number;
  team: "home" | "away";
  /** Optional emphasis: pulsing ring for the player under spotlight. */
  highlight?: boolean;
};

export type PitchArrow = {
  from: { x: number; y: number };
  to: { x: number; y: number };
  tone?: "accent" | "teal" | "danger";
  dashed?: boolean;
};

const FORMATIONS: Record<Formation, Array<[number, number]>> = {
  "4-3-3": [
    [0.06, 0.50],
    [0.22, 0.14], [0.22, 0.38], [0.22, 0.62], [0.22, 0.86],
    [0.42, 0.22], [0.42, 0.50], [0.42, 0.78],
    [0.62, 0.18], [0.62, 0.50], [0.62, 0.82],
  ],
  "4-2-3-1": [
    [0.06, 0.50],
    [0.22, 0.14], [0.22, 0.38], [0.22, 0.62], [0.22, 0.86],
    [0.40, 0.38], [0.40, 0.62],
    [0.58, 0.18], [0.58, 0.50], [0.58, 0.82],
    [0.72, 0.50],
  ],
  "4-4-2": [
    [0.06, 0.50],
    [0.22, 0.14], [0.22, 0.38], [0.22, 0.62], [0.22, 0.86],
    [0.42, 0.14], [0.42, 0.38], [0.42, 0.62], [0.42, 0.86],
    [0.62, 0.38], [0.62, 0.62],
  ],
  "3-5-2": [
    [0.06, 0.50],
    [0.22, 0.28], [0.22, 0.50], [0.22, 0.72],
    [0.42, 0.10], [0.42, 0.34], [0.42, 0.50], [0.42, 0.66], [0.42, 0.90],
    [0.62, 0.38], [0.62, 0.62],
  ],
  "5-3-2": [
    [0.06, 0.50],
    [0.24, 0.10], [0.24, 0.30], [0.24, 0.50], [0.24, 0.70], [0.24, 0.90],
    [0.44, 0.30], [0.44, 0.50], [0.44, 0.70],
    [0.62, 0.38], [0.62, 0.62],
  ],
};

export function Pitch({
  formation = "4-3-3",
  markers,
  arrows = [],
  showLabels = false,
  className = "",
}: {
  formation?: Formation;
  markers?: PitchMarker[];
  arrows?: PitchArrow[];
  showLabels?: boolean;
  className?: string;
}) {
  const resolved = markers ?? defaultMarkers(formation);

  return (
    <div className={["relative w-full overflow-hidden rounded-lg border border-border bg-[#0A1512]", className].join(" ")}>
      <svg viewBox="0 0 100 60" className="block w-full" role="img" aria-label="Formation pitch">
        {/* Turf stripes */}
        <defs>
          <linearGradient id="turf" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0F2A22" />
            <stop offset="100%" stopColor="#0A1F19" />
          </linearGradient>
        </defs>
        <rect width="100" height="60" fill="url(#turf)" />
        {Array.from({ length: 8 }).map((_, i) => (
          <rect
            key={i}
            x={(i * 100) / 8}
            y={0}
            width={100 / 16}
            height={60}
            fill="rgba(255,255,255,0.02)"
          />
        ))}

        {/* Field markings */}
        <g stroke="rgba(255,255,255,0.20)" strokeWidth="0.18" fill="none">
          <rect x="3" y="3" width="94" height="54" />
          <line x1="50" y1="3" x2="50" y2="57" />
          <circle cx="50" cy="30" r="6" />
          <circle cx="50" cy="30" r="0.6" fill="rgba(255,255,255,0.20)" />
          <rect x="3" y="18" width="9" height="24" />
          <rect x="88" y="18" width="9" height="24" />
          <rect x="3" y="24" width="3" height="12" />
          <rect x="94" y="24" width="3" height="12" />
          {/* Arcs */}
          <path d="M 12 24 A 5 5 0 0 1 12 36" />
          <path d="M 88 24 A 5 5 0 0 0 88 36" />
        </g>

        {/* Arrows (behind players) */}
        {arrows.map((a, i) => (
          <Arrow key={i} {...a} />
        ))}

        {/* Players */}
        {resolved.map((m) => (
          <PlayerDot key={m.id} marker={m} showLabel={showLabels} />
        ))}
      </svg>
    </div>
  );
}

function PlayerDot({ marker, showLabel }: { marker: PitchMarker; showLabel: boolean }) {
  const cx = marker.x * 100;
  const cy = marker.y * 60;
  const fill = marker.team === "home" ? "#F5B33F" : "#4FBDB0";
  const ring = marker.team === "home" ? "rgba(245,179,63,0.35)" : "rgba(79,189,176,0.35)";

  return (
    <g>
      {marker.highlight && (
        <circle cx={cx} cy={cy} r="2.6" fill="none" stroke={ring} strokeWidth="0.5">
          <animate attributeName="r" values="2.6;3.6;2.6" dur="1.8s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.8;0.2;0.8" dur="1.8s" repeatCount="indefinite" />
        </circle>
      )}
      <circle cx={cx} cy={cy} r="1.5" fill={fill} stroke="#0A0C0E" strokeWidth="0.25" />
      {marker.number !== undefined && (
        <text
          x={cx}
          y={cy + 0.55}
          textAnchor="middle"
          fontSize="1.4"
          fontFamily="var(--font-mono), monospace"
          fontWeight="600"
          fill="#0A0C0E"
        >
          {marker.number}
        </text>
      )}
      {showLabel && marker.label && (
        <text
          x={cx}
          y={cy + 3.4}
          textAnchor="middle"
          fontSize="1.05"
          fontFamily="var(--font-inter), sans-serif"
          fill="rgba(255,255,255,0.72)"
        >
          {marker.label}
        </text>
      )}
    </g>
  );
}

function Arrow({ from, to, tone = "accent", dashed = false }: PitchArrow) {
  const x1 = from.x * 100;
  const y1 = from.y * 60;
  const x2 = to.x * 100;
  const y2 = to.y * 60;
  const stroke =
    tone === "accent" ? "#F5B33F" : tone === "teal" ? "#4FBDB0" : "#E05555";

  // Shorten the arrow so it doesn't overlap the destination marker.
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const shorten = 1.8;
  const xEnd = x2 - (dx / len) * shorten;
  const yEnd = y2 - (dy / len) * shorten;

  // Arrowhead
  const angle = Math.atan2(dy, dx);
  const head = 1.4;
  const hx1 = xEnd - head * Math.cos(angle - Math.PI / 7);
  const hy1 = yEnd - head * Math.sin(angle - Math.PI / 7);
  const hx2 = xEnd - head * Math.cos(angle + Math.PI / 7);
  const hy2 = yEnd - head * Math.sin(angle + Math.PI / 7);

  return (
    <g>
      <line
        x1={x1}
        y1={y1}
        x2={xEnd}
        y2={yEnd}
        stroke={stroke}
        strokeWidth="0.35"
        strokeDasharray={dashed ? "0.8 0.8" : undefined}
        strokeLinecap="round"
        opacity="0.85"
      />
      <path
        d={`M ${hx1} ${hy1} L ${xEnd} ${yEnd} L ${hx2} ${hy2}`}
        stroke={stroke}
        strokeWidth="0.35"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.85"
      />
    </g>
  );
}

/**
 * Default markers: home in a 4-3-3, away mirrored in a 4-2-3-1, ball near
 * the home half. Coordinates are layout-only; the component does not claim
 * that any of these are real players.
 */
function defaultMarkers(formation: Formation): PitchMarker[] {
  const home = FORMATIONS[formation];
  const away = FORMATIONS["4-2-3-1"];

  const homeMarkers: PitchMarker[] = home.map(([x, y], i) => ({
    id: `home-${i}`,
    x: 0.06 + x * 0.42, // compress into the left 48% of the pitch
    y,
    team: "home",
    number: i === 0 ? 1 : i,
    highlight: i === 8,
  }));

  const awayMarkers: PitchMarker[] = away.map(([x, y], i) => ({
    id: `away-${i}`,
    x: 0.94 - x * 0.42, // mirror to the right side
    y: 1 - y,
    team: "away",
    number: i === 0 ? 1 : i,
  }));

  return [...homeMarkers, ...awayMarkers];
}

/**
 * A hand-drawn SVG football.
 *
 * Why SVG and not a bitmap: this scales cleanly to any size, weighs ~2 KB,
 * and animates without pixelation. If you'd rather use a photorealistic
 * bitmap, drop one at /public/media/football.png and switch the <svg> to an
 * <Image>. The rotation wrapper works with either.
 *
 * Decorative only — hidden from assistive tech, motion-suppressed for users
 * who prefer reduced motion.
 */
export function RotatingBall({ size = 140 }: { size?: number }) {
  return (
    <div
      aria-hidden
      className="pointer-events-none select-none"
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 200 200"
        className="h-full w-full motion-safe:animate-[spin_28s_linear_infinite]"
      >
        <defs>
          {/* Base sphere shading: light from upper-left */}
          <radialGradient id="ball-base" cx="0.32" cy="0.28" r="0.85">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="45%" stopColor="#E8EBF0" />
            <stop offset="75%" stopColor="#B6BCC6" />
            <stop offset="100%" stopColor="#5A626E" />
          </radialGradient>

          {/* Ambient occlusion ring for the sphere edge */}
          <radialGradient id="ball-vignette" cx="0.5" cy="0.5" r="0.5">
            <stop offset="70%" stopColor="#000000" stopOpacity="0" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.55" />
          </radialGradient>

          {/* Soft highlight */}
          <radialGradient id="ball-gloss" cx="0.32" cy="0.24" r="0.35">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </radialGradient>

          {/* Subtle leather texture via a repeated radial pattern */}
          <pattern id="dimples" width="6" height="6" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="0.4" fill="#000000" opacity="0.05" />
            <circle cx="4" cy="3" r="0.3" fill="#000000" opacity="0.04" />
          </pattern>
        </defs>

        {/* Sphere base */}
        <circle cx="100" cy="100" r="92" fill="url(#ball-base)" />
        <circle cx="100" cy="100" r="92" fill="url(#dimples)" />
        <circle cx="100" cy="100" r="92" fill="url(#ball-vignette)" />

        {/*
          Panel seams.
          Central pentagon + five surrounding pentagons + connecting stitches.
          The geometry approximates a truncated icosahedron flattened onto a
          sphere.
        */}

        {/* Central pentagon */}
        <polygon
          points="100,68 128,88 117,122 83,122 72,88"
          fill="#0A0C10"
          stroke="#05070A"
          strokeWidth="1"
          strokeLinejoin="round"
        />

        {/* Five surrounding pentagons */}
        {[
          { cx: 100, cy: 34, r: 22, rot: 0 },
          { cx: 148, cy: 74, r: 22, rot: 72 },
          { cx: 130, cy: 132, r: 22, rot: 144 },
          { cx: 70, cy: 132, r: 22, rot: 216 },
          { cx: 52, cy: 74, r: 22, rot: 288 },
        ].map((p, i) => (
          <polygon
            key={i}
            points="0,-14 13.3,-4.3 8.2,11.3 -8.2,11.3 -13.3,-4.3"
            transform={`translate(${p.cx} ${p.cy}) rotate(${p.rot})`}
            fill="#0A0C10"
            stroke="#05070A"
            strokeWidth="1"
            strokeLinejoin="round"
          />
        ))}

        {/* Stitch lines connecting central pentagon to its neighbours */}
        <g stroke="#05070A" strokeWidth="0.8" strokeLinecap="round" opacity="0.9">
          <line x1="100" y1="68" x2="100" y2="48" />
          <line x1="128" y1="88" x2="146" y2="80" />
          <line x1="117" y1="122" x2="126" y2="138" />
          <line x1="83" y1="122" x2="74" y2="138" />
          <line x1="72" y1="88" x2="54" y2="80" />
        </g>

        {/* Stitch dashes along the seams for a leather feel */}
        <g stroke="#05070A" strokeWidth="0.35" strokeLinecap="round" opacity="0.7">
          <line x1="88" y1="44" x2="112" y2="44" strokeDasharray="2 2" />
          <line x1="152" y1="60" x2="160" y2="70" strokeDasharray="2 2" />
          <line x1="150" y1="98" x2="156" y2="112" strokeDasharray="2 2" />
          <line x1="118" y1="152" x2="132" y2="158" strokeDasharray="2 2" />
          <line x1="82" y1="152" x2="68" y2="158" strokeDasharray="2 2" />
          <line x1="50" y1="98" x2="44" y2="112" strokeDasharray="2 2" />
          <line x1="48" y1="60" x2="40" y2="70" strokeDasharray="2 2" />
        </g>

        {/* Specular highlight */}
        <ellipse
          cx="72"
          cy="58"
          rx="26"
          ry="16"
          fill="url(#ball-gloss)"
          transform="rotate(-25 72 58)"
        />

        {/* Ground contact shadow (very subtle, sells the 3D-ness) */}
        <ellipse
          cx="100"
          cy="192"
          rx="60"
          ry="6"
          fill="#000000"
          opacity="0.35"
        />
      </svg>
    </div>
  );
}

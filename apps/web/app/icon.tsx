import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#080B10",
          borderRadius: 6,
        }}
      >
        <svg width="26" height="26" viewBox="0 0 32 32">
          <defs>
            <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#E8BC67" />
              <stop offset="100%" stopColor="#A67C2B" />
            </linearGradient>
          </defs>
          <rect x="2" y="2" width="28" height="28" rx="7" fill="none" stroke="url(#g)" strokeWidth="2.4" />
          <path d="M10 26 L16 6 M22 26 L16 6" stroke="url(#g)" strokeWidth="2.6" strokeLinecap="round" fill="none" />
          <circle cx="16" cy="17" r="3.2" fill="none" stroke="url(#g)" strokeWidth="2" />
        </svg>
      </div>
    ),
    { ...size },
  );
}

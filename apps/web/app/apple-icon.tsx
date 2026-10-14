import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
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
        }}
      >
        <svg width="140" height="140" viewBox="0 0 32 32">
          <defs>
            <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#E8BC67" />
              <stop offset="100%" stopColor="#A67C2B" />
            </linearGradient>
          </defs>
          <circle cx="16" cy="16" r="14" fill="#0A0F16" />
          <circle cx="16" cy="16" r="14" fill="none" stroke="url(#g)" strokeWidth="2" />
          <polygon points="16,10.5 21,14 19.2,20 12.8,20 11,14" fill="none" stroke="url(#g)" strokeWidth="1.4" strokeLinejoin="round" />
          <path d="M16 9.5 L21 22 L18.6 22 L16 15.2 L13.4 22 L11 22 Z" fill="url(#g)" />
          <rect x="13.6" y="17.4" width="4.8" height="1.4" fill="url(#g)" />
        </svg>
      </div>
    ),
    { ...size },
  );
}

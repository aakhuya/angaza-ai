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
          background: "#020202",
          borderRadius: 6,
        }}
      >
        <svg width="26" height="26" viewBox="0 0 40 40">
          <defs>
            <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#F5B33F" />
              <stop offset="100%" stopColor="#B87A1E" />
            </linearGradient>
          </defs>
          <rect x="1.5" y="1.5" width="37" height="37" rx="8" fill="none" stroke="url(#g)" strokeWidth="2.4" />
          <path d="M12 32 L20 8 M28 32 L20 8" stroke="url(#g)" strokeWidth="2.8" strokeLinecap="round" fill="none" />
          <path d="M15.5 22 L24.5 22" stroke="url(#g)" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      </div>
    ),
    { ...size },
  );
}

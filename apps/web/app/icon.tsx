import { readFileSync } from "node:fs";
import { join } from "node:path";

import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

const logoBase64 = readFileSync(
  join(process.cwd(), "public/media/logo.png"),
).toString("base64");

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
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`data:image/png;base64,${logoBase64}`}
          style={{ width: 30, height: 30, objectFit: "contain" }}
          alt=""
        />
      </div>
    ),
    { ...size },
  );
}

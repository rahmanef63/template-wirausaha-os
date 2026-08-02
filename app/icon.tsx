import { ImageResponse } from "next/og";

// Static brand-letter favicon (placeholder). Avoids the empty /favicon.ico
// request and gives every clone a recognisable mark out of the box. Owners
// can drop a real app/icon.png/.ico or upload a favicon in admin Settings.
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
          background: "#0a0a0a",
          color: "#fafafa",
          fontSize: 22,
          fontWeight: 700,
          borderRadius: 7,
        }}
      >
        W
      </div>
    ),
    { ...size },
  );
}

import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 80,
          background: "#f8fafc",
          color: "#101827",
          fontFamily: "Arial"
        }}
      >
        <div style={{ fontSize: 72, fontWeight: 900 }}>GadgetGallery</div>
        <div style={{ marginTop: 24, fontSize: 34, color: "#0f766e" }}>Gadgets and accessories in BDT</div>
      </div>
    ),
    size
  );
}

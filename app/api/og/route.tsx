import { ImageResponse } from "next/og";
const size = { width: 1200, height: 630 };
export async function GET(request: Request) {
  const code = new URL(request.url).searchParams.get("lang");
  const lines =
    code === "en"
      ? ["Better decisions.", "Better business outcomes."]
      : code === "ca"
        ? ["Millors decisions.", "Millors resultats empresarials."]
        : ["Mejores decisiones.", "Mejores resultados empresariales."];
  const footer =
    code === "en"
      ? "Data · Mathematics · Artificial intelligence"
      : code === "ca"
        ? "Dades · Matemàtiques · Intel·ligència artificial"
        : "Datos · Matemáticas · Inteligencia artificial";
  return new ImageResponse(
    <div
      style={{
        background: "#0D1B2A",
        color: "#FAFAF7",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 70,
      }}
    >
      <div style={{ fontSize: 32, color: "#B4B6FF" }}>SC·Analytics</div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          fontSize: 65,
          lineHeight: 1.1,
        }}
      >
        {lines.map((line) => (
          <span key={line}>{line}</span>
        ))}
      </div>
      <div
        style={{
          display: "flex",
          fontSize: 25,
          color: "#A8BACB",
          borderTop: "1px solid #496C8A",
          paddingTop: 25,
        }}
      >
        {footer}
      </div>
    </div>,
    { ...size, headers: { "Cache-Control": "public, max-age=86400" } },
  );
}

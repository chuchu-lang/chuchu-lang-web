import { ImageResponse } from "next/og";
import { ogFonts, OgCard, ogImageSize } from "@/lib/og";

export const alt =
  "Chuchu downloads: install the Cheeku compiler and set up the VS Code extension.";
export const size = ogImageSize;
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <OgCard
        eyebrow="DOWNLOADS"
        title={["The language.", "The tools to write it."]}
        description="Install Cheeku for Windows, macOS or Linux. Write Chuchu in VS Code."
        pills={["Cheeku", "VS Code", "Open source"]}
      />
    ),
    {
      ...size,
      fonts: ogFonts,
    },
  );
}

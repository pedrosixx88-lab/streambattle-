import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "StreamBattle Overlay",
  description: "OBS Browser Source overlay",
};

/**
 * Overlay layout — transparent background for OBS Browser Source.
 * Overrides the root layout body styles.
 */
export default function OverlayLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <style>{`
        html, body {
          background: transparent !important;
          overflow: hidden !important;
        }
      `}</style>
      {children}
    </>
  );
}

/** Decorative background shared by the blog routes (matches the other pages). */
export default function BlogAmbient() {
  return (
    <div className="ambient" aria-hidden="true">
      <div className="gridpaper" />
      <div
        className="orb"
        style={{ left: "58%", top: 40, width: 520, height: 520, background: "#10B23F", opacity: 0.26 }}
      />
      <div
        className="orb"
        style={{ left: "-6%", top: 300, width: 420, height: 420, background: "#FAD705", opacity: 0.3 }}
      />
      <div
        className="orb"
        style={{ left: "38%", top: 520, width: 440, height: 440, background: "#FD8AB9", opacity: 0.24 }}
      />
    </div>
  );
}

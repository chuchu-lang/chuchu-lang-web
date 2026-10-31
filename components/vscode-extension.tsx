import Image from "next/image";
import { site } from "@/lib/site";

const FEATURES = [
  {
    title: "Write with a little help",
    text: "Syntax highlighting, snippets, completions, hover documentation and function signatures for your .chuchu files.",
  },
  {
    title: "Follow the names",
    text: "Jump to definitions, find references and explore the outline. Navigation understands local scope and shadowed variables.",
  },
  {
    title: "Build without leaving the editor",
    text: "Compile normal or debug programs with your local Cheeku binary, and see compiler errors in the Problems panel.",
  },
];

export default function VSCodeExtension({ number }: { number: string }) {
  return (
    <section id="vscode" className="wrap about-section vscode-section" aria-labelledby="vscode-title">
      <p className="eyebrow"><b />{number} &middot; CHUCHU IN YOUR EDITOR</p>
      <h2 id="vscode-title" className="h2 about-h2">A home in VS Code.</h2>
      <p className="lede">
        Write, explore and build Chuchu with the Chuchu Language extension.
        Editing features work on their own. Connect Cheeku when you are ready
        to compile.
      </p>
      <div className="bento">
        <article className="glass card b5 about-card vscode-install">
          <div className="vscode-identity">
            <Image src="/chuchu-vscode-logo.jpg" alt="" width={80} height={80} className="vscode-logo" />
            <div>
              <p className="feature-label">CHUCHU LANGUAGE</p>
              <h3 className="about-card-title">Made for .chuchu</h3>
            </div>
          </div>
          <p className="feature-text">
            Build the extension from its GitHub repository, then install the
            VSIX in VS Code. Requires VS Code 1.96 or newer.
          </p>
          <div className="about-actions">
            <a className="btn btn-primary" href={site.links.vscodeGuide}>
              Set up VS Code <span className="arr" aria-hidden="true">&rarr;</span>
            </a>
            <a className="btn btn-glass" href={site.links.vscodeSource}>Extension source</a>
          </div>
          <p className="vscode-note">
            Already built Cheeku locally? Point <code>chuchu.compilerPath</code>
            {" "}at that executable. A published compiler release is not required.
          </p>
        </article>
        <article className="glass card b7 about-card">
          <p className="feature-label">FROM THE FIRST LINE TO THE NEXT BUILD</p>
          <ul className="vscode-features">
            {FEATURES.map((feature) => (
              <li key={feature.title}>
                <h3 className="about-card-title">{feature.title}</h3>
                <p className="feature-text">{feature.text}</p>
              </li>
            ))}
          </ul>
          <p className="vscode-note">
            Lexical and delimiter diagnostics appear as you type. Build with
            Cheeku for full syntax and type checking. Native debugging uses a
            separate debugger extension.
          </p>
        </article>
      </div>
    </section>
  );
}

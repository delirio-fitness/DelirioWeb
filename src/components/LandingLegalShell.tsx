import type { ReactNode } from "react";
import { LandingFooter } from "./landing/LandingFooter";
import { LandingHeader } from "./landing/LandingHeader";

export function LandingLegalShell({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="d3-page d3-legal-page">
      <LandingHeader sectionPrefix="/" />
      <main id="main-content" className="d3-legal">
        <div className="d3-legal-container">
          {children}
        </div>
      </main>
      <LandingFooter />
    </div>
  );
}

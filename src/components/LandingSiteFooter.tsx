import { Link } from "react-router-dom";
import { Logo } from "./logo";
import InstaIcon from "../imports/InstaIcon";
import TikTokIcon from "../imports/TikTokIcon";
import XIcon from "../imports/XIcon";

const TESTFLIGHT_DOWNLOAD_URL = import.meta.env.VITE_TESTFLIGHT_URL || "https://testflight.apple.com/";

export function LandingSiteFooter() {
  return (
    <footer id="footer" className="landing-footer">
      <div className="landing-container landing-footer-panel">
        <div className="landing-footer-top">
          <div className="landing-footer-brand-block">
            <div className="landing-footer-brand">
              <Logo color="white" width="34" height="46" />
            </div>
            <p className="landing-footer-tagline">Training alone is over.</p>
            <div className="landing-footer-socials">
              <a href="https://x.com/Delirio1_" target="_blank" rel="noreferrer" aria-label="X">
                <XIcon color="white" />
              </a>
              <a href="https://www.instagram.com/delirio__official/" target="_blank" rel="noreferrer" aria-label="Instagram">
                <InstaIcon color="white" />
              </a>
              <a href="https://www.tiktok.com/@delirio__official" target="_blank" rel="noreferrer" aria-label="TikTok">
                <TikTokIcon color="white" />
              </a>
            </div>
          </div>

          <div className="landing-footer-contact">
            <h2>Contact</h2>
            <a href="mailto:contact@delirio.fit">contact@delirio.fit</a>
            <a href={TESTFLIGHT_DOWNLOAD_URL} target="_blank" rel="noreferrer">
              Join the TestFlight beta
            </a>
          </div>
        </div>

        <div className="landing-footer-divider" />

        <div className="landing-footer-bottom">
          <p>&copy; 2026 Delirio</p>
          <div className="landing-footer-legal">
            <Link to="/support">Support</Link>
            <Link to="/terms-of-service">Terms of Service</Link>
            <Link to="/privacy-policy">Privacy Policy</Link>
            <Link to="/data-deletion">Data Deletion</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

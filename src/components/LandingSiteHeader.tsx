import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { SmartBanner } from "smartbanner-tsx";
import { Logo } from "./logo";
import irisDefault from "../images/emojis/Iris/Iris_idle_return.png";
import reedDefault from "../images/emojis/Reed/Reed_idle_return.png";
import "smartbanner-tsx/dist/style.css";


//APP TESTFLIGHT DOWNLOAD HYPER LINK HERE : START
const TESTFLIGHT_DOWNLOAD_URL = "https://testflight.apple.com/join/sG9UyYY1";
//APP TESTFLIGHT DOWNLOAD HYPER LINK HERE : END


const SMART_BANNER_META = {
  ios: "delirio-smart-banner-ios-app",
  android: "delirio-smart-banner-android-app",
};
const SMART_BANNER_APP_ID = "delirio-testflight-beta";

function clearSmartBannerCookies() {
  document.cookie = "smartbanner-closed=; Max-Age=0; path=/";
  document.cookie = "smartbanner-installed=; Max-Age=0; path=/";
}

function ensureSmartBannerMetaTag() {
  const existingMeta = document.querySelector(`meta[name="${SMART_BANNER_META.ios}"]`);

  if (existingMeta) {
    existingMeta.setAttribute("content", `app-id=${SMART_BANNER_APP_ID}`);
    return;
  }

  const meta = document.createElement("meta");
  meta.name = SMART_BANNER_META.ios;
  meta.content = `app-id=${SMART_BANNER_APP_ID}`;
  document.head.append(meta);
}

interface LandingSiteHeaderProps {
  isScrolled?: boolean;
  isStripVisible?: boolean;
  showDownloadStrip?: boolean;
  onFeaturesClick: () => void;
  onPersonalitiesClick: () => void;
  onTestFlightClick: () => void;
  downloadUrl?: string;
}

export function LandingSiteHeader({
  isScrolled = false,
  isStripVisible,
  showDownloadStrip = true,
  onFeaturesClick,
  onPersonalitiesClick,
  onTestFlightClick,
  downloadUrl = TESTFLIGHT_DOWNLOAD_URL,
}: LandingSiteHeaderProps) {
  const shouldShowStrip = isStripVisible ?? isScrolled;
  const [isSmartBannerReady, setIsSmartBannerReady] = useState(false);
  const smartBannerUrls = {
    ios: downloadUrl,
    android: downloadUrl,
  };

  useEffect(() => {
    ensureSmartBannerMetaTag();
    clearSmartBannerCookies();
    setIsSmartBannerReady(true);
  }, []);

  return (
    <>
      <header className={`landing-header ${isScrolled ? "landing-header--scrolled" : ""}`}>
        <div className="landing-container landing-header-inner">
          <Link className="landing-header-brand" to="/" aria-label="Delirio home">
            <Logo width="30" height="40" />
          </Link>

          <nav className="landing-header-nav" aria-label="Primary">
            <button type="button" onClick={onFeaturesClick}>
              Personal Trainers
            </button>
            <button type="button" className="landing-header-nav-item--with-icon" onClick={onPersonalitiesClick}>
              <img src={irisDefault} alt="" aria-hidden="true" loading="eager" fetchPriority="high" decoding="async" />
              <span>Realtime-Feedback</span>
              <img src={reedDefault} alt="" aria-hidden="true" loading="eager" fetchPriority="high" decoding="async" />
            </button>
            <button type="button" onClick={onTestFlightClick}>
              TestFlight
            </button>
          </nav>

          <div className="landing-header-spacer" aria-hidden="true" />
        </div>
      </header>
      {showDownloadStrip ? (
        <div
          className={`landing-header-download-strip ${shouldShowStrip ? "is-visible" : ""}`}
          role="region"
          aria-label="TestFlight beta download"
        >
          <div className="landing-container landing-header-download-inner">
            {isSmartBannerReady ? (
              <SmartBanner
                title="Delirio"
                author="Ready to download on TestFlight"
                translations={{
                  button: "Download",
                  price_ios: "Beta access",
                  store_ios: "TestFlight",
                }}
                meta={SMART_BANNER_META}
                url={smartBannerUrls}
                force="ios"
                placement="bottom"
                withPortal={false}
                disableHtmlMargin
                ignoreIosVersion
                daysHidden={0}
                daysReminder={0}
                onClose={clearSmartBannerCookies}
                onInstall={clearSmartBannerCookies}
                className="landing-testflight-smartbanner"
              />
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}

import { useEffect } from "react";
import { Link } from "react-router-dom";
import { LandingLegalShell } from "./LandingLegalShell";

export default function Support() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <LandingLegalShell>
      <div id="support" className="max-w-3xl mx-auto px-6 py-10 md:py-16">
        <h1 className="text-4xl font-bold mb-8">Support</h1>
        <p className="mb-4">
          Need help with Delirio? Email us at{" "}
          <a href="mailto:contact@delirio.fit?subject=Delirio%20Support" className="text-blue-600 underline">
            contact@delirio.fit
          </a>{" "}
          and we will get back to you within 2 business days. Please include the email address on your account and, if
          you are reporting a problem, the device and iOS version you are using.
        </p>

        <h2 className="text-2xl font-semibold mb-4 mt-8">Managing Your Subscription</h2>
        <p className="mb-4">
          Delirio Plus subscriptions are billed through your Apple Account. To view, change, or cancel your
          subscription, open <strong>Settings &rarr; Apple Account &rarr; Subscriptions</strong> on your device, or use
          the Manage Subscription option inside the app. Cancellation takes effect at the end of the current billing
          period. Deleting the app does not cancel your subscription.
        </p>
        <p className="mb-4">
          Refunds are handled by Apple, not by Delirio. You can request one at{" "}
          <a href="https://reportaproblem.apple.com" className="text-blue-600 underline">
            reportaproblem.apple.com
          </a>
          .
        </p>

        <h2 className="text-2xl font-semibold mb-4 mt-8">Your Account and Data</h2>
        <p className="mb-4">
          You can permanently delete your account and all associated data in the app under{" "}
          <strong>Settings &rarr; Account &amp; Profile &rarr; Delete Account</strong>. If you cannot access the app,
          see our <Link to="/data-deletion" className="text-blue-600 underline">Data Deletion</Link> page.
        </p>

        <h2 className="text-2xl font-semibold mb-4 mt-8">Legal</h2>
        <p className="mb-4">
          <Link to="/terms-of-service" className="text-blue-600 underline">
            Terms of Service
          </Link>{" "}
          &middot;{" "}
          <Link to="/privacy-policy" className="text-blue-600 underline">
            Privacy Policy
          </Link>
        </p>

        <hr className="my-8 border-gray-300" />
        <p className="text-gray-500 text-sm">Delirio is based in Boston, Massachusetts, United States.</p>
      </div>
    </LandingLegalShell>
  );
}

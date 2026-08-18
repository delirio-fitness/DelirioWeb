import { useEffect } from "react";
import { LandingLegalShell } from "./LandingLegalShell";

export default function DataDeletion() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <LandingLegalShell>
      <div id="data-deletion" className="max-w-3xl mx-auto px-6 py-10 md:py-16">
        <h1 className="text-4xl font-bold mb-8">Data Deletion</h1>
        <p className="mb-4">
          To request deletion of your data, email{" "}
          <a href="mailto:contact@delirio.fit?subject=Data%20Deletion%20Request" className="text-blue-600 underline">
            contact@delirio.fit
          </a>{" "}
          with subject &ldquo;Data Deletion Request&rdquo;. We will confirm receipt within 7 days and complete deletion
          within 30 days.
        </p>

        <h2 className="text-2xl font-semibold mb-4 mt-8">App accounts</h2>
        <p className="mb-4">
          If you have a Delirio account, you can delete it and all associated data yourself, at any time, in the app
          under <strong>Settings → Account &amp; Profile → Delete Account</strong>. You do not need to email us.
        </p>

        <h2 className="text-2xl font-semibold mb-4 mt-8">This website</h2>
        <p className="mb-4">
          <strong>The website collects nothing from you.</strong> delirio.fit has no form, no email box, and no
          questionnaire — it describes the app and links to the App Store, so nothing new is recorded about you here.
          If you joined the waitlist while it existed, we may still hold the record it created; email the address above
          and we will delete it, answers and email address together.
        </p>
        <p className="mb-4">
          What the website still reports to our advertising measurement — and how to ask us to stop — is described in
          the <a href="/privacy-policy" className="text-blue-600 underline">Privacy Policy</a> under{" "}
          <strong>Advertising, Attribution, and Tracking</strong>.
        </p>
      </div>
    </LandingLegalShell>
  );
}

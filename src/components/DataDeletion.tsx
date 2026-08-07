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

        <h2 className="text-2xl font-semibold mb-4 mt-8">Website waitlist</h2>
        <p className="mb-4">
          Joining the waitlist on this website creates a single record holding the email address you gave us{" "}
          <strong>together with the answers you gave the waitlist questions</strong>. Email the address above and we
          will delete that whole record — the email and the answers go together. You do not need to explain why, and we
          will confirm when it is done.
        </p>
        <p className="mb-4">
          This also takes you off the waitlist, so we will not email you when spots open. If you only want to stop the
          emails and would rather we keep your answers, say so and we will do that instead.
        </p>
        <p className="mb-4">
          <strong>One case we cannot help with.</strong> If you answered the waitlist questions but closed the page
          before entering your email, the record we kept has no name, email address, or anything else you could
          identify yourself with — only a random identifier generated in your browser, which we have no way to connect
          to you. We cannot find that record to delete it, and we would rather say so than promise otherwise. It
          contains your answers and nothing that points back to you.
        </p>
      </div>
    </LandingLegalShell>
  );
}

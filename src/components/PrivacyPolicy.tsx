import { useEffect } from "react";
import { LandingLegalShell } from "./LandingLegalShell";

export default function PrivacyPolicy() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <LandingLegalShell>
      <div className="max-w-3xl mx-auto px-6 py-10 md:py-16 min-h-screen bg-white text-black">
        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
        <p className="mb-2 text-sm text-gray-500">Last updated: August 18, 2026</p>
        <p className="mb-4">
          Delirio (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) provides an AI-powered fitness coaching
          mobile application. This Privacy Policy explains what information we collect, how we use and share it, and the
          choices and rights you have. By using the app, you agree to the practices described here.
        </p>

        <h2 className="text-2xl font-semibold mb-4 mt-8">Information We Collect</h2>

        <h3 className="text-xl font-semibold mb-2 mt-6">Account and Profile Information</h3>
        <p className="mb-4">When you create an account and complete onboarding, we collect:</p>
        <ul className="mb-4 list-disc pl-6">
          <li>Name</li>
          <li>Email address</li>
          <li>Phone number</li>
          <li>Date of birth</li>
          <li>Gender</li>
          <li>Height, weight, and other body metrics</li>
          <li>
            Fitness goals, experience level, training preferences, available equipment, injuries, dietary preferences,
            and sleep information you provide
          </li>
        </ul>
        <p className="mb-4">
          You can sign in using Apple, Google, email and password, or your phone number. We use your phone number to
          deliver coaching messages over SMS or WhatsApp when you choose those channels. We will not share, sell, or
          rent your mobile phone number or your SMS/WhatsApp opt-in data to third parties for marketing purposes.
        </p>

        <h3 className="text-xl font-semibold mb-2 mt-6">Our Website</h3>
        <p className="mb-4">
          <strong>delirio.fit asks you for nothing.</strong> There is no form, no email box, and no questionnaire on
          the site &mdash; it describes the app and links to the App Store. We do not collect your name, email address,
          phone number, or any answers about you from this website. What the website does record is described under{' '}
          <strong>Advertising, Attribution, and Tracking</strong> below: that a page was viewed, that a download link
          was chosen, and how people move around the page.
        </p>
        <p className="mb-4">
          This website previously ran a waitlist that asked for an email address and six questions. It has been
          removed. If you joined it, see <strong>Data Retention</strong> and{' '}
          <a href="/data-deletion" className="text-blue-600 underline">Data Deletion</a> for what we may still hold and
          how to have it erased.
        </p>

        <h3 className="text-xl font-semibold mb-2 mt-6">Health and Fitness Data</h3>
        <p className="mb-4">
          With your permission, Delirio reads data from Apple Health to personalize your coaching &mdash; for example
          activity (steps, distance, energy, exercise minutes), heart rate and heart-rate variability, sleep, nutrition,
          and body measurements. We may also write your workout results back to Apple Health so your records stay in
          sync.
        </p>
        <p className="mb-4">
          We also collect the workout and activity data you record in Delirio, such as sets, reps, weights, effort,
          duration, calories, form scores, streaks, and personal records, as well as health-related details you share
          with your coach (for example injuries or medication information relevant to your training).
        </p>

        <h3 className="text-xl font-semibold mb-2 mt-6">Camera and Workout Form Analysis</h3>
        <p className="mb-4">
          During a workout, if you have enabled AI form feedback, Delirio captures short video segments (roughly five
          seconds each) from your device camera and sends them to our cloud-based AI form-analysis service to generate
          real-time feedback on your technique. We also record body-position (&ldquo;pose&rdquo;) data derived from the
          camera during your sets and store it on our servers to power that feedback and keep a record of your workout.
        </p>
        <p className="mb-4">
          Some processing, including 3D body-position detection, runs on your device; the video segments and pose data
          described above are processed and stored in the cloud. This feature is off until you consent to it, and you
          can turn it off at any time (see <strong>AI Features and Your Consent</strong> below).
        </p>

        <h3 className="text-xl font-semibold mb-2 mt-6">Voice and Audio</h3>
        <p className="mb-4">
          When you use voice coaching, your microphone audio is streamed in real time to our AI voice service so your
          coach can understand you and respond by voice.
        </p>

        <h3 className="text-xl font-semibold mb-2 mt-6">Conversations With Your AI Coach</h3>
        <p className="mb-4">When you interact with our AI coaches by text, SMS, WhatsApp, or voice, we store:</p>
        <ul className="mb-4 list-disc pl-6">
          <li>Your recent messages</li>
          <li>AI-generated summaries of your conversations</li>
          <li>Memories about your preferences and goals, generated from your conversations</li>
          <li>Your responses to scheduled check-ins</li>
        </ul>
        <p className="mb-4">
          This lets your coach remember your context and provide personalized guidance across sessions. Conversations
          are processed by our cloud AI services to generate responses.
        </p>

        <h3 className="text-xl font-semibold mb-2 mt-6">Photos</h3>
        <p className="mb-4">
          If you add a profile photo or progress photos, those images are stored on our servers so they are available
          across your sessions. You choose whether to add them.
        </p>

        <h3 className="text-xl font-semibold mb-2 mt-6">Location</h3>
        <p className="mb-4">
          If you use outdoor activity tracking (for example running, walking, or biking), Delirio collects your precise
          location &mdash; including in the background while an activity is in progress &mdash; to record your route,
          distance, pace, and elevation. This data is stored with that activity. You control location access in your
          device settings; without it, outdoor route tracking will not work.
        </p>

        <h3 className="text-xl font-semibold mb-2 mt-6">Purchases and Subscriptions</h3>
        <p className="mb-4">
          If you subscribe through Apple&rsquo;s App Store, we receive information about your subscription, such as its
          status, plan, and a transaction or account identifier supplied by Apple. Apple processes your payment details;
          we do not receive or store your full payment card number.
        </p>

        <h3 className="text-xl font-semibold mb-2 mt-6">Usage, Analytics, and Diagnostics</h3>
        <p className="mb-4">
          We collect information about how you use the app, a user identifier, and crash and performance diagnostics to
          operate, secure, and improve Delirio.
        </p>

        <h3 className="text-xl font-semibold mb-2 mt-6">Advertising and Attribution</h3>
        <p className="mb-4">
          To measure how our advertising performs and, with your permission, to show you more relevant ads, the app
          shares a limited set of advertising and attribution data with Meta Platforms, Inc. through the Meta software
          development kit (SDK):
        </p>
        <ul className="mb-4 list-disc pl-6">
          <li>
            <strong>Identifiers.</strong> The Advertising Identifier (IDFA), only if you grant tracking permission; a
            device-scoped identifier; and an anonymous install identifier.
          </li>
          <li>
            <strong>Device and technical data.</strong> Device model, operating system version, app version, language
            and region, time zone, network or carrier, and screen attributes.
          </li>
          <li>
            <strong>App activity.</strong> App installs, launches, and sessions.
          </li>
          <li>
            <strong>Purchase events.</strong> Purchases, subscriptions, and free-trial starts, including the amount and
            currency.
          </li>
        </ul>
        <p className="mb-4">
          We do not share your health, workout, voice, camera, photo, conversation, or profile information with Meta.
          See <strong>Advertising, Attribution, and Tracking</strong> below for how this works and the choices you have.
        </p>

        <h2 className="text-2xl font-semibold mb-4 mt-8">How We Use Your Information</h2>
        <p className="mb-4">We use your information to:</p>
        <ul className="mb-4 list-disc pl-6">
          <li>Provide personalized fitness coaching and real-time form feedback</li>
          <li>Track your workouts, activities, and progress over time</li>
          <li>Enable our AI coaches to remember your preferences and goals</li>
          <li>Communicate with you about your fitness journey and account</li>
          <li>Process your subscription and payments</li>
          <li>Secure the app, prevent abuse, and diagnose problems</li>
          <li>Improve our app and services</li>
          <li>Review product feedback you submit</li>
          <li>Measure how our advertising performs and, with your permission, show you more relevant ads</li>
        </ul>

        <h2 className="text-2xl font-semibold mb-4 mt-8">AI Features and Your Consent</h2>
        <p className="mb-4">
          Delirio&rsquo;s real-time voice coaching and camera-based form feedback rely on third-party AI services. This
          means some of your data &mdash; your voice during coaching sessions, and short video segments and pose data
          during workouts &mdash; is sent to those services to make these features work. Before these features are first
          used, we ask for your consent.
        </p>
        <p className="mb-4">We currently use the following AI providers:</p>
        <ul className="mb-4 list-disc pl-6">
          <li>
            <strong>ElevenLabs</strong> &mdash; receives your microphone audio during voice coaching, to understand what
            you say and to generate your coach&rsquo;s voice.
          </li>
          <li>
            <strong>OpenAI</strong> &mdash; receives your conversations with your coach, in both voice and text, to
            generate your coach&rsquo;s responses.
          </li>
          <li>
            <strong>Google (Gemini)</strong> &mdash; receives short clips of your workout video, as the vision step
            inside our own form-analysis pipeline, which turns the result into your coach&rsquo;s feedback.
          </li>
        </ul>
        <p className="mb-4">
          These providers process your data on our behalf to deliver the features described above. If we change AI
          providers, we will update this policy and the in-app disclosure before the change takes effect.
        </p>
        <p className="mb-4">
          You can review what is shared and withdraw or re-grant your consent at any time in the app under{" "}
          <strong>Settings → Data &amp; AI</strong>. Withdrawing consent turns off camera form feedback.
        </p>

        <h2 className="text-2xl font-semibold mb-4 mt-8">How We Share Your Information</h2>
        <p className="mb-4">
          We share personal information with service providers who process it on our behalf to operate the app and
          deliver its features. These providers are permitted to use your information only to provide services to us. We
          also share a limited set of advertising and attribution data with Meta Platforms, Inc., which may use it for
          its own purposes, as described under <strong>Advertising, Attribution, and Tracking</strong> below. Aside from
          that advertising sharing, we do not sell your personal information. We share information with the following
          categories of recipients:
        </p>
        <ul className="mb-4 list-disc pl-6">
          <li>
            <strong>Cloud infrastructure and storage</strong> for authentication, database, and file storage
          </li>
          <li>
            <strong>AI service providers</strong> for voice conversations, camera form analysis, and text coaching
            (named individually under <strong>AI Features and Your Consent</strong> above)
          </li>
          <li>
            <strong>Analytics and diagnostics providers</strong> to understand usage and diagnose crashes and
            performance
          </li>
          <li>
            <strong>Apple&rsquo;s App Store</strong> for subscriptions and billing
          </li>
          <li>
            <strong>Messaging providers</strong> for SMS and WhatsApp communication
          </li>
          <li>
            <strong>Meta Platforms, Inc.</strong> for advertising attribution and measurement and, with your
            permission, ad personalization (see <strong>Advertising, Attribution, and Tracking</strong> below)
          </li>
        </ul>
        <p className="mb-4">
          We may also disclose information if required by law, to protect our rights or the safety of others, or in
          connection with a business transfer.
        </p>

        <h2 className="text-2xl font-semibold mb-4 mt-8">Advertising, Attribution, and Tracking</h2>
        <p className="mb-4">
          We run ads to promote Delirio, and we work with Meta Platforms, Inc. to measure how those ads perform and,
          with your permission, to show you more relevant ads. To do this, the app includes Meta&rsquo;s software
          development kit (SDK), which reports advertising and attribution events to Meta. The categories of data
          involved are listed under <strong>Advertising and Attribution</strong> above.
        </p>
        <p className="mb-4">
          <strong>This website.</strong> Separately from the app, we measure how our ads perform on delirio.fit.{' '}
          <strong>There is no Meta pixel or other advertising script on this site.</strong> No advertising
          company&rsquo;s code runs in your browser here, and no advertising company can see the pages you visit, what
          those pages say, or what you type into them.
        </p>
        <p className="mb-4">
          Instead, two actions are reported from our own servers: arriving on the home page, and choosing a link that
          takes you to the App Store. What we send is the name of that action, the campaign parameters in the link you
          arrived from, which version of the page you saw, your IP address, and your browser&rsquo;s user-agent string.
          That is the complete list. <strong>We do not send Meta your email address in any form</strong>, hashed or
          otherwise &mdash; the website never asks you for one. We also do not send the page you were on, its title, or
          where you came from. Only the home page is reported this way &mdash; visiting this policy, or any other page
          here, sends nothing.
        </p>
        <p className="mb-4">
          <strong>Analytics on this website.</strong> We use Microsoft Clarity to understand how people use delirio.fit
          &mdash; which parts of a page are read, where people get stuck, and where they leave. Clarity records how you
          move through the page, and Microsoft processes that recording for us and may use it in accordance with its own
          policies. This is separate from advertising: Clarity data is not sent to Meta and is not used to target ads to
          you. Because the site has no form or text box anywhere, there is nothing you can type here for it to record.
          You can read Microsoft&rsquo;s privacy statement at{' '}
          <a href="https://privacy.microsoft.com/privacystatement" className="text-blue-600 underline">
            https://privacy.microsoft.com/privacystatement
          </a>
          .
        </p>
        <p className="mb-4">
          Your browser tells our own server that the action happened, and our server is what contacts Meta. Because that
          first request goes to delirio.fit and not to an advertising domain, some blockers will not recognize it,
          though tracking protection and content blockers can still refuse it. You can manage ad personalization through
          Meta&rsquo;s ad-preference tools, and if you would rather we report nothing at all, email us at{' '}
          <a href="mailto:contact@delirio.fit" className="text-blue-600 underline">contact@delirio.fit</a> and we will
          honor that.
        </p>
        <p className="mb-4">
          <strong>App Tracking Transparency.</strong> Before any tracking occurs, iOS asks for your permission through
          the App Tracking Transparency prompt. If you allow tracking, the Advertising Identifier is used to measure ad
          performance and to help show you more relevant ads. If you decline, the app relies only on privacy-preserving
          attribution and does not use the Advertising Identifier. Where consent is the legal basis for this tracking,
          you provide it through that prompt and can withdraw it at any time. You can change your choice in iOS Settings
          under Privacy &amp; Security, then Tracking.
        </p>
        <p className="mb-4">
          <strong>Privacy-preserving attribution.</strong> Whether or not you allow tracking, we use Apple&rsquo;s
          SKAdNetwork and Meta&rsquo;s Aggregated Event Measurement to attribute installs and purchases in aggregate,
          without identifying you individually.
        </p>
        <p className="mb-4">
          <strong>Your choices.</strong> You can decline or turn off tracking at any time in iOS Settings under Privacy
          &amp; Security, then Tracking (or by enabling Limit Ad Tracking). You can also manage ad personalization and
          off-Meta activity through Meta&rsquo;s ad-preference tools. On this website, you can email us at{' '}
          <a href="mailto:contact@delirio.fit" className="text-blue-600 underline">contact@delirio.fit</a> and ask us to
          stop reporting your activity to Meta; we will honor that going
          forward, though we cannot recall something already sent. For your right to opt out of this sharing under
          California and similar U.S. state laws, see <strong>Do Not Sell or Share My Personal Information</strong>{" "}
          below.
        </p>
        <p className="mb-4">
          Meta processes this data in the United States and may use it in accordance with its own policies. See
          Meta&rsquo;s Privacy Policy at{" "}
          <a href="https://www.facebook.com/privacy/policy" className="text-blue-600 underline">
            https://www.facebook.com/privacy/policy
          </a>
          .
        </p>

        <h2 className="text-2xl font-semibold mb-4 mt-8">Do Not Sell or Share My Personal Information</h2>
        <p className="mb-4">
          We do not sell your personal information for money. Under some U.S. state privacy laws, including the
          California Consumer Privacy Act as amended by the California Privacy Rights Act (CPRA), our sharing of
          advertising identifiers and app-activity data with Meta for advertising attribution and, with your
          permission, ad personalization may be treated as a &ldquo;sale&rdquo; or &ldquo;sharing&rdquo; of personal
          information for cross-context behavioral advertising. The categories involved are the identifiers and
          app-activity data described under <strong>Advertising and Attribution</strong> above, together with the two
          website actions described under <strong>Advertising, Attribution, and Tracking</strong> above. We do not share
          your health, workout, voice, camera, photo, conversation, or profile information for advertising, and we do
          not share your email address with anyone for advertising &mdash; the website does not ask for one.
        </p>
        <p className="mb-4">You have the right to opt out of this sale or sharing. To opt out:</p>
        <ul className="mb-4 list-disc pl-6">
          <li>
            Decline the App Tracking Transparency prompt, or turn tracking off in iOS Settings under Privacy &amp;
            Security, then Tracking (or enable Limit Ad Tracking). This stops the Advertising Identifier from being
            shared and limits advertising tracking.
          </li>
          <li>Manage ad personalization and your off-Meta activity through Meta&rsquo;s ad-preference tools.</li>
          <li>
            For this website, email us at{' '}
            <a href="mailto:contact@delirio.fit" className="text-blue-600 underline">contact@delirio.fit</a> and ask us
            to stop reporting your activity to Meta. We will honor that going forward.
          </li>
        </ul>
        <p className="mb-4">
          Even after you opt out, we may continue to use Apple&rsquo;s SKAdNetwork and Meta&rsquo;s Aggregated Event
          Measurement, which measure advertising in aggregate and do not identify you individually. We do not knowingly
          sell or share the personal information of anyone under 16 years of age. To exercise this right or ask
          questions, contact us at{" "}
          <a href="mailto:contact@delirio.fit" className="text-blue-600 underline">
            contact@delirio.fit
          </a>
          .
        </p>

        <h2 className="text-2xl font-semibold mb-4 mt-8">On-Device and Cloud Processing</h2>
        <p className="mb-4">
          Some processing happens on your device, and some happens in the cloud. Data read from Apple Health is
          processed on your device and cached locally to personalize your experience; we do not upload your Apple Health
          data to our servers. Your camera video segments and derived pose data, your voice during coaching, your
          conversations, and the workout, activity, photo, and profile data you record are processed and stored on our
          cloud servers as described above.
        </p>

        <h2 className="text-2xl font-semibold mb-4 mt-8">Data Retention</h2>
        <p className="mb-4">
          <strong>App accounts.</strong> We retain your personal information for as long as your account is active and
          as needed to provide the app. You can delete your account and associated data at any time, as described below.
        </p>
        <p className="mb-4">
          <strong>Our website.</strong> The site collects nothing from you, so there is nothing new to retain. If you
          joined the waitlist during the period it existed, we may still hold the record it created; you can have it
          deleted at any time by emailing us, and you do not need to give a reason.
        </p>

        <h2 className="text-2xl font-semibold mb-4 mt-8">Deleting Your Account</h2>
        <p className="mb-4">You can permanently delete your account and all associated data directly in the app:</p>
        <p className="mb-4">
          <strong>Settings → Account &amp; Profile → Delete Account</strong>
        </p>
        <p className="mb-4">
          Deleting your account is permanent. It removes your profile, workout and activity history, conversations,
          photos, and other data associated with your account from our systems, and we direct our service providers to
          delete it as well. This cannot be undone. For your security, you may be asked to sign in again before deletion
          completes.
        </p>
        <p className="mb-4">
          If you cannot access the app, you can also request deletion by emailing us at{" "}
          <a href="mailto:contact@delirio.fit" className="text-blue-600 underline">
            contact@delirio.fit
          </a>
          . We may need to verify your identity before completing the request.
        </p>

        <h2 className="text-2xl font-semibold mb-4 mt-8">Data Security</h2>
        <p className="mb-4">
          We implement appropriate technical and organizational measures to protect your personal information. However,
          no method of electronic transmission or storage is completely secure, and we cannot guarantee absolute
          security.
        </p>

        <h2 className="text-2xl font-semibold mb-4 mt-8">Children&rsquo;s Privacy</h2>
        <p className="mb-4">
          Delirio is not intended for users under 16 years of age. We do not knowingly collect personal information from
          children under 16. If you are a parent or guardian and believe your child has provided us with personal
          information, please contact us.
        </p>

        <h2 className="text-2xl font-semibold mb-4 mt-8">Your Rights and Choices</h2>
        <p className="mb-4">Depending on where you live, you may have the right to:</p>
        <ul className="mb-4 list-disc pl-6">
          <li>Access the personal information we hold about you</li>
          <li>Request correction of inaccurate information</li>
          <li>Delete your account and data</li>
          <li>Withdraw consent for AI features that share your data (in Settings → Data &amp; AI)</li>
          <li>
            Opt out of tracking and advertising sharing (iOS Settings → Privacy &amp; Security → Tracking, plus
            Meta&rsquo;s ad-preference tools), as described under Advertising, Attribution, and Tracking
          </li>
          <li>Control camera, microphone, location, health, and photo permissions in your device settings</li>
          <li>Ask questions about our data practices</li>
        </ul>
        <p className="mb-4">
          To exercise these rights, contact us at{" "}
          <a href="mailto:contact@delirio.fit" className="text-blue-600 underline">
            contact@delirio.fit
          </a>
          .
        </p>

        <h2 className="text-2xl font-semibold mb-4 mt-8">Third-Party Links</h2>
        <p className="mb-4">
          Our app may contain links to third-party websites or services. We are not responsible for the privacy
          practices of these external sites.
        </p>

        <h2 className="text-2xl font-semibold mb-4 mt-8">Changes to This Policy</h2>
        <p className="mb-4">
          We may update this Privacy Policy from time to time. We will notify you of significant changes by posting the
          new policy in the app and updating the &ldquo;Last updated&rdquo; date above.
        </p>

        <h2 className="text-2xl font-semibold mb-4 mt-8">Contact Us</h2>
        <p className="mb-4">If you have questions about this Privacy Policy or our data practices, please contact us at:</p>
        <p className="mb-4">
          <strong>Email:</strong>{" "}
          <a href="mailto:contact@delirio.fit" className="text-blue-600 underline">
            contact@delirio.fit
          </a>
        </p>

        <hr className="my-8 border-gray-300" />
        <p className="text-gray-500 text-sm">Delirio is based in Boston, Massachusetts, United States.</p>
      </div>
    </LandingLegalShell>
  );
}

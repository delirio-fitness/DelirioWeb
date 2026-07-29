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
        <p className="mb-2 text-sm text-gray-500">Last updated: July 28, 2026</p>
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

        <h3 className="text-xl font-semibold mb-2 mt-6">Website Feedback and Wishlist</h3>
        <p className="mb-4">
          If you submit our website feedback form, we collect your responses and a randomly generated identifier stored
          in your browser. This identifier helps us distinguish submissions from the same browser without asking for
          your name, email address, or phone number. Questionnaire responses may include optional information about
          whether a GLP-1 medication is or was part of your routine, where you are in that experience, and what most
          often disrupts your training. We use this information to tailor the remaining questions, evaluate product
          requests, and improve Delirio.
        </p>
        <p className="mb-4">
          If you join the Delirio wishlist, we collect the email address you submit and your explicit request to receive
          launch and product updates. We use it to send those updates and to understand where wishlist interest comes
          from. You can unsubscribe through any wishlist email. We do not sell your email address.
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
          operate, secure, and improve Delirio. Delirio does not track you across other companies&rsquo; apps or
          websites.
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
        </ul>

        <h2 className="text-2xl font-semibold mb-4 mt-8">AI Features and Your Consent</h2>
        <p className="mb-4">
          Delirio&rsquo;s real-time voice coaching and camera-based form feedback rely on third-party AI services. This
          means some of your data &mdash; your voice during coaching sessions, and short video segments and pose data
          during workouts &mdash; is sent to those services to make these features work. Before these features are first
          used, we ask for your consent.
        </p>
        <p className="mb-4">
          You can review what is shared and withdraw or re-grant your consent at any time in the app under{" "}
          <strong>Settings → Data &amp; AI</strong>. Withdrawing consent turns off camera form feedback.
        </p>

        <h2 className="text-2xl font-semibold mb-4 mt-8">How We Share Your Information</h2>
        <p className="mb-4">
          We do not sell your personal information. We share it with service providers who process it on our behalf to
          operate the app and deliver its features. These providers are permitted to use your information only to provide
          services to us. We use the following categories of providers:
        </p>
        <ul className="mb-4 list-disc pl-6">
          <li>
            <strong>Cloud infrastructure and storage</strong> for authentication, database, and file storage
          </li>
          <li>
            <strong>AI service providers</strong> for voice conversations, camera form analysis, and text coaching
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
        </ul>
        <p className="mb-4">
          We may also disclose information if required by law, to protect our rights or the safety of others, or in
          connection with a business transfer.
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
          We retain your personal information for as long as your account is active and as needed to provide the app. You
          can delete your account and associated data at any time, as described below.
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
          <a href="mailto:amir7alsad@gmail.com" className="text-blue-600 underline">
            amir7alsad@gmail.com
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
          <li>Control camera, microphone, location, health, and photo permissions in your device settings</li>
          <li>Ask questions about our data practices</li>
        </ul>
        <p className="mb-4">
          To exercise these rights, contact us at{" "}
          <a href="mailto:amir7alsad@gmail.com" className="text-blue-600 underline">
            amir7alsad@gmail.com
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
          <a href="mailto:amir7alsad@gmail.com" className="text-blue-600 underline">
            amir7alsad@gmail.com
          </a>
        </p>

        <hr className="my-8 border-gray-300" />
        <p className="text-gray-500 text-sm">Delirio is based in Boston, Massachusetts, United States.</p>
      </div>
    </LandingLegalShell>
  );
}

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
        <p className="mb-2 text-sm text-gray-500">Last updated: November 25, 2026</p>
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
          deliver your coach&rsquo;s messages when you text with your coach: by iMessage, through our messaging
          provider Blooio. We may use SMS, through Twilio, as a backup. We will not share, sell, or rent
          your mobile phone number or your texting opt-in data to third parties for marketing purposes.
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
          with your coach (for example injuries or medication information relevant to your training). What you write to
          your coach, and what your coach writes back, is also sent to our analytics provider, as described under{" "}
          <strong>Usage, Analytics, and Diagnostics</strong> below.
        </p>

        <h3 className="text-xl font-semibold mb-2 mt-6">Camera and Workout Form Analysis</h3>
        <p className="mb-4">
          Workouts start with the camera off. If you turn the camera on during a workout, Delirio first asks, once,
          whether you want your coach to use it for form feedback, and says that short clips of your workout video go
          to Google&rsquo;s Gemini. Only if you accept does the app capture short video segments (roughly five seconds
          each) from your device camera and send them to our form-analysis service, which uses Google&rsquo;s Gemini
          (through Google Cloud&rsquo;s Vertex AI) to read your technique and turn it into real-time feedback. You can
          turn the camera off again at any time with the camera button in the workout; segments are sent only while it
          is on.
        </p>
        <p className="mb-4">
          Our servers pass each segment to Google for the analysis and do not store it. What we keep is the result, such
          as your form score and the feedback, with your workout record. Your camera view is also never part of a
          screen recording (see <strong>Screen Recording</strong> below).
        </p>

        <h3 className="text-xl font-semibold mb-2 mt-6">Voice and Audio</h3>
        <p className="mb-4">
          When you use voice coaching, including a coach call (below), your microphone audio is streamed in real time
          to our voice service so your coach can understand you and respond by voice. The audio travels over Daily&rsquo;s
          real-time network, ElevenLabs turns what you say into text and generates your coach&rsquo;s voice, and
          OpenAI writes your coach&rsquo;s replies. We do not keep audio recordings of your sessions. We do keep a
          written transcript of what was said, like your text conversations, and a short-lived technical log of each
          session for debugging, which can contain what you said (see <strong>Data Retention</strong>).
        </p>

        <h3 className="text-xl font-semibold mb-2 mt-6">Coach Phone Calls</h3>
        <p className="mb-4">
          You can call your coach from the app, and your coach can call you: for example after a missed workout and an
          unanswered follow-up, usually between 9am and 8pm your time. A call from your coach arrives as a call-style
          notification from Apple&rsquo;s push service that rings your phone&rsquo;s call screen, even when the app is
          closed. To make this work, the app stores with your account a call-notification token from Apple, whether
          you have allowed the microphone, and the outcome of each ring (answered, missed, declined), alongside the
          notification record described under <strong>Notifications</strong>. A call is a voice conversation, handled as
          described under <strong>Voice and Audio</strong>, and its transcript is kept with your conversations. You can
          turn the coach&rsquo;s calls off in the app under <strong>Settings → Your Coach → Coach Calls</strong>; that
          does not stop you from calling your coach.
        </p>

        <h3 className="text-xl font-semibold mb-2 mt-6">Conversations With Your AI Coach</h3>
        <p className="mb-4">When you interact with our AI coaches in the app, by iMessage (or SMS, if we use it), or by voice, we store:</p>
        <ul className="mb-4 list-disc pl-6">
          <li>Your recent messages</li>
          <li>AI-generated summaries of your conversations</li>
          <li>Memories about your preferences and goals, generated from your conversations</li>
          <li>Your responses to scheduled check-ins</li>
        </ul>
        <p className="mb-4">
          This lets your coach remember your context and provide personalized guidance across sessions. Conversations
          are processed by our cloud AI services to generate responses. The text of your conversations is also sent to
          our analytics provider so we can monitor the quality of your coach&rsquo;s responses (see{" "}
          <strong>Usage, Analytics, and Diagnostics</strong> below). When you text with your coach, the messages also
          pass through our messaging provider, Blooio for iMessage and, if we use it, Twilio for SMS, which carry your phone number and
          the message text and keep their own records under their own policies.
        </p>

        <h3 className="text-xl font-semibold mb-2 mt-6">Instagram and Messenger</h3>
        <p className="mb-4">
          Delirio&rsquo;s AI coach also answers direct messages sent to its Instagram and Facebook Messenger accounts.
          If you message us there, Meta passes your message to us together with your Instagram or Messenger ID for that
          conversation and, for Instagram, your username when Meta provides it. We treat you as a visitor, not as an app
          user: we do not connect the conversation to a Delirio account. Your messages and the coach&rsquo;s replies are
          processed by our AI service provider, OpenAI, like other conversations, and may be sent to our analytics
          provider for quality review. The messages themselves are deleted automatically 90 days after they are sent. A
          small record that you messaged us (your Meta ID, your Instagram username when given, which coach replied, and
          message counts and dates) is kept until you ask us to delete it by emailing{" "}
          <a href="mailto:contact@delirio.fit" className="text-blue-600 underline">contact@delirio.fit</a> with your
          Instagram or Messenger name. What Meta keeps is governed by Meta&rsquo;s own policies.
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

        <h3 className="text-xl font-semibold mb-2 mt-6">Notifications</h3>
        <p className="mb-4">
          Delirio can send you notifications. To deliver them, the app registers each installation on your device and
          stores with your account a notification token issued by Google Firebase Cloud Messaging through Apple&rsquo;s
          Push Notification service, whether you have allowed notifications in iOS, the platform, the app version and
          build, when you last opened the app, and when that record was created and last updated. The app keeps this
          record whether or not you allow notifications, so that we know not to send any when you have not. We also
          store whether you have turned notifications on or off in the app.
        </p>
        <p className="mb-4">
          We use notifications to deliver your coach&rsquo;s messages, your workout and check-in reminders, your
          coach&rsquo;s replies, missed-call notices, and a notice shortly before and after your free week ends. That
          last notice is written by your coach and tells you what stops, that your progress is saved, and how to
          continue from the app. We do not use notifications to advertise other products, and we do not use the
          notification token to track you across other companies&rsquo; apps or websites.
        </p>
        <p className="mb-4">
          A notification&rsquo;s text is your coach&rsquo;s message or reminder, and it passes through Google and Apple
          on its way to your device. Medication reminders are worded so that they do not name the medication, because a
          notification can appear on your lock screen.
        </p>
        <p className="mb-4">
          The app records whether each notification was delivered and whether you opened it, using an identifier for
          that notification, along with changes to your notification settings. These records go to PostHog and are
          handled like the other app analytics described under <strong>Usage, Analytics, and Diagnostics</strong>{" "}
          below, including the Usage Analytics toggle. Our servers also record that a notification was sent, which we
          use to operate and troubleshoot delivery; the toggle does not stop that.
        </p>
        <p className="mb-4">
          You can turn notifications off at any time in the app under <strong>Settings → Notifications</strong>, or in
          iOS Settings. Turning them off stops notifications from being delivered to you.
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
          operate, secure, and improve Delirio. We use PostHog, a third-party analytics provider, and this data is
          stored on servers in the United States. Some of it is sent from the app on your device and some is sent from
          our servers; the Usage Analytics setting described under <strong>Screen Recording</strong> below controls only
          the first kind.
        </p>
        <p className="mb-4">
          We record the actions you take in the app: screens you open, buttons you tap, workouts you start and finish,
          and errors you encounter. These records are linked to your account rather than anonymous, and we may keep them
          for up to seven years. Your IP address is discarded on arrival and is not stored with this data.
        </p>
        <p className="mb-4">
          <strong>Coach conversations.</strong> To monitor and improve the quality of our AI coaches, our servers send
          the content of your conversations with your coach to PostHog: what you write to your coach and what your coach
          writes back, in text and in voice sessions. Because you may tell your coach about your health, this content
          can include health details you share, such as injuries or medication. It is linked to your account, is stored
          with the other analytics records described above, and may be kept for up to seven years. We use it to review
          and improve our coaches&rsquo; responses; we do not use it for advertising and we do not share it with Meta.
          This is sent from our servers rather than from your device, so it is not part of Screen Recording and is not
          stopped by the Usage Analytics toggle described below. Deleting your account in the app does not delete it
          from PostHog; to ask us to delete it, email us at{" "}
          <a href="mailto:contact@delirio.fit" className="text-blue-600 underline">contact@delirio.fit</a>.
        </p>
        <p className="mb-4">
          <strong>Records our servers create.</strong> Our servers also send PostHog records of what happens around your
          coaching, linked to your account: for example that a message or notification was sent to you, that a
          scheduled reminder or check-in ran, and how each coach turn went. These are also not stopped by the Usage
          Analytics toggle.
        </p>
        <p className="mb-4">
          <strong>Google Analytics and crash reports.</strong> The app also uses Google Analytics for Firebase to measure
          app performance and whether our advertising leads to account creation, free weeks, and subscriptions. It
          records events such as first open, sign-up, the start of a free week, and a subscription purchase with its
          transaction details, using device and app identifiers that Google&rsquo;s software sets. We do not send Google
          Analytics your Firebase user ID, name, email, health or fitness information, photos, or messages, and
          Google&rsquo;s ad-personalization signals are off. You can turn it off in the app under{" "}
          <strong>Settings → Preferences → Google Analytics</strong>; it is on by default. Separately, Google Firebase
          Crashlytics receives crash reports and diagnostic logs when the app fails. Neither the Usage Analytics toggle
          nor the Google Analytics toggle turns crash reports off.
        </p>

        <h3 className="text-xl font-semibold mb-2 mt-6">Screen Recording</h3>
        <p className="mb-4">
          Delirio captures periodic screenshots of its own screens while you use the app, roughly one per second, and
          sends them to PostHog so we can see where the app is confusing or broken. These recordings are linked to your
          account and are deleted after 30 days.
        </p>
        <p className="mb-4">
          A recording shows the app&rsquo;s own interface: its menus, buttons, labels, and layout. Before any screenshot
          leaves your device, we hide the parts that are about you:
        </p>
        <ul className="mb-4 list-disc pl-6">
          <li>
            Your conversations with your coach, on both sides, and what your coach writes about you elsewhere, such as
            the notes on your plan. The plan itself (its days, exercises, sets, and reps) is part of the app around you
            and is recorded.
          </li>
          <li>
            Your body and health details: your measurements, your training profile, your logged workouts, and your
            health readings, including the charts that display them
          </li>
          <li>Your name, email address, and phone number</li>
          <li>Your photos, including progress photos, and your camera</li>
          <li>Your location and any map of where you have been</li>
          <li>Passwords, verification codes, and payment details, which are never captured at all</li>
        </ul>
        <p className="mb-4">
          Workouts are recorded too. Your camera is hidden from every screenshot, so it is never part of a recording,
          and so are the weights and reps you log. What remains is the app around you, where you tapped, and how long you
          spent. It is enough to see that someone got stuck, and not enough to see who they are or what they said.
        </p>
        <p className="mb-4">
          This hiding applies to screenshots only. It does not apply to the coach-conversation content our servers send
          to PostHog, described under <strong>Usage, Analytics, and Diagnostics</strong> above.
        </p>
        <p className="mb-4">
          Hiding is applied to each screenshot as it is captured, so in rare cases something can appear in a single
          frame before it is hidden. The Usage Analytics description inside the app carries this same caveat.
        </p>
        <p className="mb-4">
          Screen recording is on by default. You can turn it off at any time in the app, under Settings and then
          Preferences, using the Usage Analytics toggle. Turning it off stops the screen recording and the PostHog
          events the app itself sends from your device. It does not stop anything our servers send, including the
          coach-conversation content and the other server-side records described under{" "}
          <strong>Usage, Analytics, and Diagnostics</strong>, and it does not control Google Analytics, crash reports,
          or advertising measurement, which have their own controls described elsewhere in this policy.
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
          <li>Deliver your coach&rsquo;s messages, reminders, and replies as notifications, if you allow them</li>
          <li>Process your subscription and payments</li>
          <li>Secure the app, prevent abuse, and diagnose problems</li>
          <li>Improve our app and services</li>
          <li>Monitor and improve the quality of our AI coaches&rsquo; responses</li>
          <li>Review product feedback you submit</li>
          <li>Measure how our advertising performs and, with your permission, show you more relevant ads</li>
        </ul>

        <h2 className="text-2xl font-semibold mb-4 mt-8">AI Features and Your Consent</h2>
        <p className="mb-4">
          Delirio is an AI coach, and it relies on third-party AI services. This means some of your data &mdash; your
          answers and conversations, your voice during coaching sessions and calls, and, if you turn the camera on in a
          workout, short video segments &mdash; is sent to those services to make these features work. We ask for your
          consent once, when you sign up, on a screen that names the providers and what each receives, before any of
          your information is sent to them. That screen has no decline option, because AI coaching is the core of the
          app. Camera form feedback is a separate choice: it runs only when you turn the camera on in a workout and
          accept the one-time prompt there.
        </p>
        <p className="mb-4">We currently use the following AI providers:</p>
        <ul className="mb-4 list-disc pl-6">
          <li>
            <strong>ElevenLabs</strong> &mdash; receives your microphone audio during voice coaching and coach calls, to
            understand what you say and to generate your coach&rsquo;s voice.
          </li>
          <li>
            <strong>OpenAI</strong> &mdash; receives your answers and your conversations with your coach, in voice and
            text, to build your plan and generate your coach&rsquo;s responses, and to keep your coach&rsquo;s notes
            about you.
          </li>
          <li>
            <strong>Google (Gemini)</strong> &mdash; receives short clips of your workout video, if you have turned the
            camera on, as the vision step inside our own form-analysis pipeline, which turns the result into your
            coach&rsquo;s feedback.
          </li>
          <li>
            <strong>Anthropic</strong> &mdash; receives your check-in answers and your coach&rsquo;s notes to write your
            journey notes after a check-in, and receives your conversations if we switch your coach to it as a backup
            when OpenAI is unavailable.
          </li>
        </ul>
        <p className="mb-4">
          These providers process your data on our behalf to deliver the features described above. If we change AI
          providers, we will update this policy before the change takes effect.
        </p>
        <p className="mb-4">
          Separately, our analytics provider, <strong>PostHog</strong>, receives the content of your conversations with
          your coach so we can monitor the quality of your coach&rsquo;s responses. PostHog does not generate your
          coach&rsquo;s responses. See <strong>Usage, Analytics, and Diagnostics</strong> above.
        </p>
        <p className="mb-4">
          Your consent to these AI services is given once and there is no setting in the app to withdraw it. You can stop
          video clips from being sent at any time by turning the camera off in a workout. If you do not want your data
          processed by these services at all, delete your account in the app (see{" "}
          <strong>Deleting Your Account</strong>). Deleting your account stops us from sending your data to them; what a provider has already received is
          handled under that provider&rsquo;s own terms.
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
            <strong>Cloud infrastructure and storage</strong> for authentication, database, file storage, scheduling,
            and hosting: Google Firebase and Google Cloud, and Railway, which hosts our servers
          </li>
          <li>
            <strong>Real-time voice transport</strong>: Daily, which carries the audio of voice coaching sessions and
            coach calls between your device and our voice service
          </li>
          <li>
            <strong>AI service providers</strong> for voice conversations, camera form analysis, and text coaching
            (named individually under <strong>AI Features and Your Consent</strong> above)
          </li>
          <li>
            <strong>Analytics and diagnostics providers</strong> to understand usage and diagnose crashes and
            performance, and to monitor the quality of coach responses: PostHog, which receives the content of your
            coach conversations (see <strong>Usage, Analytics, and Diagnostics</strong> and{' '}
            <strong>Screen Recording</strong> above), Google Analytics for Firebase, and Google Firebase Crashlytics
          </li>
          <li>
            <strong>Apple</strong> for subscriptions and billing through the App Store, and for the push service
            that delivers your coach&rsquo;s call rings
          </li>
          <li>
            <strong>Notification delivery services</strong>, Google Firebase Cloud Messaging and Apple&rsquo;s Push
            Notification service, to deliver notifications to your device (see <strong>Notifications</strong> above)
          </li>
          <li>
            <strong>Messaging providers</strong> for texting with your coach: Blooio for iMessage and, if we use it, Twilio for SMS
            (see <strong>Conversations With Your AI Coach</strong> above)
          </li>
          <li>
            <strong>Email delivery</strong> (Google&rsquo;s Gmail) to send the feedback you submit to our team
          </li>
          <li>
            <strong>Meta Platforms, Inc.</strong> for advertising attribution and measurement and, with your
            permission, ad personalization (see <strong>Advertising, Attribution, and Tracking</strong> below), and as
            the platform that carries Instagram and Messenger messages to us
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
          <strong>There is no Meta pixel on this site.</strong> Google Analytics runs in the browser to measure page
          visits and when someone chooses an App Store link. It receives standard browser and device information and,
          when present in an ad link, campaign identifiers such as UTM parameters and Google&rsquo;s click identifier.
          The website has no form or text box, so we do not send Google Analytics a name, email address, health data,
          payment information, or answers about you.
        </p>
        <p className="mb-4">
          Separately, two actions are reported from our own servers to Meta, through Meta&rsquo;s Conversions API:
          arriving on the home page, and choosing a link that takes you to the App Store. What we send is the name of that action, the campaign parameters in the
          link you arrived from, which version of the page you saw, your IP address, and your browser&rsquo;s user-agent
          string. That is the complete list. <strong>We do not send Meta your email address in any form</strong>, hashed
          or otherwise &mdash; the website never asks you for one. We also do not send Meta the page you were on, its
          title, or where you came from. Only the home page is reported this way &mdash; visiting this policy, or any
          other page here, sends nothing.
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
          . We use Google Analytics to measure website traffic and the App Store handoff event described above. Google
          Analytics is not configured here for Google Signals, ad personalization, website remarketing, or audience
          building.
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
          data to our servers. Your camera video segments and your voice during coaching are processed in the cloud by
          the services named above and are not stored by us. Your conversations and the workout, activity, photo, and
          profile data you record are stored on our cloud servers as described above. The content of your
          conversations is also copied to our analytics provider, PostHog, in the United States, as described under{" "}
          <strong>Usage, Analytics, and Diagnostics</strong>.
        </p>

        <h2 className="text-2xl font-semibold mb-4 mt-8">Data Retention</h2>
        <p className="mb-4">
          <strong>App accounts.</strong> We retain your personal information for as long as your account is active and
          as needed to provide the app. You can delete your account and associated data at any time, as described below.
          Some kinds of data are kept for a shorter, fixed time:
        </p>
        <ul className="mb-4 list-disc pl-6">
          <li>
            <strong>Conversations and your coach&rsquo;s notes.</strong> Your conversation history is kept while your
            account exists. The notes your coach keeps about you stay until they are replaced or retired; a retired note
            is kept for up to 180 days, and a note you ask your coach to forget is deleted, not archived. Records of
            the overnight runs that update those notes are kept for 30 days.
          </li>
          <li>
            <strong>Troubleshooting records of each coach turn.</strong> For each reply from your coach, we keep a
            record of what the coach was given and did, which can include your profile, notes, and recent messages, for 7
            days, and then it is deleted automatically.
          </li>
          <li>
            <strong>Voice session files.</strong> Each voice session or call leaves a technical log and metrics, which
            can contain what you said, for 30 days, and then they are deleted automatically. We do not keep audio
            recordings.
          </li>
          <li>
            <strong>Workout video.</strong> Camera video segments are not stored by us. The analysis result is kept with
            your workout record.
          </li>
          <li>
            <strong>Screen recordings.</strong> 30 days, as described under <strong>Screen Recording</strong>.
          </li>
          <li>
            <strong>Analytics events.</strong> Up to seven years, as described under{" "}
            <strong>Usage, Analytics, and Diagnostics</strong>.
          </li>
          <li>
            <strong>Operations log.</strong> Our monitoring and alert records, which include a copy of feedback you
            submit with your user ID masked, are deleted automatically after 90 days.
          </li>
          <li>
            <strong>Instagram and Messenger messages.</strong> Deleted automatically 90 days after they are sent, as
            described under <strong>Instagram and Messenger</strong>.
          </li>
        </ul>
        <p className="mb-4">
          <strong>Notification records.</strong> The notification record for an installation of the app is deleted when
          you sign out of the app on that device, when you use Fresh Start to reset your account, when you delete your
          account, or when Google or Apple reports that its token is no longer valid. Otherwise we keep it while your
          account is active.
        </p>
        <p className="mb-4">
          <strong>Our website.</strong> The site collects nothing from you, so there is nothing new to retain. If you
          joined the waitlist during the period it existed, we may still hold the record it created; you can have it
          deleted at any time by emailing us, and you do not need to give a reason.
        </p>

        <h2 className="text-2xl font-semibold mb-4 mt-8">Fresh Start</h2>
        <p className="mb-4">
          Fresh Start resets your coaching relationship so you can begin again. It erases your conversations, your
          coach&rsquo;s notes about you, your plan, reminders, check-ins and current status, your onboarding answers and
          profile details (including your name, body measurements, goals, and phone number), and your notification
          records. It does not erase your workout and activity history, your personal records, your photos, your sign-in
          account, or your subscription records, and the app keeps an archived copy of the profile that remains. It does
          not delete the analytics records described above, and the voice session files expire on their own after 30
          days. Deleting your account is the way to erase everything we can.
        </p>

        <h2 className="text-2xl font-semibold mb-4 mt-8">Deleting Your Account</h2>
        <p className="mb-4">You can permanently delete your account and associated data directly in the app:</p>
        <p className="mb-4">
          <strong>Settings → Account &amp; Profile → Delete Account</strong>
        </p>
        <p className="mb-4">
          Deleting your account is permanent. It erases your profile, workout and activity history, conversations and
          your coach&rsquo;s notes, plan, photos, notification records, and voice session files from our systems, and it
          stops further processing of your data by us and by the AI providers we use. This cannot be undone. For your
          security, you may be asked to sign in again before deletion completes.
        </p>
        <p className="mb-4">Some things are not removed by deleting your account in the app:</p>
        <ul className="mb-4 list-disc pl-6">
          <li>
            To keep the free week to one per person, we keep a one-way coded version of your email address (not the
            address itself) with a note of whether you have used a free week or subscribed. It cannot be turned back into
            your email address.
          </li>
          <li>
            Records held by our analytics provider, PostHog, including the content of your coach conversations, are not
            deleted automatically. Email us to have them deleted.
          </li>
          <li>
            Copies held by other companies under their own policies, such as your messages at Blooio or Twilio, Apple,
            Google, Meta, and the AI providers named above.
          </li>
        </ul>
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
          <li>
            Stop camera form feedback at any time by turning the camera off in a workout, or stop all processing by the
            AI providers by deleting your account
          </li>
          <li>
            Opt out of tracking and advertising sharing (iOS Settings → Privacy &amp; Security → Tracking, plus
            Meta&rsquo;s ad-preference tools), as described under Advertising, Attribution, and Tracking
          </li>
          <li>
            Control camera, microphone, location, health, photo, and notification permissions in your device settings,
            and turn notifications off in the app (Settings → Notifications)
          </li>
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

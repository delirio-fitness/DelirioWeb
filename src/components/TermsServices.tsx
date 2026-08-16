import { useEffect } from "react";
import { LandingLegalShell } from "./LandingLegalShell";
import { MONTHLY_PRICE_USD, YEARLY_MONTHLY_EQUIVALENT_USD, YEARLY_PRICE_USD } from "../config/product";

export default function TermsServices() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <LandingLegalShell>
      <div id="terms-of-service" className="max-w-3xl mx-auto px-6 py-10 md:py-16">
        <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
          <p className="mb-2 text-sm text-gray-500">Last updated: August 16, 2026</p>

          <h2 className="text-2xl font-semibold mb-4 mt-8">Agreement to Terms</h2>
          <p className="mb-4">
            These Terms of Service ("Terms") govern your use of the Delirio mobile application and related services
            (collectively, the "Service") operated by Delirio ("we," "us," or "our").
          </p>
          <p className="mb-4">
            By creating an account or using the Service, you agree to be bound by these Terms. If you do not agree to
            these Terms, do not use the Service.
          </p>

          <h2 className="text-2xl font-semibold mb-4 mt-8">Eligibility</h2>
          <p className="mb-4">
            You must be at least 16 years old to use the Service. By using the Service, you represent that you are at
            least 16 years old and have the legal capacity to enter into these Terms.
          </p>

          <h2 className="text-2xl font-semibold mb-4 mt-8">Description of Service</h2>
          <p className="mb-4">Delirio is an AI-powered fitness coaching application that provides:</p>
          <ul className="mb-4 list-disc pl-6">
            <li>Real-time exercise form feedback using your device's camera</li>
            <li>AI coaching through voice, text, SMS, and WhatsApp</li>
            <li>Workout tracking and progress analytics</li>
            <li>Personalized exercise guidance and recommendations</li>
          </ul>

          <h2 className="text-2xl font-semibold mb-4 mt-8">Health and Fitness Disclaimer</h2>
          <p className="mb-4 font-semibold">
            The Service is for informational and educational purposes only. It is not a substitute for professional
            medical advice, diagnosis, or treatment.
          </p>
          <p className="mb-4">By using the Service, you acknowledge and agree that:</p>
          <ul className="mb-4 list-disc pl-6">
            <li>
              You should consult with a qualified healthcare provider before beginning any exercise program, especially
              if you have any medical conditions, injuries, or health concerns.
            </li>
            <li>
              You exercise at your own risk. You are solely responsible for your physical health and safety during any
              workout or exercise activity.
            </li>
            <li>
              You should stop exercising immediately if you experience pain, dizziness, shortness of breath, or any
              other concerning symptoms.
            </li>
            <li>
              We are not responsible for any injury, illness, or health condition that may result from your use of the
              Service or following any guidance provided through the Service.
            </li>
            <li>The form feedback and coaching provided by the Service does not guarantee injury prevention.</li>
          </ul>

          <h2 className="text-2xl font-semibold mb-4 mt-8">AI Limitations Acknowledgment</h2>
          <p className="mb-4">
            The Service uses artificial intelligence to provide coaching, form feedback, and fitness guidance. By using
            the Service, you acknowledge and agree that:
          </p>
          <ul className="mb-4 list-disc pl-6">
            <li>AI coaches are not certified personal trainers, physical therapists, or medical professionals.</li>
            <li>AI-generated feedback and recommendations may contain errors or inaccuracies.</li>
            <li>
              The AI's form analysis, while designed to be helpful, is not infallible and should not be relied upon as
              the sole source of exercise guidance.
            </li>
            <li>You are responsible for using your own judgment when following any AI-generated advice.</li>
          </ul>

          <h2 className="text-2xl font-semibold mb-4 mt-8">Account Registration</h2>
          <p className="mb-4">To use certain features of the Service, you must create an account. You agree to:</p>
                <ul className="mb-4 list-disc pl-6">
            <li>Provide accurate and complete registration information</li>
            <li>Maintain the security of your account credentials</li>
            <li>Promptly update your information if it changes</li>
            <li>Accept responsibility for all activity that occurs under your account</li>
                </ul>
          <p className="mb-4">We reserve the right to suspend or terminate accounts that violate these Terms.</p>

          <h2 className="text-2xl font-semibold mb-4 mt-8">Subscriptions and Billing</h2>
          <p className="mb-4">
            Some features of the Service require a paid subscription. Delirio Plus is an auto-renewable subscription
            offered as a monthly plan ($29.99 per month) or an annual plan ($179.99 per year). Prices are shown in the
            app at the point of purchase and may vary by region and currency.
          </p>

          <h3 className="text-xl font-semibold mb-3 mt-6">Free Trial</h3>
          <p className="mb-4">
            New accounts receive a free trial, currently seven days, granted by Delirio once you finish setting up your
            account. It is not an App Store introductory offer: no payment method is required, nothing is charged, and
            there is nothing to cancel. The trial simply ends, and continued access requires a paid subscription. The
            trial is tied to your Delirio account rather than your Apple Account, and the length in effect is shown in
            the app before you start it. One trial is granted per account.
          </p>
          <p className="mb-4">
            Delirio Plus subscriptions do not include an introductory free trial. When you subscribe, the price shown is
            charged immediately and the subscription renews as described below.
          </p>

          <h3 className="text-xl font-semibold mb-3 mt-6">Auto-Renewal</h3>
          <p className="mb-4">
            Subscriptions renew automatically for the same period unless canceled at least 24 hours before the end of
            the current period. Payment is charged to your Apple Account through the App Store, and your account is
            charged for renewal within 24 hours prior to the end of the current period.
          </p>

          <h3 className="text-xl font-semibold mb-3 mt-6">Managing and Canceling Your Subscription</h3>
          <p className="mb-4">
            You can manage or cancel your subscription at any time through your Apple Account subscription settings
            (Settings &rarr; Apple Account &rarr; Subscriptions), or through the Manage Subscription option inside the
            app. Cancellation takes effect at the end of the current billing period, and you keep access until then.
            Deleting the app does not cancel your subscription.
          </p>

          <h3 className="text-xl font-semibold mb-3 mt-6">Refunds</h3>
          <p className="mb-4">
            Purchases are processed by Apple, and refund requests are handled by Apple under its terms. You can request
            a refund at{" "}
            <a href="https://reportaproblem.apple.com" className="text-blue-600 underline">
              reportaproblem.apple.com
            </a>
            . Delirio cannot issue App Store refunds directly.
          </p>

          <h3 className="text-xl font-semibold mb-3 mt-6">Price Changes</h3>
          <p className="mb-4">
            If we change subscription prices, existing subscribers will be notified in accordance with App Store rules
            and may cancel before the new price takes effect.
          </p>

          <h3 className="text-xl font-semibold mb-3 mt-6">Promotional Offers</h3>
          <p className="mb-4">
            If you redeem a promotional offer code, the standard price applies after the offer period ends unless you
            cancel the subscription before then.
          </p>

          <h2 className="text-2xl font-semibold mb-4 mt-8">Service Changes</h2>
          <p className="mb-4">
            We are continually improving Delirio. Features may be added, modified, or removed over time, and the Service
            may occasionally be unavailable for maintenance or experience interruptions. We will provide reasonable
            notice of changes that materially reduce the core functionality of a paid subscription.
          </p>

          <h2 className="text-2xl font-semibold mb-4 mt-8">Messaging Consent</h2>
          <p className="mb-4">
            By providing your phone number during account creation, you consent to receive messages from us via SMS
            and/or WhatsApp. These messages may include:
          </p>
                <ul className="mb-4 list-disc pl-6">
            <li>Coaching conversations with AI trainers</li>
            <li>Workout reminders and encouragement</li>
            <li>Service-related notifications</li>
                </ul>
          <p className="mb-4">
            Message frequency varies based on your usage and preferences. Standard messaging rates may apply depending
            on your carrier. You can stop receiving messages by contacting us or adjusting your settings within the
            Service.
          </p>

          <h2 className="text-2xl font-semibold mb-4 mt-8">Acceptable Use</h2>
          <p className="mb-4">You agree not to:</p>
                <ul className="mb-4 list-disc pl-6">
            <li>Use the Service for any unlawful purpose</li>
            <li>Attempt to gain unauthorized access to the Service or its systems</li>
            <li>Interfere with or disrupt the Service or servers</li>
            <li>Reverse engineer, decompile, or attempt to extract the source code of the Service</li>
            <li>Use automated systems or software to access the Service without permission</li>
            <li>Impersonate any person or entity</li>
            <li>Share your account credentials with others</li>
            <li>Use the Service in any way that could harm yourself or others</li>
                </ul>

          <h2 className="text-2xl font-semibold mb-4 mt-8">Intellectual Property</h2>
          <p className="mb-4">
            The Service and its original content, features, and functionality are owned by Delirio and are protected by
            copyright, trademark, and other intellectual property laws. You may not copy, modify, distribute, or create
            derivative works based on the Service without our express written permission.
          </p>

          <h2 className="text-2xl font-semibold mb-4 mt-8">User Content</h2>
          <p className="mb-4">
            You retain ownership of any content you submit through the Service (such as messages to AI coaches). By
            submitting content, you grant us a license to use, process, and store that content as necessary to provide
            and improve the Service.
          </p>

          <h2 className="text-2xl font-semibold mb-4 mt-8">Privacy</h2>
          <p className="mb-4">
            Your use of the Service is also governed by our Privacy Policy, available at{" "}
            <a href="https://delirio.fit/privacy-policy" className="text-blue-600 underline">
              https://delirio.fit/privacy-policy
            </a>
            . Please review the Privacy Policy to understand how we collect, use, and protect your information.
          </p>

          <h2 className="text-2xl font-semibold mb-4 mt-8">Disclaimers</h2>
          <p className="mb-4 uppercase text-sm">
            THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR
            IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
            PURPOSE, AND NON-INFRINGEMENT.
          </p>
          <p className="mb-4 uppercase text-sm">
            WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR COMPLETELY SECURE. WE DO NOT
            WARRANT THE ACCURACY OR RELIABILITY OF ANY INFORMATION PROVIDED THROUGH THE SERVICE, INCLUDING AI-GENERATED
            CONTENT.
          </p>

          <h2 className="text-2xl font-semibold mb-4 mt-8">Limitation of Liability</h2>
          <p className="mb-4 uppercase text-sm">
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, DELIRIO AND ITS FOUNDERS, EMPLOYEES, AND AFFILIATES SHALL NOT BE
            LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED
            TO LOSS OF DATA, PERSONAL INJURY, OR DAMAGES ARISING FROM YOUR USE OF THE SERVICE.
          </p>
          <p className="mb-4 uppercase text-sm">
            OUR TOTAL LIABILITY FOR ANY CLAIM ARISING FROM THESE TERMS OR YOUR USE OF THE SERVICE SHALL NOT EXCEED THE
            AMOUNT YOU PAID US IN THE TWELVE MONTHS PRECEDING THE CLAIM, OR $100, WHICHEVER IS GREATER.
          </p>

          <h2 className="text-2xl font-semibold mb-4 mt-8">Indemnification</h2>
          <p className="mb-4">
            You agree to indemnify and hold harmless Delirio and its founders, employees, and affiliates from any
            claims, damages, losses, or expenses (including reasonable attorneys' fees) arising from your use of the
            Service, your violation of these Terms, or your violation of any rights of another party.
          </p>

          <h2 className="text-2xl font-semibold mb-4 mt-8">Termination</h2>
          <p className="mb-4">
            We may suspend or terminate your access to the Service at any time, with or without cause, and with or
            without notice. You may stop using the Service at any time.
          </p>
          <p className="mb-4">
            If we terminate your access without cause while you have an active paid subscription, your remedy is to
            request a refund from Apple for the unused portion of your subscription term.
          </p>
          <p className="mb-4">
            Upon termination, your right to use the Service will immediately cease. Provisions of these Terms that by
            their nature should survive termination will survive, including ownership, disclaimers, indemnification, and
            limitations of liability.
          </p>

          <h2 className="text-2xl font-semibold mb-4 mt-8">Changes to Terms</h2>
          <p className="mb-4">
            We may modify these Terms at any time. If we make material changes, we will notify you through the Service
            or by other means. Your continued use of the Service after changes take effect constitutes your acceptance
            of the revised Terms.
          </p>

          <h2 className="text-2xl font-semibold mb-4 mt-8">Governing Law</h2>
          <p className="mb-4">
            These Terms are governed by the laws of the Commonwealth of Massachusetts, United States, without regard to
            its conflict of law provisions. Any disputes arising from these Terms or the Service shall be resolved in
            the courts of Massachusetts.
          </p>

          <h2 className="text-2xl font-semibold mb-4 mt-8">Severability</h2>
          <p className="mb-4">
            If any provision of these Terms is found to be unenforceable, the remaining provisions will continue in full
            force and effect.
          </p>

          <h2 className="text-2xl font-semibold mb-4 mt-8">Entire Agreement</h2>
          <p className="mb-4">
            These Terms, together with the Privacy Policy, constitute the entire agreement between you and Delirio
            regarding the Service and supersede any prior agreements.
          </p>

          <h2 className="text-2xl font-semibold mb-4 mt-8">Contact Us</h2>
          <p className="mb-4">If you have questions about these Terms, please contact us at:</p>
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

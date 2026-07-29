import textingWoman from '../../assets/images/planJourney/generated/meet-your-coach/texting-woman/v1/image-web.jpg';
import textingMan from '../../assets/images/planJourney/generated/meet-your-coach/texting-man/v2/image-web.jpg';
import irisPortrait from '../../images/emojis/Iris/Iris_idle_return.png';
import reedPortrait from '../../images/emojis/Reed/Reed_idle_return.png';
import midSetVoiceCoaching from '../../images/appScreenshots/midSetVoiceCoaching.png';
import { PhoneScreenshotFrame } from './PhoneScreenshotFrame';

const collageItems = [
  {
    className: 'is-primary-person',
    src: textingWoman,
    alt: 'A woman texting her Delirio coach after a home workout',
    conversation: 'woman',
  },
  {
    className: 'is-product-screen',
    src: midSetVoiceCoaching,
    alt: 'Delirio coaching guidance during a workout',
    phoneFrame: true,
  },
  {
    className: 'is-secondary-person',
    src: textingMan,
    alt: 'A man texting his Delirio coach before a home workout',
    conversation: 'man',
  },
  {
    className: 'is-iris',
    src: irisPortrait,
    alt: 'Iris, a Delirio AI coach',
    label: 'IRIS',
  },
  {
    className: 'is-reed',
    src: reedPortrait,
    alt: 'Reed, a Delirio AI coach',
    label: 'REED',
  },
] as const;

/**
 * A compact visual explanation of the Delirio coaching relationship.
 *
 * The collage intentionally combines people, both named coaches, and the
 * product interface. Together they communicate who the coaches support, who
 * the user can speak with, and where that guidance appears without turning
 * the carousel chapter into another block of explanatory copy.
 */
export function CoachCapabilityCollage() {
  return (
    <div className="d3-coach-collage" aria-label="Meet Iris and Reed, Delirio AI coaches">
      {collageItems.map((item) => (
        <figure className={`d3-coach-collage__tile ${item.className}`} key={item.className}>
          {'phoneFrame' in item && item.phoneFrame ? (
            <PhoneScreenshotFrame src={item.src} alt={item.alt} />
          ) : (
            <img src={item.src} alt={item.alt} decoding="async" />
          )}
          {'conversation' in item && (
            <CoachConversationOverlay variant={item.conversation} />
          )}
          {'label' in item && <figcaption>{item.label}</figcaption>}
        </figure>
      ))}
    </div>
  );
}

const exampleConversations = {
  woman: [
    { author: 'user', text: 'My energy is lower today.' },
    { author: 'coach', text: "Got it. I'll adjust the session." },
  ],
  man: [
    { author: 'user', text: 'Can we keep this under 30 minutes?' },
    { author: 'coach', text: "Yes. I'll keep what matters most." },
  ],
} as const;

function CoachConversationOverlay({
  variant,
}: {
  variant: keyof typeof exampleConversations;
}) {
  return (
    <div className={`d3-coach-chat is-${variant}`} aria-label="Example conversation with Iris">
      {exampleConversations[variant].map((message) => (
        <div className={`d3-coach-chat__row is-${message.author}`} key={message.text}>
          {message.author === 'coach' && (
            <span className="d3-coach-chat__avatar is-coach" aria-hidden="true">
              <img src={irisPortrait} alt="" />
            </span>
          )}
          <span className="d3-coach-chat__bubble">{message.text}</span>
        </div>
      ))}
    </div>
  );
}

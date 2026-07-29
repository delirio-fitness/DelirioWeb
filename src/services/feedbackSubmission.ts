import { signInAnonymously } from 'firebase/auth';
import { addDoc, collection, doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { getFirebaseServices } from './firebaseClient';
import type { WarmNetworkLead } from './warmNetworkTypes';

export type FeedbackAnswers = {
  wish: string;
  coachingUsefulness: string;
  nextBuild: string;
};

export async function submitFeedbackToFirestore(browserId: string, answers: FeedbackAnswers) {
  const { auth, database } = getFirebaseServices();
  const user = auth.currentUser ?? (await signInAnonymously(auth)).user;

  const document = await addDoc(collection(database, 'webQuestionaire'), {
    browserId,
    ownerUid: user.uid,
    answers,
    source: 'delirio-website-feedback',
    schemaVersion: 2,
    createdAt: serverTimestamp(),
  });

  return document.id;
}

/**
 * Updates the existing questionnaire document after a visitor explicitly opts
 * into the waitlist. The caller supplies the complete serialized answer
 * envelope so the email remains attached to the same document and its original
 * questionnaire ID, rather than creating a second identified record.
 */
export async function appendQuestionnaireEmailToFirestore(submissionId: string, email: string) {
  const { auth, database } = getFirebaseServices();
  if (!auth.currentUser) await signInAnonymously(auth);

  await updateDoc(doc(database, 'webQuestionaire', submissionId), { email });
  return submissionId;
}

/**
 * Creates an independent footer-only waitlist record with the minimal
 * warmNetwork lead schema.
 */
export async function submitWarmNetworkWishlistToFirestore(
  browserId: string,
  email: string,
) {
  const { auth, database } = getFirebaseServices();
  const user = auth.currentUser ?? (await signInAnonymously(auth)).user;

  const lead = {
    email,
    TimeSTamp: Date.now(),
    createdAt: serverTimestamp(),
    source: 'delirio-website-wishlist',
    ownerUid: user.uid,
    browserID: browserId,
  } satisfies WarmNetworkLead;

  const document = await addDoc(collection(database, 'warmNetwork'), lead);

  return document.id;
}

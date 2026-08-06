/**
 * Firestore writers for the waitlist gate.
 *
 * The gate writes twice on purpose. Answers land as soon as the last question
 * is answered, before the email is asked for, so someone who fills in the
 * questions and then declines to hand over an address still counts as a read on
 * demand — which is the entire reason the questions are there. The email is
 * patched onto that same document afterwards, so one visitor is one record.
 */
import { signInAnonymously } from 'firebase/auth';
import { addDoc, collection, doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import type { WaitlistResponse } from '../content/waitlistQuestions';
import { getFirebaseServices } from './firebaseClient';
import type { WarmNetworkLead } from './warmNetworkTypes';

/**
 * Bumped from 2 when the GLP-1 questionnaire was replaced by the waitlist
 * filter. Version 2 documents carry `answers.{wish,coachingUsefulness,nextBuild}`
 * as JSON strings; version 3 carries a flat `responses` array instead, so a
 * reader has to branch on this rather than assume a shape.
 */
const WAITLIST_SCHEMA_VERSION = 3;

async function requireUid() {
  const { auth, database } = getFirebaseServices();
  const user = auth.currentUser ?? (await signInAnonymously(auth)).user;
  return { database, uid: user.uid };
}

/** Records the answers and returns the document id the email is appended to. */
export async function submitWaitlistAnswersToFirestore(
  browserId: string,
  responses: readonly WaitlistResponse[],
  design: string,
) {
  const { database, uid } = await requireUid();

  const document = await addDoc(collection(database, 'webQuestionaire'), {
    browserId,
    ownerUid: uid,
    responses,
    design,
    source: 'delirio-website-waitlist',
    schemaVersion: WAITLIST_SCHEMA_VERSION,
    createdAt: serverTimestamp(),
  });

  return document.id;
}

/**
 * Rewrites the answers on an existing document.
 *
 * Only the single-page design can reach this: its questions stay editable after
 * the set is complete, so an answer changed after the first write would
 * otherwise leave the stored record disagreeing with what the visitor sees.
 */
export async function updateWaitlistAnswersInFirestore(
  submissionId: string,
  responses: readonly WaitlistResponse[],
) {
  const { database } = await requireUid();
  await updateDoc(doc(database, 'webQuestionaire', submissionId), { responses });
  return submissionId;
}

/**
 * Attaches the email to the questionnaire document the visitor just filled in,
 * rather than creating a second identified record for the same person.
 */
export async function appendWaitlistEmailToFirestore(submissionId: string, email: string) {
  const { database } = await requireUid();
  await updateDoc(doc(database, 'webQuestionaire', submissionId), { email });
  return submissionId;
}

/**
 * Creates an independent waitlist record with the minimal warmNetwork schema,
 * for an opt-in that arrived without answering anything.
 */
export async function submitWarmNetworkWishlistToFirestore(browserId: string, email: string) {
  const { database, uid } = await requireUid();

  const lead = {
    email,
    TimeSTamp: Date.now(),
    createdAt: serverTimestamp(),
    source: 'delirio-website-wishlist',
    ownerUid: uid,
    browserID: browserId,
  } satisfies WarmNetworkLead;

  const document = await addDoc(collection(database, 'warmNetwork'), lead);

  return document.id;
}

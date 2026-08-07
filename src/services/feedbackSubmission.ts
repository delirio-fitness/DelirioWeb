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
 *
 * Not bumped for two later changes, because both are legible without it and
 * neither restructures anything:
 *
 * - `design` was dropped when the single-page gate was scrapped. Its presence
 *   dates a document to before that; only the stepped flow exists now.
 * - `order` was added for the `?wo=` experiment (`config/waitlistOrder`), and
 *   tells you which sequence produced the record — `questions` writes answers
 *   first and may never gain an `email`, `email` writes the address first and
 *   may never gain `responses`. Neither field is guaranteed on a v3 document.
 */
const WAITLIST_SCHEMA_VERSION = 3;

async function requireUid() {
  const { auth, database } = getFirebaseServices();
  const user = auth.currentUser ?? (await signInAnonymously(auth)).user;
  return { database, uid: user.uid };
}

/**
 * Records the answers and returns the document id the email is appended to.
 *
 * The questions-first entry point: the record begins as answers with no email,
 * and gains one only if the visitor gets to the end and gives it.
 */
export async function submitWaitlistAnswersToFirestore(
  browserId: string,
  responses: readonly WaitlistResponse[],
  order: string,
) {
  const { database, uid } = await requireUid();

  const document = await addDoc(collection(database, 'webQuestionaire'), {
    browserId,
    ownerUid: uid,
    responses,
    order,
    source: 'delirio-website-waitlist',
    schemaVersion: WAITLIST_SCHEMA_VERSION,
    createdAt: serverTimestamp(),
  });

  return document.id;
}

/**
 * Records the email and returns the document id the answers are appended to.
 *
 * The email-first entry point, and the mirror of the writer above: the record
 * begins as a signup and gains answers only if the visitor chooses to give them.
 * Two consequences worth knowing — every record from this arm is reachable by
 * email, so none of them hit the "we cannot find your entry to delete it" case
 * in the privacy policy; and `responses` is absent rather than empty until the
 * first answer lands, so a reader must not assume the field exists.
 */
export async function submitWaitlistEmailToFirestore(
  browserId: string,
  email: string,
  order: string,
) {
  const { database, uid } = await requireUid();

  const document = await addDoc(collection(database, 'webQuestionaire'), {
    browserId,
    ownerUid: uid,
    email,
    order,
    source: 'delirio-website-waitlist',
    schemaVersion: WAITLIST_SCHEMA_VERSION,
    createdAt: serverTimestamp(),
  });

  return document.id;
}

/**
 * Rewrites the answers on an existing document.
 *
 * The email-first arm's workhorse: the document already exists — created from
 * the email — so every answer is patched onto it as it is given, and abandoning
 * halfway still leaves behind the answers that were volunteered. The
 * questions-first control reaches this only for the free-text field, which is
 * committed on blur after the set is already saved.
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

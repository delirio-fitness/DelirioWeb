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
import type { FieldValue } from 'firebase/firestore';
import { addDoc, collection, doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import type { WaitlistResponse } from '../content/waitlistQuestions';
import { getFirebaseServices } from './firebaseClient';

/**
 * Everything the gate collects lands here, and nothing else writes here.
 *
 * Deliberately neither of the two collections that came before it:
 *
 * - `warmNetwork` is the *warm* list — people the team already knows. Cold
 *   signups from an ad are a different population, and mixing the two destroys
 *   the only thing that made that list worth having.
 * - `webQuestionaire` holds the v2 GLP-1 questionnaire. The v3 waitlist pointed
 *   here too, but its rules still validated the v2 envelope and rejected every
 *   write — so expect no v3 answers in it. It is historical either way.
 *
 * A document here may carry answers with no email, an email with no answers, or
 * both — which one depends on `order` and how far the visitor got. See the
 * writers below, and do not assume either field exists.
 */
const WAITLIST_COLLECTION = 'wishlist2';

/**
 * The shape `firestore.rules` validates for this collection. Kept as a type so
 * a field added here fails to compile until it is allowed there too — the rules
 * use `keys().hasOnly(...)`, so an unlisted field does not get ignored, it
 * rejects the entire write.
 */
type WaitlistRecord = {
  browserId: string;
  ownerUid: string;
  source: 'delirio-website-waitlist' | 'delirio-website-wishlist';
  schemaVersion: typeof WAITLIST_SCHEMA_VERSION;
  createdAt: FieldValue;
  order?: string;
  responses?: readonly WaitlistResponse[];
  email?: string;
};

/**
 * Bumped from 2 when the GLP-1 questionnaire was replaced by the waitlist
 * filter. Version 2 documents carry `answers.{wish,coachingUsefulness,nextBuild}`
 * as JSON strings; version 3 carries a flat `responses` array instead, so a
 * reader has to branch on this rather than assume a shape.
 *
 * Not bumped for the move to `wishlist2`: the collection name already tells a
 * reader which vintage they are holding, and the field layout did not change.
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

  const record = {
    browserId,
    ownerUid: uid,
    responses,
    order,
    source: 'delirio-website-waitlist',
    schemaVersion: WAITLIST_SCHEMA_VERSION,
    createdAt: serverTimestamp(),
  } satisfies WaitlistRecord;

  const document = await addDoc(collection(database, WAITLIST_COLLECTION), record);

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

  const record = {
    browserId,
    ownerUid: uid,
    email,
    order,
    source: 'delirio-website-waitlist',
    schemaVersion: WAITLIST_SCHEMA_VERSION,
    createdAt: serverTimestamp(),
  } satisfies WaitlistRecord;

  const document = await addDoc(collection(database, WAITLIST_COLLECTION), record);

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
  await updateDoc(doc(database, WAITLIST_COLLECTION, submissionId), { responses });
  return submissionId;
}

/**
 * Attaches the email to the questionnaire document the visitor just filled in,
 * rather than creating a second identified record for the same person.
 */
export async function appendWaitlistEmailToFirestore(submissionId: string, email: string) {
  const { database } = await requireUid();
  await updateDoc(doc(database, WAITLIST_COLLECTION, submissionId), { email });
  return submissionId;
}

/**
 * Creates a waitlist record from an email that arrived without answers.
 *
 * Two ways to get here, and `source: 'delirio-website-wishlist'` marks both so
 * they can be counted separately from the records the gate produced normally:
 * the ungated landing band, which has no questions in front of it, and the
 * gate's own fallback when the answer write failed and there is no document to
 * attach the address to. A failed write must not block the ask — so the address
 * still lands, just without the answers that were meant to come with it.
 *
 * These used to go to `warmNetwork` with a different field layout entirely
 * (`TimeSTamp`, `browserID`). They are the same population as the rest of the
 * gate, so they now live alongside it in the same shape.
 */
export async function submitStandaloneWaitlistEmailToFirestore(browserId: string, email: string) {
  const { database, uid } = await requireUid();

  const record = {
    browserId,
    ownerUid: uid,
    email,
    source: 'delirio-website-wishlist',
    schemaVersion: WAITLIST_SCHEMA_VERSION,
    createdAt: serverTimestamp(),
  } satisfies WaitlistRecord;

  const document = await addDoc(collection(database, WAITLIST_COLLECTION), record);

  return document.id;
}

import { signInAnonymously } from 'firebase/auth';
import { addDoc, collection, doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { getFirebaseServices } from './firebaseClient';
import {
  appendWaitlistEmailToFirestore,
  submitWaitlistAnswersToFirestore,
  submitWaitlistEmailToFirestore,
  submitStandaloneWaitlistEmailToFirestore,
  updateWaitlistAnswersInFirestore,
} from './feedbackSubmission';

jest.mock('firebase/auth', () => ({ signInAnonymously: jest.fn() }));
jest.mock('firebase/firestore', () => ({
  addDoc: jest.fn(),
  collection: jest.fn(),
  doc: jest.fn(),
  serverTimestamp: jest.fn(),
  updateDoc: jest.fn(),
}));
jest.mock('./firebaseClient', () => ({ getFirebaseServices: jest.fn() }));

const getFirebaseServicesMock = jest.mocked(getFirebaseServices);
const addDocMock = jest.mocked(addDoc);
const collectionMock = jest.mocked(collection);
const documentMock = jest.mocked(doc);
const serverTimestampMock = jest.mocked(serverTimestamp);
const signInAnonymouslyMock = jest.mocked(signInAnonymously);
const updateDocMock = jest.mocked(updateDoc);

describe('website Firebase submission paths', () => {
  const auth = { currentUser: { uid: 'anonymous-user-id' } };
  const database = { name: 'firestore' };

  beforeEach(() => {
    getFirebaseServicesMock.mockReturnValue({ auth, database } as never);
    collectionMock.mockReturnValue('collection-ref' as never);
    documentMock.mockReturnValue('document-ref' as never);
    serverTimestampMock.mockReturnValue('server-time' as never);
    updateDocMock.mockResolvedValue(undefined);
    addDocMock.mockResolvedValue({ id: 'standalone-document-id' } as never);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('updates the originating questionnaire document without creating another record', async () => {
    await appendWaitlistEmailToFirestore('questionnaire-document-id', 'person@example.com');

    expect(documentMock).toHaveBeenCalledWith(
      database,
      'wishlist2',
      'questionnaire-document-id',
    );
    expect(updateDocMock).toHaveBeenCalledWith('document-ref', { email: 'person@example.com' });
    expect(addDocMock).not.toHaveBeenCalled();
  });

  it('records the answers before an email exists, under the current schema', async () => {
    addDocMock.mockResolvedValue({ id: 'waitlist-document-id' } as never);
    const responses = [
      { id: 'startTiming', kind: 'choice' as const, question: 'When would you start?', answer: 'Right away', value: 'immediately' },
    ];

    await expect(
      submitWaitlistAnswersToFirestore('browser_id_1234567890', responses, 'questions'),
    ).resolves.toBe('waitlist-document-id');

    expect(collectionMock).toHaveBeenCalledWith(database, 'wishlist2');
    expect(addDocMock).toHaveBeenCalledWith('collection-ref', {
      browserId: 'browser_id_1234567890',
      ownerUid: 'anonymous-user-id',
      responses,
      order: 'questions',
      source: 'delirio-website-waitlist',
      schemaVersion: 3,
      createdAt: 'server-time',
    });
  });

  /**
   * The mirror of the test above, and the reason the A/B test is readable: the
   * email-first arm creates the record from the address, so `responses` is
   * absent rather than empty until the first answer lands.
   */
  it('records the email before any answers exist, in the email-first arm', async () => {
    addDocMock.mockResolvedValue({ id: 'waitlist-document-id' } as never);

    await expect(
      submitWaitlistEmailToFirestore('browser_id_1234567890', 'person@example.com', 'email'),
    ).resolves.toBe('waitlist-document-id');

    expect(collectionMock).toHaveBeenCalledWith(database, 'wishlist2');
    expect(addDocMock).toHaveBeenCalledWith('collection-ref', {
      browserId: 'browser_id_1234567890',
      ownerUid: 'anonymous-user-id',
      email: 'person@example.com',
      order: 'email',
      source: 'delirio-website-waitlist',
      schemaVersion: 3,
      createdAt: 'server-time',
    });
    expect(addDocMock.mock.calls[0][1]).not.toHaveProperty('responses');
  });

  it('rewrites answers in place rather than creating a second record', async () => {
    const responses = [
      { id: 'startTiming', kind: 'choice' as const, question: 'When would you start?', answer: 'Within a month', value: 'within_a_month' },
    ];

    await updateWaitlistAnswersInFirestore('waitlist-document-id', responses);

    expect(documentMock).toHaveBeenCalledWith(database, 'wishlist2', 'waitlist-document-id');
    expect(updateDocMock).toHaveBeenCalledWith('document-ref', { responses });
    expect(addDocMock).not.toHaveBeenCalled();
  });

  /**
   * The warm list is people the team already knows, and nothing from the site
   * may land in it — so an opt-in with no answers joins the rest of the gate in
   * `wishlist2`, marked by its source rather than by living somewhere else.
   */
  it('writes an opt-in that skipped the questions alongside the rest of the gate', async () => {
    await expect(
      submitStandaloneWaitlistEmailToFirestore('browser_id_1234567890', 'person@example.com'),
    ).resolves.toBe('standalone-document-id');

    expect(collectionMock).toHaveBeenCalledWith(database, 'wishlist2');
    expect(collectionMock).not.toHaveBeenCalledWith(database, 'warmNetwork');
    expect(addDocMock).toHaveBeenCalledWith('collection-ref', {
      browserId: 'browser_id_1234567890',
      ownerUid: 'anonymous-user-id',
      email: 'person@example.com',
      source: 'delirio-website-wishlist',
      schemaVersion: 3,
      createdAt: 'server-time',
    });
    expect(addDocMock.mock.calls[0][1]).not.toHaveProperty('responses');
  });

  it('establishes anonymous auth before a questionnaire-email update when needed', async () => {
    getFirebaseServicesMock.mockReturnValue({ auth: { currentUser: null }, database } as never);
    signInAnonymouslyMock.mockResolvedValue({ user: { uid: 'anonymous-user-id' } } as never);

    await appendWaitlistEmailToFirestore('questionnaire-document-id', 'person@example.com');

    expect(signInAnonymouslyMock).toHaveBeenCalledWith({ currentUser: null });
    expect(updateDocMock).toHaveBeenCalledWith('document-ref', { email: 'person@example.com' });
  });
});

import { signInAnonymously } from 'firebase/auth';
import { addDoc, collection, doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { getFirebaseServices } from './firebaseClient';
import {
  appendWaitlistEmailToFirestore,
  submitWaitlistAnswersToFirestore,
  submitWarmNetworkWishlistToFirestore,
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
    addDocMock.mockResolvedValue({ id: 'warm-network-document-id' } as never);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('updates the originating questionnaire document without creating another record', async () => {
    await appendWaitlistEmailToFirestore('questionnaire-document-id', 'person@example.com');

    expect(documentMock).toHaveBeenCalledWith(
      database,
      'webQuestionaire',
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
      submitWaitlistAnswersToFirestore('browser_id_1234567890', responses, 'steps'),
    ).resolves.toBe('waitlist-document-id');

    expect(collectionMock).toHaveBeenCalledWith(database, 'webQuestionaire');
    expect(addDocMock).toHaveBeenCalledWith('collection-ref', {
      browserId: 'browser_id_1234567890',
      ownerUid: 'anonymous-user-id',
      responses,
      design: 'steps',
      source: 'delirio-website-waitlist',
      schemaVersion: 3,
      createdAt: 'server-time',
    });
  });

  it('rewrites answers in place rather than creating a second record', async () => {
    const responses = [
      { id: 'startTiming', kind: 'choice' as const, question: 'When would you start?', answer: 'Within a month', value: 'within_a_month' },
    ];

    await updateWaitlistAnswersInFirestore('waitlist-document-id', responses);

    expect(documentMock).toHaveBeenCalledWith(database, 'webQuestionaire', 'waitlist-document-id');
    expect(updateDocMock).toHaveBeenCalledWith('document-ref', { responses });
    expect(addDocMock).not.toHaveBeenCalled();
  });

  it('writes an opt-in that skipped the questions as a create-only warmNetwork record', async () => {
    await expect(
      submitWarmNetworkWishlistToFirestore('browser_id_1234567890', 'person@example.com'),
    ).resolves.toBe('warm-network-document-id');

    expect(collectionMock).toHaveBeenCalledWith(database, 'warmNetwork');
    expect(addDocMock).toHaveBeenCalledWith('collection-ref', {
      email: 'person@example.com',
      TimeSTamp: expect.any(Number),
      createdAt: 'server-time',
      source: 'delirio-website-wishlist',
      ownerUid: 'anonymous-user-id',
      browserID: 'browser_id_1234567890',
    });
  });

  it('establishes anonymous auth before a questionnaire-email update when needed', async () => {
    getFirebaseServicesMock.mockReturnValue({ auth: { currentUser: null }, database } as never);
    signInAnonymouslyMock.mockResolvedValue({ user: { uid: 'anonymous-user-id' } } as never);

    await appendWaitlistEmailToFirestore('questionnaire-document-id', 'person@example.com');

    expect(signInAnonymouslyMock).toHaveBeenCalledWith({ currentUser: null });
    expect(updateDocMock).toHaveBeenCalledWith('document-ref', { email: 'person@example.com' });
  });
});

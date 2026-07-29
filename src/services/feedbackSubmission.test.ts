import { signInAnonymously } from 'firebase/auth';
import { addDoc, collection, doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { getFirebaseServices } from './firebaseClient';
import {
  appendQuestionnaireEmailToFirestore,
  submitWarmNetworkWishlistToFirestore,
  type FeedbackAnswers,
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

const answers: FeedbackAnswers = {
  wish: '{"email":"person@example.com"}',
  coachingUsefulness: '{"placement":"questionnaire"}',
  nextBuild: '{"consent":"delirio-launch-and-product-updates"}',
};

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
    await appendQuestionnaireEmailToFirestore('questionnaire-document-id', 'person@example.com');

    expect(documentMock).toHaveBeenCalledWith(
      database,
      'webQuestionaire',
      'questionnaire-document-id',
    );
    expect(updateDocMock).toHaveBeenCalledWith('document-ref', { email: 'person@example.com' });
    expect(addDocMock).not.toHaveBeenCalled();
  });

  it('writes a footer-only opt-in as a create-only warmNetwork record', async () => {
    await expect(
      submitWarmNetworkWishlistToFirestore('browser_id_1234567890', answers, 'person@example.com'),
    ).resolves.toBe('warm-network-document-id');

    expect(collectionMock).toHaveBeenCalledWith(database, 'warmNetwork');
    expect(addDocMock).toHaveBeenCalledWith('collection-ref', {
      browserId: 'browser_id_1234567890',
      ownerUid: 'anonymous-user-id',
      answers,
      email: 'person@example.com',
      source: 'delirio-website-feedback',
      schemaVersion: 2,
      createdAt: 'server-time',
    });
  });

  it('establishes anonymous auth before a questionnaire-email update when needed', async () => {
    getFirebaseServicesMock.mockReturnValue({ auth: { currentUser: null }, database } as never);
    signInAnonymouslyMock.mockResolvedValue({ user: { uid: 'anonymous-user-id' } } as never);

    await appendQuestionnaireEmailToFirestore('questionnaire-document-id', 'person@example.com');

    expect(signInAnonymouslyMock).toHaveBeenCalledWith({ currentUser: null });
    expect(updateDocMock).toHaveBeenCalledWith('document-ref', { email: 'person@example.com' });
  });
});

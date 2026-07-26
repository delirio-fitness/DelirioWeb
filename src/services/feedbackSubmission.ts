import { signInAnonymously } from 'firebase/auth';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { getFirebaseServices } from './firebaseClient';

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

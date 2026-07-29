import type { FieldValue } from 'firebase/firestore';

/**
 * WarmNetwork schema: Simplified warm lead collection for footer-only wishlist opt-ins.
 * These are create-only documents that capture minimal contact information.
 */
export type WarmNetworkLead = {
  email: string;
  TimeSTamp: number;
  createdAt: FieldValue;
  ownerUid: string;
  browserID: string;
  source: 'delirio-website-wishlist';
};

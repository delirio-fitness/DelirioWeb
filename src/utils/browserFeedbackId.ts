import { createClientId } from './createClientId';

const STORAGE_KEY = 'delirio_feedback_browser_id';

export function getBrowserFeedbackId() {
  try {
    const existingId = window.localStorage.getItem(STORAGE_KEY);
    if (existingId) return existingId;

    const browserId = createClientId();
    window.localStorage.setItem(STORAGE_KEY, browserId);
    return browserId;
  } catch {
    return createClientId();
  }
}

/**
 * Microsoft Clarity Module
 *
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  NO API KEY. NO SUBSCRIPTION.                                            ║
 * ║                                                                          ║
 * ║  Microsoft Clarity is 100% free forever.                                 ║
 * ║  It only needs a FREE public "Project ID" (not a secret).                ║
 * ║                                                                          ║
 * ║  THE SINGLE MOST OBVIOUS PLACE TO PUT IT:                                ║
 * ║      src/modules/clarity/config.ts                                       ║
 * ║                                                                          ║
 * ║  Look for the line:                                                      ║
 * ║      export const CLARITY_PROJECT_ID = '';                               ║
 * ║                                                                          ║
 * ║  Paste your Project ID there.                                            ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

export {
  initClarity,
  isClarityInitialized,
  getClarityProjectId,
  getClarity,
} from './clarity';

// Also re-export the config constants so it's obvious where the ID lives.
export { CLARITY_PROJECT_ID, HAS_CLARITY_PROJECT_ID } from './config';

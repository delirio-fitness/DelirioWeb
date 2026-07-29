import { useEffect, useState } from 'react';

const TYPE_DELAY_MS = 90;
const DELETE_DELAY_MS = 55;
const HOLD_DELAY_MS = 1700;
const NEXT_WORD_DELAY_MS = 260;

type TypewriterState = {
  wordIndex: number;
  characterCount: number;
  isDeleting: boolean;
};

function prefersReducedMotion() {
  return typeof window !== 'undefined'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Types, holds, and deletes audience-tested hero terms without shifting layout. */
export function HeroTypewriterWord({ words }: { words: readonly string[] }) {
  const [state, setState] = useState<TypewriterState>({
    wordIndex: 0,
    characterCount: words[0].length,
    isDeleting: false,
  });

  useEffect(() => {
    if (prefersReducedMotion()) return;

    const word = words[state.wordIndex];
    let delay = TYPE_DELAY_MS;

    if (!state.isDeleting && state.characterCount === word.length) delay = HOLD_DELAY_MS;
    else if (state.isDeleting && state.characterCount > 0) delay = DELETE_DELAY_MS;
    else if (state.isDeleting) delay = NEXT_WORD_DELAY_MS;

    const timer = window.setTimeout(() => {
      setState((current) => {
        const currentWord = words[current.wordIndex];
        if (!current.isDeleting && current.characterCount === currentWord.length) {
          return { ...current, isDeleting: true };
        }
        if (current.isDeleting && current.characterCount > 0) {
          return { ...current, characterCount: current.characterCount - 1 };
        }
        if (current.isDeleting) {
          return {
            wordIndex: (current.wordIndex + 1) % words.length,
            characterCount: 0,
            isDeleting: false,
          };
        }
        return { ...current, characterCount: current.characterCount + 1 };
      });
    }, delay);

    return () => window.clearTimeout(timer);
  }, [state, words]);

  const activeWord = words[state.wordIndex].slice(0, state.characterCount);
  return <span className="d3-hero-typewriter" aria-hidden="true">{activeWord}</span>;
}

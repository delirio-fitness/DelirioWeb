import { useEffect, useRef } from 'react';

export function ConfirmDialog({
  open,
  coachName,
  variant = 'switch',
  onCancel,
  onConfirm,
}: {
  open: boolean;
  coachName?: string;
  variant?: 'switch' | 'coach-picker';
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const cancelRef = useRef<HTMLButtonElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    cancelRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCancel();
        return;
      }
      if (event.key !== 'Tab') return;
      const focusable = Array.from(dialogRef.current?.querySelectorAll<HTMLElement>('button, [href], [tabindex]:not([tabindex="-1"])') ?? []);
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      previousFocus?.focus();
    };
  }, [onCancel, open]);

  if (!open) return null;

  return (
    <div className="d3-dialog-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onCancel()}>
      <div ref={dialogRef} className="d3-dialog" role="alertdialog" aria-modal="true" aria-labelledby="switch-title" aria-describedby="switch-description">
        <p className="d3-dialog-kicker">Start fresh</p>
        <h2 id="switch-title">{variant === 'coach-picker' ? 'Choose a different coach?' : `Switch to ${coachName}?`}</h2>
        <p id="switch-description">Changing coaches ends the current voice session and clears this website preview’s conversation.</p>
        <div className="d3-dialog-actions">
          <button ref={cancelRef} className="is-secondary" type="button" onClick={onCancel}>Keep current coach</button>
          <button type="button" onClick={onConfirm}>{variant === 'coach-picker' ? 'Choose another coach' : 'Switch coach'}</button>
        </div>
      </div>
    </div>
  );
}

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { ConfirmDialog } from './ConfirmDialog';

function DialogHarness() {
  const [open, setOpen] = useState(false);
  return <><button type="button" onClick={() => setOpen(true)}>Choose Iris</button><ConfirmDialog open={open} coachName="Iris" onCancel={() => setOpen(false)} onConfirm={() => setOpen(false)} /></>;
}

describe('ConfirmDialog', () => {
  it('describes destructive switching and supports cancel and confirm', async () => {
    const user = userEvent.setup();
    const onCancel = jest.fn();
    const onConfirm = jest.fn();
    render(<ConfirmDialog open coachName="Iris" onCancel={onCancel} onConfirm={onConfirm} />);

    expect(screen.getByRole('alertdialog')).toHaveTextContent(/clears this website preview’s conversation/i);
    await user.click(screen.getByRole('button', { name: /keep current coach/i }));
    expect(onCancel).toHaveBeenCalledTimes(1);
    await user.click(screen.getByRole('button', { name: /switch coach/i }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('traps keyboard focus and restores it to the invoking control', async () => {
    const user = userEvent.setup();
    render(<DialogHarness />);
    const trigger = screen.getByRole('button', { name: /choose iris/i });
    await user.click(trigger);
    const cancel = screen.getByRole('button', { name: /keep current coach/i });
    const confirm = screen.getByRole('button', { name: /switch coach/i });
    expect(cancel).toHaveFocus();
    await user.tab({ shift: true });
    expect(confirm).toHaveFocus();
    await user.keyboard('{Escape}');
    expect(trigger).toHaveFocus();
  });
});

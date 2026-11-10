import type { ReactNode } from 'react';

interface Props {
  open: boolean;
  leaving?: boolean;
  instant?: boolean;
  back: ReactNode;
  front: ReactNode;
}

export default function FlipCard({ open, leaving = false, instant = false, back, front }: Props) {
  return (
    <div className={`flip-card${open ? ' is-open' : ''}${leaving ? ' is-leaving' : ''}${instant ? ' is-instant' : ''}`}>
      <div className="flip-card-inner">
        <div className="flip-face flip-back" aria-hidden={open}>{back}</div>
        <div className="flip-face flip-front" aria-hidden={!open}>{front}</div>
      </div>
    </div>
  );
}

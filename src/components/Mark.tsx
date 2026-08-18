import rawMark from '../assets/mark.svg?raw';

// Rende il marchio scalabile: sostituisce le dimensioni fisse con il 100%.
const markSvg = rawMark.replace('width="512" height="512"', 'width="100%" height="100%"');

interface MarkProps {
  readonly size?: number;
  readonly className?: string | undefined;
}

/**
 * Il marchio a mosaico di Tessera, inline (sopravvive al build single-file).
 * Una tessera composta da sei tessere, una per modalità.
 */
export function Mark({ size = 72, className }: MarkProps): React.JSX.Element {
  return (
    <span
      className={className}
      style={{ display: 'inline-block', width: size, height: size, lineHeight: 0 }}
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: markSvg }}
    />
  );
}

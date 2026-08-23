import { Fragment } from 'react';

/** Renders a translated string, turning literal "\n" into <br/> line breaks. */
export function TransBreak({ text }: { text: string }) {
  const lines = text.split('\n');
  return (
    <>
      {lines.map((line, i) => (
        <Fragment key={i}>
          {i > 0 && <br />}
          {line}
        </Fragment>
      ))}
    </>
  );
}

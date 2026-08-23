import { useCustomCursor } from '../../hooks/useCustomCursor';

export function CustomCursor() {
  const { cursorRef, followerRef } = useCustomCursor();

  return (
    <>
      <div className="cursor" id="cursor" ref={cursorRef} aria-hidden="true" />
      <div className="cursor-follower" id="cursor-follower" ref={followerRef} aria-hidden="true" />
    </>
  );
}

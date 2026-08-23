export function throttle<A extends unknown[]>(fn: (...args: A) => void, wait = 16) {
  let last = 0;
  return (...args: A) => {
    const now = Date.now();
    if (now - last >= wait) {
      last = now;
      fn(...args);
    }
  };
}

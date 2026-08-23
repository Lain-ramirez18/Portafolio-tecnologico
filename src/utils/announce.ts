/** Announces the target section's heading to screen readers after an in-page nav jump. */
export function announceSection(href: string) {
  const target = document.querySelector(href);
  if (!target) return;
  const title = target.querySelector('.section-title, .hero-title');
  const live = document.getElementById('live-region');
  if (live && title?.textContent) live.textContent = title.textContent;
}

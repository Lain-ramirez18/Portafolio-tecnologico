import { lazy, Suspense, useEffect, useState } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { LangProvider, useLang } from './i18n/LangContext';
import { SoundProvider } from './contexts/SoundContext';
import { ToastProvider } from './contexts/ToastContext';
import { DialogsProvider, useDialogs, type DialogState } from './contexts/DialogsContext';

import { ScrollProgressBar } from './components/layout/ScrollProgressBar';
import { CustomCursor } from './components/layout/CustomCursor';
import { Navbar } from './components/layout/Navbar';
import { BottomBar } from './components/layout/BottomBar';
import { Footer } from './components/layout/Footer';
import { BackToTop } from './components/layout/BackToTop';

import { Hero } from './components/sections/Hero';
import { About } from './components/sections/About';
import { Skills } from './components/sections/Skills';
import { Projects } from './components/sections/Projects';
import { Contact } from './components/sections/Contact';

// NOTE: Skills/Projects/Contact were briefly made React.lazy (code-split, Suspense-wrapped)
// to shrink the initial hydration bundle. Reverted — Astro's React SSR resolves a Suspense
// boundary that needs real content at build time via React's *streaming* SSR APIs, which emit
// per-build dynamic inline `<script>` "segment replacement" tags ($RS/$RC/$RV, React-internal).
// Their content isn't stable across builds, so it can't be hash-pinned in this project's strict
// CSP (script-src: only 3 fixed sha256 hashes, no 'unsafe-inline', no nonce — output:'static'
// has no per-request server to mint one). The CSP correctly blocks them, which stops the
// replacement script from ever swapping the real content in, and React's hydrator then throws
// "error #419" and discards the SSR'd DOM to re-render that whole subtree client-side from
// scratch — strictly worse than not code-splitting at all. The dialogs below don't hit this:
// they render `null` during SSR (never opened yet at build time), so no Suspense boundary ever
// needs resolving during the static build — their lazy-loading only ever resolves client-side,
// which streaming SSR is never involved in. Confirmed via a CDP Audits.issueAdded capture
// against a real throttled load: 5 blocked ContentSecurityPolicyIssues, one per $RS/$RB/$RV
// script, plus the "Minified React error #419" pageerror — gone once reverted to eager imports.

import { ToastContainer } from './components/ui/ToastContainer';
import { PwaUpdater } from './components/PwaUpdater';

import { useCardTilt } from './hooks/useCardTilt';
import { useSmartPrefetch } from './hooks/useSmartPrefetch';

// Dialogs are code-split: their chunks are only fetched once the visitor actually opens one,
// keeping the initial bundle lean. See useEverOpenedDialogs below for the mount-once strategy.
const CvDialog = lazy(() => import('./components/dialogs/CvDialog').then((m) => ({ default: m.CvDialog })));
const AITerminalDialog = lazy(() =>
  import('./components/dialogs/AITerminalDialog').then((m) => ({ default: m.AITerminalDialog })),
);
const ProjectDetailDialog = lazy(() =>
  import('./components/dialogs/ProjectDetailDialog').then((m) => ({ default: m.ProjectDetailDialog })),
);
const CertViewerDialog = lazy(() =>
  import('./components/dialogs/CertViewerDialog').then((m) => ({ default: m.CertViewerDialog })),
);
const LiveDemoDialog = lazy(() =>
  import('./components/dialogs/LiveDemoDialog').then((m) => ({ default: m.LiveDemoDialog })),
);

/** Tracks which dialogs have ever been opened, so each one mounts (and its chunk loads) on first
 *  open and then stays mounted — closing must not reset in-dialog state like terminal history.
 *  Uses the "adjust state during render" pattern (compare against a mirrored previous prop) so
 *  no effect/setState-in-effect cascade is needed — see https://react.dev/learn/you-might-not-need-an-effect. */
function useEverOpenedDialogs(currentName: DialogState['name']) {
  const [everOpened, setEverOpened] = useState<Set<DialogState['name']>>(() => new Set());
  const [prevName, setPrevName] = useState(currentName);

  if (currentName !== prevName) {
    setPrevName(currentName);
    if (currentName !== null && !everOpened.has(currentName)) {
      setEverOpened((prev) => new Set(prev).add(currentName));
    }
  }

  return everOpened;
}

/** Clickjacking defense: if somehow framed, break out (X-Frame-Options/frame-ancestors already
 *  cover this server-side — this is defense-in-depth for cached/edge-served copies). */
function useClickjackingGuard() {
  useEffect(() => {
    if (window.top !== window.self) {
      try {
        window.top!.location.href = window.self.location.href;
      } catch {
        /* cross-origin — can't break out, nothing more to do */
      }
    }
  }, []);
}

function SkipLink() {
  const { t } = useLang();
  return (
    <a href="#main-content" className="skip-link">
      {t('nav.skip')}
    </a>
  );
}

function PageContent() {
  useCardTilt();
  useSmartPrefetch();
  useClickjackingGuard();

  const { state } = useDialogs();
  const everOpened = useEverOpenedDialogs(state.name);

  return (
    <>
      <SkipLink />
      <CustomCursor />
      <ScrollProgressBar />
      <Navbar />

      <main id="main-content">
        <Hero />
        <About />
        <Skills />
        <Projects />
        <Contact />
      </main>

      <BottomBar />
      <Footer />
      <BackToTop />

      <Suspense fallback={null}>
        {everOpened.has('cv') && <CvDialog />}
        {everOpened.has('terminal') && <AITerminalDialog />}
        {everOpened.has('project') && <ProjectDetailDialog />}
        {everOpened.has('cert') && <CertViewerDialog />}
        {everOpened.has('demo') && <LiveDemoDialog />}
      </Suspense>
      <ToastContainer />
      <PwaUpdater />

      {/* Screen-reader announcer for in-page section navigation */}
      <div id="live-region" aria-live="polite" aria-atomic="true" className="sr-only" />
    </>
  );
}

export function App() {
  return (
    <ThemeProvider>
      <LangProvider>
        <SoundProvider>
          <ToastProvider>
            <DialogsProvider>
              <PageContent />
            </DialogsProvider>
          </ToastProvider>
        </SoundProvider>
      </LangProvider>
    </ThemeProvider>
  );
}

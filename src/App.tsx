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

// Below-the-fold sections are code-split (React.lazy), not hydrated as separate Astro islands —
// they stay inside the single client:idle App tree, so ThemeContext/LangContext/SoundContext/
// ToastContext/DialogsContext are still shared unbroken across the whole page. This only shrinks
// what's eagerly bundled/executed in the initial hydration commit; Astro's SSR still resolves
// each Suspense boundary at build time, so the sections' real content ships in the static HTML
// exactly as before (verified: id="skills"/"projects"/"contact" and real item text present in
// `dist/index.html`) — nothing here is gated behind client JS that wasn't already gated before.
const Skills = lazy(() => import('./components/sections/Skills').then((m) => ({ default: m.Skills })));
const Projects = lazy(() => import('./components/sections/Projects').then((m) => ({ default: m.Projects })));
const Contact = lazy(() => import('./components/sections/Contact').then((m) => ({ default: m.Contact })));

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
        <Suspense fallback={null}>
          <Skills />
          <Projects />
          <Contact />
        </Suspense>
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

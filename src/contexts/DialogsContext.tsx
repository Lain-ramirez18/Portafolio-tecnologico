import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import type { Project } from '../data/projects';

interface CertPayload {
  url: string | null;
  title: string;
  issuer: string;
}

interface DemoPayload {
  url: string;
  title: string;
}

export type DialogState =
  | { name: null }
  | { name: 'cv' }
  | { name: 'terminal' }
  | { name: 'project'; projectId: Project['id'] }
  | { name: 'cert'; cert: CertPayload }
  | { name: 'demo'; demo: DemoPayload };

interface DialogsContextValue {
  state: DialogState;
  openCv: () => void;
  openTerminal: () => void;
  openProject: (projectId: Project['id']) => void;
  openCert: (cert: CertPayload) => void;
  openDemo: (demo: DemoPayload) => void;
  close: () => void;
}

const DialogsContext = createContext<DialogsContextValue | null>(null);

export function DialogsProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DialogState>({ name: null });

  const close = useCallback(() => setState({ name: null }), []);
  const openCv = useCallback(() => setState({ name: 'cv' }), []);
  const openTerminal = useCallback(() => setState({ name: 'terminal' }), []);
  const openProject = useCallback((projectId: Project['id']) => setState({ name: 'project', projectId }), []);
  const openCert = useCallback((cert: CertPayload) => setState({ name: 'cert', cert }), []);
  const openDemo = useCallback((demo: DemoPayload) => setState({ name: 'demo', demo }), []);

  const value = useMemo(
    () => ({ state, openCv, openTerminal, openProject, openCert, openDemo, close }),
    [state, openCv, openTerminal, openProject, openCert, openDemo, close],
  );

  return <DialogsContext.Provider value={value}>{children}</DialogsContext.Provider>;
}

export function useDialogs(): DialogsContextValue {
  const ctx = useContext(DialogsContext);
  if (!ctx) throw new Error('useDialogs must be used within a DialogsProvider');
  return ctx;
}

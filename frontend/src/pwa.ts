/**
 * Progressive-web-app plumbing: service-worker registration and the
 * install prompt lifecycle.
 */
import { useCallback, useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

let deferredPrompt: BeforeInstallPromptEvent | null = null;
const listeners = new Set<(event: BeforeInstallPromptEvent | null) => void>();

function publish(event: BeforeInstallPromptEvent | null) {
  deferredPrompt = event;
  listeners.forEach((fn) => fn(event));
}

export function isStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

export function isIOS(): boolean {
  const ua = window.navigator.userAgent;
  return /iPad|iPhone|iPod/.test(ua) || (ua.includes('Mac') && navigator.maxTouchPoints > 1);
}

/** iOS Safari never fires beforeinstallprompt, so it needs manual instructions. */
export function needsManualInstall(): boolean {
  return isIOS() && !isStandalone();
}

export function registerServiceWorker(): void {
  if (!('serviceWorker' in navigator)) return;
  if (import.meta.env.DEV) return; // keep dev server free of stale-cache surprises

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.warn('[pwa] service worker registration failed', err);
    });
  });
}

export interface InstallPromptState {
  /** The native prompt is available and can be triggered. */
  canPrompt: boolean;
  /** iOS device: show "Share > Add to Home Screen" instructions instead. */
  manual: boolean;
  promptInstall: () => Promise<'accepted' | 'dismissed' | 'unavailable'>;
}

const DISMISSED_KEY = 'zesa:install-dismissed';
const INSTALLED_KEY = 'zesa:installed';

export function markInstalled(): void {
  try {
    localStorage.setItem(INSTALLED_KEY, '1');
  } catch {
    /* storage unavailable (private mode) */
  }
}

export function shouldShowInstallPrompt(): boolean {
  try {
    if (localStorage.getItem(INSTALLED_KEY)) return false;
    if (localStorage.getItem(DISMISSED_KEY)) return false;
  } catch {
    /* ignore */
  }
  return !isStandalone();
}

function rememberDismissal(): void {
  try {
    localStorage.setItem(DISMISSED_KEY, '1');
  } catch {
    /* ignore */
  }
}

/** Call when the user explicitly declines, so the prompt does not come back. */
export function dismissInstallPrompt(): void {
  rememberDismissal();
}

/**
 * Listens for `beforeinstallprompt` so the UI can offer installation with its own
 * button instead of the browser's unstyled mini-infobar.
 */
export function useInstallPrompt(): InstallPromptState {
  const [canPrompt, setCanPrompt] = useState(() => deferredPrompt !== null);
  const manual = needsManualInstall();

  useEffect(() => {
    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      publish(event as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      markInstalled();
      publish(null);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('appinstalled', onInstalled);

    const unsubscribe = (event: BeforeInstallPromptEvent | null) => setCanPrompt(event !== null);
    listeners.add(unsubscribe);

    // A prompt captured before this component mounted.
    setCanPrompt(deferredPrompt !== null);

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onInstalled);
      listeners.delete(unsubscribe);
    };
  }, []);

  const promptInstall = useCallback(async () => {
    const event = deferredPrompt;
    if (!event) return 'unavailable' as const;

    // The event is single-use; clear it so we do not offer a dead button.
    publish(null);
    await event.prompt();
    const { outcome } = await event.userChoice;
    if (outcome !== 'accepted') rememberDismissal();
    return outcome;
  }, []);

  return { canPrompt, manual, promptInstall };
}
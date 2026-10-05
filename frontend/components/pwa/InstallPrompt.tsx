import React, { useEffect, useState } from 'react';
import { dismissInstallPrompt, markInstalled, useInstallPrompt } from '../../src/pwa';

interface InstallPromptProps {
  /** Delay before the card slides in, so it never competes with first paint. */
  delay?: number;
  /** Auto-hide after this many ms. Set to 0 to keep it until the user acts. */
  autoHide?: number;
}

/**
 * Install call-to-action. Uses the browser's own `beforeinstallprompt` where it
 * exists (Android/Chromium/Edge) and falls back to manual instructions on iOS,
 * which has no programmatic prompt.
 */
const InstallPrompt: React.FC<InstallPromptProps> = ({ delay = 1500, autoHide = 20000 }) => {
  const { canPrompt, manual, promptInstall } = useInstallPrompt();
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);

  // Eligible: either the browser offered a real prompt, or we are on iOS.
  const eligible = canPrompt || manual;

  useEffect(() => {
    if (!eligible) return;
    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, [eligible, delay]);

  const close = () => {
    setLeaving(true);
    setTimeout(() => setVisible(false), 300);
  };

  useEffect(() => {
    if (!visible || !autoHide) return;
    const timer = setTimeout(() => {
      dismissInstallPrompt();
      close();
    }, autoHide);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, autoHide]);

  const handleInstall = async () => {
    const outcome = await promptInstall();
    if (outcome === 'accepted') {
      markInstalled();
      close();
    } else {
      dismissInstallPrompt();
      close();
    }
  };

  const handleDismiss = () => {
    dismissInstallPrompt();
    close();
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Install the Fault Management System app"
      className={`fixed z-50 left-3 right-3 bottom-3 sm:left-auto sm:right-6 sm:bottom-6 sm:w-96 transition-all duration-300 ${
        leaving ? 'translate-y-6 opacity-0' : 'translate-y-0 opacity-100'
      }`}
    >
      <div
        className="flex items-start gap-3 p-4 rounded-2xl border backdrop-blur-md"
        style={{
          backgroundColor: 'rgba(2, 9, 29, 0.97)',
          borderColor: 'rgba(254, 208, 0, 0.45)',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.6), 0 0 24px rgba(254, 208, 0, 0.15)',
        }}
      >
        <img
          src="/icons/icon-192.png"
          alt=""
          width={44}
          height={44}
          className="w-11 h-11 shrink-0 rounded-xl"
        />

        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-white leading-tight">Add ZESA Faults to your home screen</p>
          <p className="text-xs text-gray-400 mt-1 leading-relaxed">
            {canPrompt
              ? 'Run it full screen and open fault reports faster, even when the signal drops.'
              : 'Tap the Share button in Safari, then choose "Add to Home Screen".'}
          </p>

          <div className="flex items-center gap-2 mt-3">
            {canPrompt && (
              <button
                onClick={handleInstall}
                className="px-3 py-1.5 rounded-lg text-xs font-bold transition-transform hover:scale-105 active:scale-95"
                style={{ backgroundColor: '#fed000', color: '#0a0a0f' }}
              >
                INSTALL
              </button>
            )}
            <button
              onClick={handleDismiss}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-300 hover:text-white transition-colors"
              style={{ border: '1px solid rgba(113, 145, 216, 0.3)' }}
            >
              Not now
            </button>
          </div>
        </div>

        <button
          onClick={handleDismiss}
          aria-label="Dismiss install prompt"
          className="shrink-0 p-1 rounded text-gray-500 hover:text-white transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default InstallPrompt;
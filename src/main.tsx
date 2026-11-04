import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { trackSystemError } from './lib/analytics.ts';
import { lazy, Suspense } from 'react';
import { isPasswordRecoveryUrl } from './lib/passwordRecovery';

const recovering = isPasswordRecoveryUrl(window.location.href);
const recoveryLinkError = new URLSearchParams(window.location.hash.slice(1)).has('error');
const PasswordRecovery = lazy(() => import('./components/PasswordRecovery'));

if (typeof window !== 'undefined' && !recovering) {
  window.onerror = (message, source, lineno, colno, error) => {
    const errorMsg = typeof message === 'string' ? message : error?.message || 'Global Window Error';
    const errorStack = error?.stack || `at ${source}:${lineno}:${colno}`;
    trackSystemError(errorMsg, errorStack);
  };

  window.onunhandledrejection = (event) => {
    const reason = event.reason;
    const errorMsg = reason instanceof Error ? reason.message : String(reason || 'Unhandled Promise Rejection');
    const errorStack = reason instanceof Error ? reason.stack : undefined;
    trackSystemError(errorMsg, errorStack);
  };
}

const root = document.getElementById('root')!;
if (recovering) root.classList.add('app-mounted');
createRoot(root).render(recovering ? <Suspense fallback={<p dir="rtl" role="status">جارِ التحقق من رابط الاستعادة…</p>}><PasswordRecovery invalidLink={recoveryLinkError} /></Suspense> : <App />);


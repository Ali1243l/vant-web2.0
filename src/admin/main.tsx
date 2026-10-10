import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { trackSystemError } from '../lib/analytics.ts';

if (typeof window !== 'undefined') {
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

createRoot(document.getElementById('root')!).render(<App />);

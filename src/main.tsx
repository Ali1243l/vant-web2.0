import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { installErrorTracking } from './lib/analytics.ts';
import { lazy, Suspense } from 'react';
import { isPasswordRecoveryUrl } from './lib/passwordRecovery';
import StoreErrorBoundary from './components/StoreErrorBoundary';

const recovering = isPasswordRecoveryUrl(window.location.href);
const recoveryLinkError = new URLSearchParams(window.location.hash.slice(1)).has('error');
const PasswordRecovery = lazy(() => import('./components/PasswordRecovery'));

installErrorTracking();

const root = document.getElementById('root')!;
if (recovering) root.classList.add('app-mounted');
createRoot(root).render(<StoreErrorBoundary>{recovering ? <Suspense fallback={<p dir="rtl" role="status">جارِ التحقق من رابط الاستعادة…</p>}><PasswordRecovery invalidLink={recoveryLinkError} /></Suspense> : <App />}</StoreErrorBoundary>);


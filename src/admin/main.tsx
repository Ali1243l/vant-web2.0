import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { installErrorTracking } from '../lib/analytics.ts';
import StoreErrorBoundary from '../components/StoreErrorBoundary';

installErrorTracking();

createRoot(document.getElementById('root')!).render(<StoreErrorBoundary><App /></StoreErrorBoundary>);

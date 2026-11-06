import { Component, type ErrorInfo, type ReactNode } from 'react';
import { trackSystemError } from '../lib/analytics/tracker';

export default class StoreErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error: Error, info: ErrorInfo) {
    trackSystemError(error.message, error.stack, { kind: 'react', componentStack: info.componentStack || '' });
  }
  render() {
    if (!this.state.failed) return this.props.children;
    const ar = document.documentElement.lang !== 'en';
    return <main dir={ar ? 'rtl' : 'ltr'} className="min-h-screen grid place-items-center bg-[#0d0f12] p-6 text-white"><div className="max-w-sm space-y-5 text-center"><p className="font-bold tracking-[.3em]">VANT</p><h1 className="text-xl font-bold">{ar ? 'تعذّر عرض الصفحة هسه' : 'This page could not load'}</h1><p className="text-sm leading-7 text-slate-300">{ar ? 'صار خلل أثناء العرض. جرّب تحديث الصفحة، وإذا يتكرر تواصل ويانا.' : 'Something interrupted the page. Try refreshing, or contact us if it happens again.'}</p><button type="button" className="min-h-11 rounded-xl bg-blue-600 px-6 font-bold" onClick={() => window.location.reload()}>{ar ? 'تحديث الصفحة' : 'Refresh page'}</button></div></main>;
  }
}

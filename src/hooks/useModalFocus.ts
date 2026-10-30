import { useLayoutEffect, useRef, type RefObject } from 'react';

const layers: symbol[] = [];

export function useModalFocus(open: boolean, panel: RefObject<HTMLElement | null>, onEscape: () => void, initialFocus?: RefObject<HTMLElement | null>) {
  const escape = useRef(onEscape);
  const trigger = useRef<HTMLElement | null>(null);
  escape.current = onEscape;
  useLayoutEffect(() => {
    if (open) return;
    const rememberTrigger = (event: MouseEvent) => { trigger.current = (event.target as Element)?.closest<HTMLElement>('button, a[href], [role="button"]') || null; };
    document.addEventListener('click', rememberTrigger, true);
    return () => document.removeEventListener('click', rememberTrigger, true);
  }, [open]);
  useLayoutEffect(() => {
    if (!open || !panel.current) return;
    const layer = Symbol();
    layers.push(layer);
    const previous = document.activeElement === document.body ? trigger.current : document.activeElement as HTMLElement | null;
    const root = panel.current;
    const active = () => layers[layers.length - 1] === layer;
    const elements = () => Array.from(root.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), a[href], [tabindex="0"]')).filter(el => el.getClientRects().length && !el.closest('[inert], [aria-hidden="true"]'));
    const focus = () => (elements()[0] || root).focus();
    const keydown = (event: KeyboardEvent) => {
      if (!active()) return;
      if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); escape.current(); }
      if (event.key !== 'Tab') return;
      const items = elements(), first = items[0], last = items[items.length - 1];
      if (!first) { event.preventDefault(); root.focus(); }
      else if (!root.contains(document.activeElement) || (!event.shiftKey && document.activeElement === last)) { event.preventDefault(); first.focus(); }
      else if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    };
    const focusin = (event: FocusEvent) => { if (active() && !root.contains(event.target as Node)) focus(); };
    (initialFocus?.current || elements()[0] || root).focus();
    document.addEventListener('keydown', keydown, true);
    document.addEventListener('focusin', focusin);
    return () => {
      const wasActive = active();
      layers.splice(layers.indexOf(layer), 1);
      document.removeEventListener('keydown', keydown, true);
      document.removeEventListener('focusin', focusin);
      const underneath = layers[layers.length - 1];
      // React restores DOM focus during commit; return to the trigger afterwards.
      if (wasActive) queueMicrotask(() => { if (layers[layers.length - 1] === underneath && previous?.isConnected) previous.focus(); });
    };
  }, [open, panel, initialFocus]);
}

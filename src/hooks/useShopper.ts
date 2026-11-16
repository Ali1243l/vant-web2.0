import { useEffect, useSyncExternalStore } from 'react';
import { shopperClient } from '../lib/supabase';
import { createShopperStore } from '../lib/shopperStore';
import { trackSystemError } from '../lib/analytics/tracker';
import { shopperSessionRequest, shopperSessionEpoch, broadcastShopperSession } from '../lib/shopperSession';

const report = (error: unknown, operation: string) => trackSystemError(error instanceof Error ? error.message : 'Shopping operation failed', '', { kind: 'save', operation });
let instance: ReturnType<typeof createShopperStore> | undefined;
export function getShopperStore() {
  return instance ||= createShopperStore({ getItem: key => localStorage.getItem(key), setItem: (key, value) => localStorage.setItem(key, value) }, async (owner, operations) => {
    return shopperSessionRequest('sync', { owner, operations });
  }, report);
}
export function useShopper() {
  const store = getShopperStore();
  return { ...useSyncExternalStore(store.subscribe, store.getSnapshot), store };
}
export function useShopperLifecycle() {
  useEffect(() => {
    const store = getShopperStore();
    store.restoreCachedOwner();
    let active = true, checking = false, exchanging = false, exchangedToken = '';
    const refresh = async () => {
      if (document.hidden || checking || exchanging || navigator.onLine === false) return;
      checking = true;
      const version = shopperSessionEpoch();
      try {
        const result = await shopperSessionRequest();
        if (!active || version !== shopperSessionEpoch()) return;
        if (store.getSnapshot().owner !== result.owner) await store.activate(result.owner);
        else await store.refresh();
      } catch (error) { report(error, 'shopper-session'); }
      finally { checking = false; }
    };
    const offline = () => store.offline();
    const storage = (event: StorageEvent) => { store.externalUpdate(event.key); if (event.key === 'vant_customer_session_event') void refresh(); };
    const exchange = async (token?: string) => {
      if (!token || exchangedToken === token || exchanging) return;
      exchanging = true; exchangedToken = token;
      const version = shopperSessionEpoch() + 1;
      try { const result = await shopperSessionRequest('exchange', { refreshToken: token }); if (active && version === shopperSessionEpoch()) { await store.activate(result.owner); broadcastShopperSession(); } }
      catch (error) { exchangedToken = ''; if (active) store.sessionError(); report(error, 'shopper-session-exchange'); }
      finally { exchanging = false; }
    };
    void shopperClient?.auth.getSession().then(async ({ data, error }) => {
      if (error) report(error, 'shopper-session');
      if (active && data.session) await exchange(data.session.refresh_token);
      else if (active) await refresh();
    }).catch(error => report(error, 'shopper-session'));
    if (!shopperClient) void refresh();
    const auth = shopperClient?.auth.onAuthStateChange((_event, session) => {
      setTimeout(() => { if (active && session) void exchange(session.refresh_token); }, 0);
    });
    window.addEventListener('online', refresh); window.addEventListener('offline', offline);
    window.addEventListener('storage', storage);
    window.addEventListener('shopper-session-change', refresh);
    window.addEventListener('focus', refresh); document.addEventListener('visibilitychange', refresh);
    const poll = setInterval(() => { if (store.getSnapshot().owner) void refresh(); }, 30000);
    return () => { active = false; auth?.data.subscription.unsubscribe(); clearInterval(poll); window.removeEventListener('shopper-session-change', refresh); window.removeEventListener('online', refresh); window.removeEventListener('offline', offline); window.removeEventListener('focus', refresh); window.removeEventListener('storage', storage); document.removeEventListener('visibilitychange', refresh); };
  }, []);
}

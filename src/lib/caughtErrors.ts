type Reporter = (error: unknown, operation: string) => void;
let reporter: Reporter | undefined, reporting = false;
export const setCaughtErrorReporter = (next: Reporter) => { reporter = next; };
export function reportCaughtError(error: unknown, operation: string): void {
  if (reporting) return;
  reporting = true;
  try {
    if (reporter) reporter(error, operation);
    else console.warn(`[VANT] ${operation}: ${error instanceof Error ? error.name : 'Error'}`);
  } catch { console.warn('[VANT] Error reporting unavailable'); }
  finally { reporting = false; }
}

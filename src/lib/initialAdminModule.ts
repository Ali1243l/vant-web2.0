export function staleAdminModule(message: string): boolean {
  return /failed to fetch dynamically imported module|importing a module script failed|error loading dynamically imported module|loading chunk .+ failed/i.test(message);
}

/** Only for the two entry modules, before an admin editor exists. Never reload active edits. */
export async function initialAdminModule<T>(load: () => Promise<T>): Promise<T> {
  try { return await load(); }
  catch (error) {
    if (!(error instanceof Error) || !staleAdminModule(error.message) || document.querySelector('[data-admin-ready]')) throw error;
    try {
      const previous = Number(sessionStorage.getItem('vant_admin_module_refresh') || 0);
      if (Date.now() - previous < 60000) throw error;
      sessionStorage.setItem('vant_admin_module_refresh', String(Date.now()));
    } catch { throw error; }
    const url = new URL(window.location.href);
    url.searchParams.set('admin', '');
    window.history.replaceState(window.history.state, '', url);
    window.location.reload();
    return new Promise<T>(() => {});
  }
}

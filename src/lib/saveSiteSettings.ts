import type { SiteSettings } from '../context/siteControlsTypes';

export async function saveSettingsRow(client: any, id: string | number | undefined, settings: SiteSettings) {
  const { data, error } = await client.from('site_settings').upsert({ id: id ?? 1, settings, updated_at: new Date().toISOString() }, { onConflict: 'id' }).select('id,settings').maybeSingle();
  if (error || !data) throw new Error(error?.message || 'Settings save was not acknowledged');
  return data;
}

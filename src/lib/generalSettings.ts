import type { SiteSettings } from '../context/siteControlsTypes';
export const generalSettingsKeys = ['maintenance_mode', 'maintenance_message_ar', 'maintenance_message', 'loading_text_ar', 'loading_text_en', 'splash_motif'] as const;
export function generalSettingsPatch(draft: SiteSettings, base: SiteSettings): Partial<SiteSettings> {
  return Object.fromEntries(generalSettingsKeys.filter(key => draft[key] !== base[key]).map(key => [key, draft[key]]));
}
export function validGeneralSettings(draft: SiteSettings): boolean {
  return ['print_press', 'tshirt_print', 'embroidery', 'hanger', 'needle_thread', 'mannequin', 'monogram', 'scissors'].includes(draft.splash_motif || '') &&
    [draft.loading_text_ar, draft.loading_text_en].every(text => typeof text === 'string' && text.trim().length > 0 && text.length <= 120) &&
    (!draft.maintenance_mode || [draft.maintenance_message_ar, draft.maintenance_message].every(text => typeof text === 'string' && text.trim().length > 0 && text.length <= 600));
}

import test from 'node:test';
import assert from 'node:assert/strict';
import { saveSettingsRow } from '../src/lib/saveSiteSettings.ts';

test('settings use the deployed JSON settings column and require a database acknowledgment', async () => {
  let payload: any;
  let result: any = { data: { id: 'settings', settings: { maintenance_mode: false } }, error: null };
  const client = { from: (table: string) => { assert.equal(table, 'site_settings'); return { upsert: (row: unknown) => { payload = row; return { select: () => ({ maybeSingle: async () => result }) }; } }; } };
  await saveSettingsRow(client, 'settings', { maintenance_mode: false } as any);
  assert.equal(payload.maintenance_mode, undefined);
  assert.deepEqual(payload.settings, { maintenance_mode: false });
  result = { data: null, error: null }; await assert.rejects(saveSettingsRow(client, 'settings', {} as any), /acknowledged/);
  result = { data: null, error: { message: 'denied' } }; await assert.rejects(saveSettingsRow(client, 'settings', {} as any), /denied/);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';
import { renderToStaticMarkup } from 'react-dom/server';

test('admin email preview uses the exported HTML without hiding broken images', async () => {
  const built = await build({ entryPoints: [fileURLToPath(new URL('../src/admin/WelcomeEmailTemplate.tsx', import.meta.url))], bundle: true, write: false, format: 'esm', platform: 'node' });
  const { WelcomeEmailTemplate, generateEmailHtml, defaultCampaignData } = await import('data:text/javascript;base64,' + Buffer.from(built.outputFiles[0].text).toString('base64'));
  const data = { ...defaultCampaignData, headline: 'فانت <اختبار>', heroImage: 'https://example.test/chosen-photo.jpg', ctaUrl: 'https://vant-web.vercel.app/' };
  for (const previewDevice of ['desktop', 'mobile']) {
    const preview = WelcomeEmailTemplate({ data, previewDevice });
    assert.equal(preview.props.children.type, 'iframe');
    assert.equal(preview.props.children.props.srcDoc, generateEmailHtml(data));
    assert.equal(preview.props.children.props.sandbox, '');
    const markup = renderToStaticMarkup(preview);
    assert.ok(markup.includes('title="معاينة محتوى البريد"'));
    assert.ok(!markup.includes('onerror='));
  }
  const html = generateEmailHtml(data);
  assert.ok(html.includes('فانت &lt;اختبار&gt;'));
  assert.ok(html.indexOf(data.preheader) < html.indexOf('<table class="main"'));
});

import { rm } from 'node:fs/promises';

// Fixed project-owned build outputs, independent of the caller's directory.
for (const output of ['dist', 'server.js']) {
  await rm(new URL(`../${output}`, import.meta.url), { recursive: true, force: true });
}

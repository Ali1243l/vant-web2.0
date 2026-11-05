export function splashCanFinish(isPreview: boolean, isLoading: boolean, minimumElapsed: boolean, deadlineElapsed = false): boolean {
  return !isPreview && ((!isLoading && minimumElapsed) || deadlineElapsed);
}

export async function waitForSplashImages(images: readonly HTMLImageElement[], signal: AbortSignal): Promise<void> {
  await Promise.all(images.map(image => new Promise<void>(resolve => {
    const done = () => {
      image.removeEventListener('load', loaded);
      image.removeEventListener('error', done);
      signal.removeEventListener('abort', done);
      resolve();
    };
    const loaded = () => {
      if (typeof image.decode === 'function') image.decode().then(done, done);
      else done();
    };
    if (signal.aborted) { resolve(); return; }
    signal.addEventListener('abort', done, { once: true });
    image.addEventListener('load', loaded, { once: true });
    image.addEventListener('error', done, { once: true });
    if (image.complete) { if (image.naturalWidth > 0) loaded(); else done(); }
  })));
}

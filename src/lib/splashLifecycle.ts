export function splashCanFinish(isPreview: boolean, isLoading: boolean, minimumElapsed: boolean): boolean {
  return !isPreview && !isLoading && minimumElapsed;
}

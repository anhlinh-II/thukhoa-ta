import loadingService from "../services/loadingService";

/**
 * Helper to navigate with global loader shown during navigation.
 * Usage: await navigateWithLoader(router, '/path')
 */
export async function navigateWithLoader(router: any, href: string) {
  try {
    loadingService.show();
    // router.push returns a Promise in next/navigation
    await router.push(href);
  } catch (e) {
    throw e;
  } finally {
    // small timeout to keep overlay until navigation begins
    setTimeout(() => loadingService.hide(), 300);
  }
}

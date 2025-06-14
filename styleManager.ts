// styleManager.ts

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}

function getClassNameForKey(key: string): string {
  return `style-manager-${key}`;
}

function getExistingLinkElementByKey(key: string): HTMLLinkElement | null {
  if (!isBrowser()) return null;
  return document.head.querySelector(`link[rel="stylesheet"].${getClassNameForKey(key)}`);
}

function createLinkElementWithKey(key: string): HTMLLinkElement {
  const linkEl = document.createElement('link');
  linkEl.setAttribute('rel', 'stylesheet');
  linkEl.classList.add(getClassNameForKey(key));
  document.head.appendChild(linkEl);
  return linkEl;
}

function getLinkElementForKey(key: string): HTMLLinkElement | null {
  if (!isBrowser()) return null;
  return getExistingLinkElementByKey(key) || createLinkElementWithKey(key);
}

export const StyleManager = {
  setStyle(key: string, href: string) {
    const linkEl = getLinkElementForKey(key);
    if (linkEl) {
      linkEl.setAttribute('href', href);
    }
  },

  removeStyle(key: string) {
    if (!isBrowser()) return;
    const existingLinkElement = getExistingLinkElementByKey(key);
    if (existingLinkElement) {
      document.head.removeChild(existingLinkElement);
    }
  }
};

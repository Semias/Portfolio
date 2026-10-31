// Ergänzt Browser-APIs, die jsdom nicht mitbringt. Tests können sie mit vi.spyOn gezielt überschreiben.

if (!window.matchMedia) {
  window.matchMedia = (query: string) =>
    ({
      media: query,
      matches: false,
      onchange: null,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      addListener: () => undefined,
      removeListener: () => undefined,
      dispatchEvent: () => false,
    }) as unknown as MediaQueryList;
}

if (!('ResizeObserver' in window)) {
  (window as { ResizeObserver?: unknown }).ResizeObserver = class {
    observe(): void {
      // jsdom hat kein Layout
    }
    unobserve(): void {
      // jsdom hat kein Layout
    }
    disconnect(): void {
      // jsdom hat kein Layout
    }
  };
}

// jsdom meldet window.scrollTo als „not implemented“
window.scrollTo = (() => undefined) as typeof window.scrollTo;

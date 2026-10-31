import { vi } from 'vitest';

export interface MediaController {
  /** Ändert das Ergebnis einer Media-Query und benachrichtigt alle Listener */
  set(query: string, matches: boolean): void;
}

/**
 * Ersetzt window.matchMedia (jsdom kennt es nicht) durch eine steuerbare Variante.
 * Nicht genannte Queries liefern `false`.
 */
export function mockMatchMedia(initial: Record<string, boolean> = {}): MediaController {
  const state = new Map(Object.entries(initial));
  const listeners = new Map<string, Set<(event: MediaQueryListEvent) => void>>();

  vi.spyOn(window, 'matchMedia').mockImplementation((query: string) => {
    const set = listeners.get(query) ?? new Set();
    listeners.set(query, set);
    return {
      media: query,
      get matches() {
        return state.get(query) ?? false;
      },
      onchange: null,
      addEventListener: (_type: string, listener: (event: MediaQueryListEvent) => void) =>
        set.add(listener),
      removeEventListener: (_type: string, listener: (event: MediaQueryListEvent) => void) =>
        set.delete(listener),
      addListener: () => undefined,
      removeListener: () => undefined,
      dispatchEvent: () => false,
    } as unknown as MediaQueryList;
  });

  return {
    set(query, matches) {
      state.set(query, matches);
      listeners
        .get(query)
        ?.forEach((listener) => listener({ matches, media: query } as MediaQueryListEvent));
    },
  };
}

/** „{minutes} min read“, { minutes: 3 } -> „3 min read“. Unbekannte Platzhalter bleiben stehen. */
export function interpolate(text: string, params: Record<string, string | number>): string {
  return text.replace(/\{(\w+)\}/g, (placeholder, key: string) =>
    key in params ? String(params[key]) : placeholder,
  );
}

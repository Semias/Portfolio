/** Klicks mit Zusatztaste oder mittlerer Maustaste öffnen neue Tabs, die lassen wir dem Browser */
export function isModifiedClick(event: MouseEvent): boolean {
  return event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey;
}

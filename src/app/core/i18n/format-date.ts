import { Lang } from './paths';

// Eigene Monatsnamen statt Intl: Build (Node) und Browser liefern sonst je nach ICU-Version
// unterschiedliche Texte, und die vorgerenderte Seite würde beim Laden umspringen.
const MONTHS: Record<Lang, readonly string[]> = {
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  de: ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'],
};

/** „2026-09-12“ -> „Sep 12, 2026“ bzw. „12. Sep 2026“ */
export function formatDate(isoDate: string, lang: Lang): string {
  const [year, month, day] = isoDate.split('-').map(Number);
  const name = MONTHS[lang][month - 1];
  return lang === 'de' ? `${day}. ${name} ${year}` : `${name} ${day}, ${year}`;
}

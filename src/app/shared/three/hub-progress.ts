/**
 * Fortschritt der Kamerafahrt (0–1) aus den Mittelpunkten der Sektionen und der Bildschirmmitte.
 * Steht die Bildschirmmitte zwischen zwei Sektionen, liegt die Kamera anteilig zwischen deren Knoten.
 */
export function hubProgress(centers: readonly number[], viewportCenter: number): number {
  const last = centers.length - 1;
  if (last < 1) return 0;
  if (viewportCenter >= centers[last]) return 1;
  for (let i = 0; i < last; i++) {
    if (viewportCenter >= centers[i] && viewportCenter < centers[i + 1]) {
      return (i + (viewportCenter - centers[i]) / (centers[i + 1] - centers[i])) / last;
    }
  }
  return 0;
}

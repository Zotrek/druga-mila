/**
 * Domyślna data załadunku (pole type=date, YYYY-MM-DD) — jak arkusz-mapa.
 * Pon–pt 00:00–03:59 → dziś; pon–czw od 04:00 → jutro; pt od 04:00 → poniedziałek (+3);
 * sobota → poniedziałek (+2); niedziela → poniedziałek (+1).
 */
export function defaultDateZaladunkuYmd(from: Date = new Date()): string {
  const d = new Date(from);
  const dow = d.getDay();
  const hour = d.getHours();
  if (dow === 6) {
    d.setDate(d.getDate() + 2);
  } else if (dow === 0) {
    d.setDate(d.getDate() + 1);
  } else if (dow === 5) {
    if (hour >= 4) {
      d.setDate(d.getDate() + 3);
    }
  } else {
    const dayOffset = hour >= 0 && hour < 4 ? 0 : 1;
    d.setDate(d.getDate() + dayOffset);
  }
  const y = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${mo}-${day}`;
}

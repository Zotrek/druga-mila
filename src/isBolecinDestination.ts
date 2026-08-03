/**
 * Czy miejsce docelowe = Bolęcin (lustro Apps Script).
 * Match: „Bolęcin”/„Bolecin” lub etykieta „Biosystem” (adres w Bolęcinie).
 */

function normalizeForBolecinMatch(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

/**
 * @param miejsceZrzutu — etykieta UI / kolumna Sheets (np. „Biosystem”)
 * @param miejsceDostawyAdres — opcjonalnie adres z listy podwyko (value)
 */
export function isBolecinDestination(
  miejsceZrzutu: string,
  miejsceDostawyAdres: string = '',
): boolean {
  const combined = normalizeForBolecinMatch(
    `${miejsceZrzutu || ''} ${miejsceDostawyAdres || ''}`,
  );
  if (!combined) {
    return false;
  }
  return combined.includes('bolecin') || combined.includes('biosystem');
}

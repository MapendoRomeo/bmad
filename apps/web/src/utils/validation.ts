/**
 * Valide un email
 */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Valide un numéro de téléphone (format africain)
 */
export function isValidPhone(phone: string): boolean {
  return /^(\+?\d{1,3})?[\s.-]?\d{8,12}$/.test(phone.replace(/\s/g, ''));
}

/**
 * Valide un mot de passe (min 6 caractères)
 */
export function isValidPassword(password: string): boolean {
  return password.length >= 6;
}

/**
 * Vérifie qu'une chaîne n'est pas vide
 */
export function isNotEmpty(value: string | null | undefined): boolean {
  return !!value && value.trim().length > 0;
}

/**
 * Vérifie qu'une date est valide
 */
export function isValidDate(date: string): boolean {
  const d = new Date(date);
  return !isNaN(d.getTime());
}

/**
 * Vérifie qu'une date de fin est après une date de début
 */
export function isDateAfter(dateDebut: string, dateFin: string): boolean {
  return new Date(dateFin) > new Date(dateDebut);
}

/**
 * Formate une date ISO en format français (dd/mm/yyyy)
 */
export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/**
 * Formate une date ISO en format long français (ex: 14 mars 2026)
 */
export function formatDateLong(date: string | Date | null | undefined): string {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Formate un montant en FCFA
 */
export function formatMontant(montant: number | null | undefined): string {
  if (montant === null || montant === undefined) return '-';
  return new Intl.NumberFormat('fr-FR').format(montant) + ' FCFA';
}

/**
 * Formate un pourcentage
 */
export function formatPourcentage(value: number | null | undefined, decimals = 1): string {
  if (value === null || value === undefined) return '-';
  return value.toFixed(decimals) + ' %';
}

/**
 * Formate un nom complet (Nom Prénom)
 */
export function formatNomComplet(nom: string, prenom: string): string {
  return `${nom} ${prenom}`.trim();
}

/**
 * Tronque un texte avec ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

/**
 * Formate un numéro de téléphone
 */
export function formatTelephone(tel: string | null | undefined): string {
  if (!tel) return '-';
  return tel.replace(/(\d{2})(?=\d)/g, '$1 ').trim();
}

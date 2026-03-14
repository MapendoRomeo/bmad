import { Chip, ChipProps } from '@mui/material';

interface StatusConfig {
  label: string;
  color: ChipProps['color'];
}

const STATUS_MAP: Record<string, StatusConfig> = {
  // Eleves
  en_attente: { label: 'En attente', color: 'warning' },
  admis: { label: 'Admis', color: 'success' },
  inscrit: { label: 'Inscrit', color: 'info' },
  desinscrit: { label: 'Désinscrit', color: 'default' },
  // Factures
  brouillon: { label: 'Brouillon', color: 'default' },
  emise: { label: 'Émise', color: 'info' },
  partiellement_payee: { label: 'Partiellement payée', color: 'warning' },
  payee: { label: 'Payée', color: 'success' },
  annulee: { label: 'Annulée', color: 'error' },
  // Présence
  present: { label: 'Présent', color: 'success' },
  absent: { label: 'Absent', color: 'error' },
  retard: { label: 'Retard', color: 'warning' },
  excuse: { label: 'Excusé', color: 'info' },
  // General
  actif: { label: 'Actif', color: 'success' },
  inactif: { label: 'Inactif', color: 'default' },
  active: { label: 'Active', color: 'success' },
  inactive: { label: 'Inactive', color: 'default' },
};

interface StatusBadgeProps {
  status: string;
  size?: 'small' | 'medium';
}

export default function StatusBadge({ status, size = 'small' }: StatusBadgeProps) {
  const config = STATUS_MAP[status] || { label: status, color: 'default' as const };
  return <Chip label={config.label} color={config.color} size={size} />;
}

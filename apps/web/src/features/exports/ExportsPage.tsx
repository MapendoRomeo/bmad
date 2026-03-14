import { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  CircularProgress,
} from '@mui/material';
import {
  People as PeopleIcon,
  Receipt as ReceiptIcon,
  Paid as PaidIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import { showSnackbar } from '../../store/slices/uiSlice';
import api from '../../services/api/client';

interface ExportConfig {
  key: string;
  title: string;
  description: string;
  endpoint: string;
  filename: string;
  icon: React.ReactNode;
  color: string;
}

const EXPORTS: ExportConfig[] = [
  {
    key: 'eleves',
    title: 'Élèves',
    description:
      'Exporter la liste complète des élèves avec leurs informations personnelles, classes et statuts d\'inscription.',
    endpoint: '/exports/eleves',
    filename: 'eleves.xlsx',
    icon: <PeopleIcon sx={{ fontSize: 40 }} />,
    color: '#1B5E7B',
  },
  {
    key: 'factures',
    title: 'Factures',
    description:
      'Exporter toutes les factures avec les détails des élèves, montants, dates d\'émission et statuts de paiement.',
    endpoint: '/exports/factures',
    filename: 'factures.xlsx',
    icon: <ReceiptIcon sx={{ fontSize: 40 }} />,
    color: '#ED6C02',
  },
  {
    key: 'paiements',
    title: 'Paiements',
    description:
      'Exporter l\'historique des paiements avec les modes de règlement, références et factures associées.',
    endpoint: '/exports/paiements',
    filename: 'paiements.xlsx',
    icon: <PaidIcon sx={{ fontSize: 40 }} />,
    color: '#2E7D32',
  },
];

export default function ExportsPage() {
  const dispatch = useDispatch();
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});

  const handleExport = async (config: ExportConfig) => {
    setLoadingStates((prev) => ({ ...prev, [config.key]: true }));
    try {
      const response = await api.get(config.endpoint, {
        responseType: 'blob',
      });

      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', config.filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      dispatch(showSnackbar({ message: `Export "${config.title}" téléchargé avec succès`, severity: 'success' }));
    } catch {
      dispatch(showSnackbar({ message: `Erreur lors de l'export "${config.title}"`, severity: 'error' }));
    } finally {
      setLoadingStates((prev) => ({ ...prev, [config.key]: false }));
    }
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>
        Exports de données
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Téléchargez vos données au format Excel pour les analyser ou les archiver.
      </Typography>

      <Grid container spacing={3}>
        {EXPORTS.map((config) => (
          <Grid item xs={12} sm={6} md={4} key={config.key}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 20px rgba(0,0,0,0.1)',
                },
              }}
            >
              <CardContent sx={{ flexGrow: 1, p: 3 }}>
                <Box
                  sx={{
                    width: 64,
                    height: 64,
                    borderRadius: 3,
                    backgroundColor: `${config.color}14`,
                    color: config.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 2,
                  }}
                >
                  {config.icon}
                </Box>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
                  {config.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {config.description}
                </Typography>
              </CardContent>
              <CardActions sx={{ p: 3, pt: 0 }}>
                <Button
                  variant="contained"
                  startIcon={
                    loadingStates[config.key] ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : (
                      <DownloadIcon />
                    )
                  }
                  onClick={() => handleExport(config)}
                  disabled={loadingStates[config.key]}
                  fullWidth
                  sx={{
                    backgroundColor: config.color,
                    '&:hover': { backgroundColor: config.color, filter: 'brightness(0.9)' },
                  }}
                >
                  {loadingStates[config.key] ? 'Téléchargement...' : 'Exporter en Excel'}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

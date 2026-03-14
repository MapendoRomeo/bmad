import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  TextField,
} from '@mui/material';
import {
  Receipt as ReceiptIcon,
  Paid as PaidIcon,
  TrendingUp as TrendIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useDispatch } from 'react-redux';
import { showSnackbar } from '../../store/slices/uiSlice';
import Loader from '../../components/common/Loader';
import StatCard from '../../components/common/StatCard';
import api from '../../services/api/client';

interface Statistiques {
  totalFacture: number;
  totalPaye: number;
  tauxPaiement: number;
  totalImpaye: number;
}

interface RecetteParType {
  typeFrais: string;
  montantFacture: number;
  montantPaye: number;
}

export default function RapportsPage() {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Statistiques | null>(null);
  const [recettes, setRecettes] = useState<RecetteParType[]>([]);
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(amount);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (dateDebut) params.dateDebut = dateDebut;
      if (dateFin) params.dateFin = dateFin;

      const [statsRes, recettesRes] = await Promise.all([
        api.get('/financier/rapports/statistiques', { params }),
        api.get('/financier/rapports/recettes', { params }),
      ]);
      setStats(statsRes.data);
      setRecettes(recettesRes.data.data || recettesRes.data);
    } catch {
      dispatch(showSnackbar({ message: 'Erreur lors du chargement des rapports', severity: 'error' }));
    } finally {
      setLoading(false);
    }
  }, [dateDebut, dateFin, dispatch]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) return <Loader message="Chargement des rapports..." />;

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} sx={{ mb: 3 }}>
        Rapports Financiers
      </Typography>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6}>
            <TextField
              label="Date début"
              type="date"
              value={dateDebut}
              onChange={(e) => setDateDebut(e.target.value)}
              InputLabelProps={{ shrink: true }}
              size="small"
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Date fin"
              type="date"
              value={dateFin}
              onChange={(e) => setDateFin(e.target.value)}
              InputLabelProps={{ shrink: true }}
              size="small"
              fullWidth
            />
          </Grid>
        </Grid>
      </Paper>

      {stats && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total facturé"
              value={formatCurrency(stats.totalFacture)}
              icon={<ReceiptIcon />}
              color="#1B5E7B"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total payé"
              value={formatCurrency(stats.totalPaye)}
              icon={<PaidIcon />}
              color="#2E7D32"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Taux de paiement"
              value={`${stats.tauxPaiement.toFixed(1)}%`}
              icon={<TrendIcon />}
              color="#ED6C02"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total impayé"
              value={formatCurrency(stats.totalImpaye)}
              icon={<WarningIcon />}
              color="#D32F2F"
            />
          </Grid>
        </Grid>
      )}

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
          Recettes par type de frais
        </Typography>
        {recettes.length === 0 ? (
          <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
            Aucune donnée disponible pour la période sélectionnée
          </Typography>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={recettes} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="typeFrais" tick={{ fontSize: 12 }} />
              <YAxis
                tick={{ fontSize: 12 }}
                tickFormatter={(val: number) =>
                  new Intl.NumberFormat('fr-FR', { notation: 'compact' }).format(val)
                }
              />
              <RechartsTooltip
                formatter={(value: number) => formatCurrency(value)}
                labelStyle={{ fontWeight: 700 }}
              />
              <Legend />
              <Bar
                dataKey="montantFacture"
                name="Facturé"
                fill="#1B5E7B"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="montantPaye"
                name="Payé"
                fill="#2E7D32"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Paper>
    </Box>
  );
}

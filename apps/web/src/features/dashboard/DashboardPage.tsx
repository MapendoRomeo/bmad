import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Alert as MuiAlert,
  Skeleton,
  Chip,
  Divider,
  Paper,
} from '@mui/material';
import {
  People as PeopleIcon,
  MeetingRoom as ClassIcon,
  Person as PersonIcon,
  EventNote as EventNoteIcon,
  Receipt as ReceiptIcon,
  AttachMoney as AttachMoneyIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  NotificationsActive as NotificationsActiveIcon,
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { RootState } from '../../store';
import { showSnackbar } from '../../store/slices/uiSlice';
import api from '../../services/api/client';
import StatCard from '../../components/common/StatCard';

interface DashboardData {
  totalEleves: number;
  totalClasses: number;
  totalEnseignants: number;
  tauxPresence: number;
  facturesImpayees: number;
  montantImpaye: number;
  recettesMois: number;
  recettesMensuelles?: { mois: string; montant: number }[];
}

interface Alerte {
  id: string;
  message: string;
  type: string;
  severite: 'haute' | 'moyenne' | 'basse';
  date: string;
}

const severityMap: Record<string, 'error' | 'warning' | 'info'> = {
  haute: 'error',
  moyenne: 'warning',
  basse: 'info',
};

function formatMontant(value: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export default function DashboardPage() {
  const dispatch = useDispatch();
  const user = useSelector((s: RootState) => s.auth.user);

  const [data, setData] = useState<DashboardData | null>(null);
  const [alertes, setAlertes] = useState<Alerte[]>([]);
  const [loading, setLoading] = useState(true);
  const [alertesLoading, setAlertesLoading] = useState(true);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/dashboard');
      setData(res.data);
    } catch {
      dispatch(
        showSnackbar({
          message: 'Erreur lors du chargement du tableau de bord',
          severity: 'error',
        })
      );
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  const fetchAlertes = useCallback(async () => {
    setAlertesLoading(true);
    try {
      const res = await api.get('/dashboard/alertes');
      setAlertes(Array.isArray(res.data) ? res.data : res.data.alertes || []);
    } catch {
      // Silently fail for alertes - non-critical
    } finally {
      setAlertesLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
    fetchAlertes();
  }, [fetchDashboard, fetchAlertes]);

  const statCards = [
    {
      title: 'Total élèves',
      value: data?.totalEleves ?? 0,
      icon: <PeopleIcon sx={{ fontSize: 28 }} />,
      color: '#1B5E7B',
    },
    {
      title: 'Total classes',
      value: data?.totalClasses ?? 0,
      icon: <ClassIcon sx={{ fontSize: 28 }} />,
      color: '#7B1FA2',
    },
    {
      title: 'Total enseignants',
      value: data?.totalEnseignants ?? 0,
      icon: <PersonIcon sx={{ fontSize: 28 }} />,
      color: '#0288D1',
    },
    {
      title: 'Taux de présence',
      value: data ? `${data.tauxPresence}%` : '0%',
      icon: <EventNoteIcon sx={{ fontSize: 28 }} />,
      color: '#2E7D5B',
    },
    {
      title: 'Factures impayées',
      value: data?.facturesImpayees ?? 0,
      icon: <ReceiptIcon sx={{ fontSize: 28 }} />,
      color: '#ED8A19',
    },
    {
      title: 'Montant impayé',
      value: data ? formatMontant(data.montantImpaye) : formatMontant(0),
      icon: <AttachMoneyIcon sx={{ fontSize: 28 }} />,
      color: '#D32F2F',
    },
    {
      title: 'Recettes du mois',
      value: data ? formatMontant(data.recettesMois) : formatMontant(0),
      icon: <TrendingUpIcon sx={{ fontSize: 28 }} />,
      color: '#2E7D5B',
    },
  ];

  return (
    <Box>
      {/* Welcome Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}>
          Bonjour, {user?.prenom || 'Utilisateur'}
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
          Voici un aperçu de votre établissement
        </Typography>
      </Box>

      {/* Stat Cards Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statCards.map((card) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={card.title}>
            <StatCard
              title={card.title}
              value={card.value}
              icon={card.icon}
              color={card.color}
              loading={loading}
            />
          </Grid>
        ))}
      </Grid>

      {/* Charts and Alerts Row */}
      <Grid container spacing={3}>
        {/* Monthly Revenue Chart */}
        <Grid item xs={12} lg={8}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: 'text.primary' }}>
                Recettes mensuelles
              </Typography>
              {loading ? (
                <Box sx={{ height: 320 }}>
                  <Skeleton variant="rectangular" height={280} sx={{ borderRadius: 2 }} />
                </Box>
              ) : data?.recettesMensuelles && data.recettesMensuelles.length > 0 ? (
                <Box sx={{ height: 320 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={data.recettesMensuelles}
                      margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis
                        dataKey="mois"
                        tick={{ fontSize: 12, fill: '#5A6A85' }}
                        axisLine={{ stroke: '#E0E0E0' }}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 12, fill: '#5A6A85' }}
                        axisLine={{ stroke: '#E0E0E0' }}
                        tickLine={false}
                        tickFormatter={(value: number) =>
                          new Intl.NumberFormat('fr-FR', {
                            notation: 'compact',
                            compactDisplay: 'short',
                          }).format(value)
                        }
                      />
                      <Tooltip
                        formatter={(value: number) => [formatMontant(value), 'Recettes']}
                        contentStyle={{
                          borderRadius: 8,
                          border: 'none',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        }}
                      />
                      <Bar
                        dataKey="montant"
                        fill="#1B5E7B"
                        radius={[6, 6, 0, 0]}
                        maxBarSize={50}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              ) : (
                <Box
                  sx={{
                    height: 320,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    color: 'text.secondary',
                  }}
                >
                  <TrendingUpIcon sx={{ fontSize: 48, mb: 1, opacity: 0.3 }} />
                  <Typography variant="body2">
                    Aucune donnée de recettes disponible
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Alerts Section */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  mb: 2,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <NotificationsActiveIcon sx={{ color: 'primary.main', fontSize: 22 }} />
                  <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
                    Alertes
                  </Typography>
                </Box>
                {!alertesLoading && alertes.length > 0 && (
                  <Chip
                    label={alertes.length}
                    size="small"
                    color="error"
                    sx={{ fontWeight: 600, minWidth: 28 }}
                  />
                )}
              </Box>
              <Divider sx={{ mb: 2 }} />

              {alertesLoading ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {[1, 2, 3].map((i) => (
                    <Skeleton
                      key={i}
                      variant="rectangular"
                      height={56}
                      sx={{ borderRadius: 2 }}
                    />
                  ))}
                </Box>
              ) : alertes.length > 0 ? (
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1.5,
                    maxHeight: 340,
                    overflowY: 'auto',
                    pr: 0.5,
                    '&::-webkit-scrollbar': { width: 4 },
                    '&::-webkit-scrollbar-thumb': {
                      backgroundColor: 'rgba(0,0,0,0.15)',
                      borderRadius: 2,
                    },
                  }}
                >
                  {alertes.map((alerte) => (
                    <MuiAlert
                      key={alerte.id}
                      severity={severityMap[alerte.severite] || 'info'}
                      variant="outlined"
                      icon={<WarningIcon fontSize="small" />}
                      sx={{
                        borderRadius: 2,
                        '& .MuiAlert-message': {
                          width: '100%',
                        },
                      }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          width: '100%',
                        }}
                      >
                        <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary', flex: 1 }}>
                          {alerte.message}
                        </Typography>
                      </Box>
                      {alerte.date && (
                        <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5, display: 'block' }}>
                          {new Date(alerte.date).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </Typography>
                      )}
                    </MuiAlert>
                  ))}
                </Box>
              ) : (
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    textAlign: 'center',
                    backgroundColor: 'rgba(46, 125, 91, 0.06)',
                    borderRadius: 2,
                  }}
                >
                  <NotificationsActiveIcon
                    sx={{ fontSize: 40, color: 'success.main', mb: 1, opacity: 0.5 }}
                  />
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Aucune alerte en cours
                  </Typography>
                </Paper>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

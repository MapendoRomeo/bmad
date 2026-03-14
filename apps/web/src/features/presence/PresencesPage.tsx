import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Checkbox,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { fr } from 'date-fns/locale';
import { Save as SaveIcon } from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import { showSnackbar } from '../../store/slices/uiSlice';
import Loader from '../../components/common/Loader';
import api from '../../services/api/client';

interface Classe {
  id: string;
  nom: string;
}

interface Eleve {
  id: string;
  nom: string;
  prenom: string;
}

interface PresenceRow {
  eleveId: string;
  nom: string;
  prenom: string;
  present: boolean;
}

interface Stats {
  tauxPresence: number;
  plusAbsents: { nom: string; prenom: string; absences: number }[];
}

function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export default function PresencesPage() {
  const dispatch = useDispatch();
  const [classes, setClasses] = useState<Classe[]>([]);
  const [selectedClasse, setSelectedClasse] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [presences, setPresences] = useState<PresenceRow[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingInit, setLoadingInit] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await api.get('/classes');
        setClasses(res.data.data || res.data);
      } catch {
        dispatch(showSnackbar({ message: 'Erreur lors du chargement des classes', severity: 'error' }));
      } finally {
        setLoadingInit(false);
      }
    };
    fetchClasses();
  }, [dispatch]);

  const fetchPresences = useCallback(async () => {
    if (!selectedClasse) return;
    setLoading(true);
    try {
      const dateStr = formatDate(selectedDate);
      const res = await api.get(`/presences/classe/${selectedClasse}`, {
        params: { date: dateStr },
      });
      const data = res.data.data || res.data;
      if (Array.isArray(data) && data.length > 0 && data[0].eleve) {
        setPresences(
          data.map((item: { eleve: Eleve; present: boolean }) => ({
            eleveId: item.eleve.id,
            nom: item.eleve.nom,
            prenom: item.eleve.prenom,
            present: item.present,
          })),
        );
      } else if (Array.isArray(data)) {
        setPresences(
          data.map((eleve: Eleve) => ({
            eleveId: eleve.id,
            nom: eleve.nom,
            prenom: eleve.prenom,
            present: true,
          })),
        );
      }
    } catch {
      dispatch(showSnackbar({ message: 'Erreur lors du chargement des présences', severity: 'error' }));
    } finally {
      setLoading(false);
    }
  }, [selectedClasse, selectedDate, dispatch]);

  const fetchStats = useCallback(async () => {
    if (!selectedClasse) return;
    try {
      const res = await api.get(`/presences/classe/${selectedClasse}/statistiques`);
      setStats(res.data);
    } catch {
      setStats(null);
    }
  }, [selectedClasse]);

  useEffect(() => {
    fetchPresences();
    fetchStats();
  }, [fetchPresences, fetchStats]);

  const handleToggle = (eleveId: string) => {
    setPresences((prev) =>
      prev.map((p) => (p.eleveId === eleveId ? { ...p, present: !p.present } : p)),
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.post('/presences', {
        classeId: selectedClasse,
        date: formatDate(selectedDate),
        presences: presences.map((p) => ({
          eleveId: p.eleveId,
          present: p.present,
        })),
      });
      dispatch(showSnackbar({ message: 'Présences enregistrées avec succès', severity: 'success' }));
      fetchStats();
    } catch {
      dispatch(showSnackbar({ message: "Erreur lors de l'enregistrement", severity: 'error' }));
    } finally {
      setSaving(false);
    }
  };

  if (loadingInit) return <Loader message="Chargement..." />;

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} sx={{ mb: 3 }}>
        Gestion des présences
      </Typography>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth size="small">
              <InputLabel>Classe</InputLabel>
              <Select
                value={selectedClasse}
                label="Classe"
                onChange={(e) => setSelectedClasse(e.target.value)}
              >
                {classes.map((c) => (
                  <MenuItem key={c.id} value={c.id}>{c.nom}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
              <DatePicker
                label="Date"
                value={selectedDate}
                onChange={(v) => v && setSelectedDate(v)}
                slotProps={{ textField: { size: 'small', fullWidth: true } }}
              />
            </LocalizationProvider>
          </Grid>
        </Grid>
      </Paper>

      {selectedClasse && (
        loading ? (
          <Loader message="Chargement des présences..." />
        ) : (
          <>
            <TableContainer component={Paper} sx={{ mb: 2 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Nom</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Prénom</TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="center">Présent</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {presences.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} align="center" sx={{ py: 4 }}>
                        <Typography color="text.secondary">Aucun élève dans cette classe</Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    presences.map((p) => (
                      <TableRow key={p.eleveId} hover>
                        <TableCell>{p.nom}</TableCell>
                        <TableCell>{p.prenom}</TableCell>
                        <TableCell align="center">
                          <Checkbox
                            checked={p.present}
                            onChange={() => handleToggle(p.eleveId)}
                            color={p.present ? 'success' : 'error'}
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSave}
              disabled={saving || presences.length === 0}
              sx={{ mb: 4 }}
            >
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </Button>

            {/* Statistiques */}
            {stats && (
              <>
                <Typography variant="h5" fontWeight={700} sx={{ mb: 2 }}>
                  Statistiques de présence
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Card>
                      <CardContent>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          Taux de présence de la classe
                        </Typography>
                        <Typography variant="h3" fontWeight={700} color={stats.tauxPresence >= 80 ? 'success.main' : 'error.main'}>
                          {stats.tauxPresence.toFixed(1)}%
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Card>
                      <CardContent>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          Élèves les plus absents
                        </Typography>
                        {stats.plusAbsents.length === 0 ? (
                          <Typography color="text.secondary">Aucune absence enregistrée</Typography>
                        ) : (
                          <List dense disablePadding>
                            {stats.plusAbsents.map((a, idx) => (
                              <Box key={idx}>
                                {idx > 0 && <Divider />}
                                <ListItem disablePadding sx={{ py: 0.5 }}>
                                  <ListItemText
                                    primary={`${a.nom} ${a.prenom}`}
                                    secondary={`${a.absences} absence${a.absences > 1 ? 's' : ''}`}
                                  />
                                </ListItem>
                              </Box>
                            ))}
                          </List>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </>
            )}
          </>
        )
      )}
    </Box>
  );
}

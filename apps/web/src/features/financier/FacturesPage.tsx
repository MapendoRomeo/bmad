import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TablePagination,
  Tooltip,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Autocomplete,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Visibility as ViewIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import { showSnackbar } from '../../store/slices/uiSlice';
import Loader from '../../components/common/Loader';
import api from '../../services/api/client';

interface Eleve {
  id: string;
  nom: string;
  prenom: string;
}

interface TypeFrais {
  id: string;
  nom: string;
}

interface Facture {
  id: string;
  numero: string;
  eleve: { nom: string; prenom: string };
  typeFrais: { nom: string };
  montant: number;
  dateEmission: string;
  dateEcheance: string;
  statut: string;
}

const STATUT_CONFIG: Record<string, { label: string; color: 'info' | 'success' | 'warning' | 'error' }> = {
  emise: { label: 'Émise', color: 'info' },
  payee: { label: 'Payée', color: 'success' },
  partiellement_payee: { label: 'Partiellement payée', color: 'warning' },
  impayee: { label: 'Impayée', color: 'error' },
};

export default function FacturesPage() {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [factures, setFactures] = useState<Facture[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [statutFilter, setStatutFilter] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [updatingStatuts, setUpdatingStatuts] = useState(false);

  // Create form
  const [eleves, setEleves] = useState<Eleve[]>([]);
  const [typesFrais, setTypesFrais] = useState<TypeFrais[]>([]);
  const [selectedEleve, setSelectedEleve] = useState<Eleve | null>(null);
  const [form, setForm] = useState({
    typeFraisId: '',
    montant: '',
    dateEcheance: '',
    periode: '',
  });

  const fetchFactures = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/financier/factures', {
        params: {
          page: page + 1,
          limit: rowsPerPage,
          search: search || undefined,
          statut: statutFilter || undefined,
        },
      });
      setFactures(res.data.data || res.data);
      setTotal(res.data.total || res.data.length || 0);
    } catch {
      dispatch(showSnackbar({ message: 'Erreur lors du chargement des factures', severity: 'error' }));
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, search, statutFilter, dispatch]);

  useEffect(() => {
    fetchFactures();
  }, [fetchFactures]);

  const handleOpenCreate = async () => {
    setSelectedEleve(null);
    setForm({ typeFraisId: '', montant: '', dateEcheance: '', periode: '' });
    try {
      const [elevesRes, typesRes] = await Promise.all([
        api.get('/eleves', { params: { limit: 1000 } }),
        api.get('/financier/types-frais'),
      ]);
      setEleves(elevesRes.data.data || elevesRes.data);
      setTypesFrais(typesRes.data.data || typesRes.data);
    } catch {
      dispatch(showSnackbar({ message: 'Erreur lors du chargement des données', severity: 'error' }));
    }
    setDialogOpen(true);
  };

  const handleCreate = async () => {
    if (!selectedEleve) return;
    setSaving(true);
    try {
      await api.post('/financier/factures', {
        eleveId: selectedEleve.id,
        typeFraisId: form.typeFraisId,
        montant: parseFloat(form.montant),
        dateEcheance: form.dateEcheance,
        periode: form.periode || undefined,
      });
      dispatch(showSnackbar({ message: 'Facture créée avec succès', severity: 'success' }));
      setDialogOpen(false);
      fetchFactures();
    } catch {
      dispatch(showSnackbar({ message: 'Erreur lors de la création de la facture', severity: 'error' }));
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateStatuts = async () => {
    setUpdatingStatuts(true);
    try {
      await api.post('/financier/factures/update-statuts');
      dispatch(showSnackbar({ message: 'Statuts mis à jour', severity: 'success' }));
      fetchFactures();
    } catch {
      dispatch(showSnackbar({ message: 'Erreur lors de la mise à jour des statuts', severity: 'error' }));
    } finally {
      setUpdatingStatuts(false);
    }
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(amount);

  const formatDateStr = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('fr-FR');
    } catch {
      return dateStr;
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" fontWeight={700}>
          Factures
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleUpdateStatuts}
            disabled={updatingStatuts}
          >
            {updatingStatuts ? 'Mise à jour...' : 'Mettre à jour les statuts'}
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreate}>
            Nouvelle facture
          </Button>
        </Box>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={8}>
            <TextField
              fullWidth
              placeholder="Rechercher par élève..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
              InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} /> }}
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Statut</InputLabel>
              <Select
                value={statutFilter}
                label="Statut"
                onChange={(e) => {
                  setStatutFilter(e.target.value);
                  setPage(0);
                }}
              >
                <MenuItem value="">Tous</MenuItem>
                {Object.entries(STATUT_CONFIG).map(([key, cfg]) => (
                  <MenuItem key={key} value={key}>{cfg.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {loading ? (
        <Loader message="Chargement des factures..." />
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>N°</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Élève</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Type de frais</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">Montant</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Date émission</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Échéance</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="center">Statut</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {factures.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">Aucune facture trouvée</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                factures.map((f) => {
                  const cfg = STATUT_CONFIG[f.statut] || { label: f.statut, color: 'default' as const };
                  return (
                    <TableRow key={f.id} hover>
                      <TableCell>{f.numero}</TableCell>
                      <TableCell>{f.eleve.nom} {f.eleve.prenom}</TableCell>
                      <TableCell>{f.typeFrais.nom}</TableCell>
                      <TableCell align="right">{formatCurrency(f.montant)}</TableCell>
                      <TableCell>{formatDateStr(f.dateEmission)}</TableCell>
                      <TableCell>{formatDateStr(f.dateEcheance)}</TableCell>
                      <TableCell align="center">
                        <Chip label={cfg.label} color={cfg.color} size="small" />
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Voir détails">
                          <IconButton size="small">
                            <ViewIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={total}
            page={page}
            onPageChange={(_, p) => setPage(p)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[5, 10, 25]}
            labelRowsPerPage="Lignes par page"
          />
        </TableContainer>
      )}

      {/* Create dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Nouvelle facture</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Autocomplete
              options={eleves}
              getOptionLabel={(opt) => `${opt.nom} ${opt.prenom}`}
              value={selectedEleve}
              onChange={(_, v) => setSelectedEleve(v)}
              renderInput={(params) => <TextField {...params} label="Élève" required />}
              isOptionEqualToValue={(opt, val) => opt.id === val.id}
            />
            <FormControl fullWidth required>
              <InputLabel>Type de frais</InputLabel>
              <Select
                value={form.typeFraisId}
                label="Type de frais"
                onChange={(e) => setForm({ ...form, typeFraisId: e.target.value })}
              >
                {typesFrais.map((t) => (
                  <MenuItem key={t.id} value={t.id}>{t.nom}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Montant"
              type="number"
              value={form.montant}
              onChange={(e) => setForm({ ...form, montant: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Date d'échéance"
              type="date"
              value={form.dateEcheance}
              onChange={(e) => setForm({ ...form, dateEcheance: e.target.value })}
              InputLabelProps={{ shrink: true }}
              fullWidth
              required
            />
            <TextField
              label="Période"
              value={form.periode}
              onChange={(e) => setForm({ ...form, periode: e.target.value })}
              fullWidth
              placeholder="Ex: 2025-2026 T1"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Annuler</Button>
          <Button
            variant="contained"
            onClick={handleCreate}
            disabled={saving || !selectedEleve || !form.typeFraisId || !form.montant || !form.dateEcheance}
          >
            {saving ? 'Création...' : 'Créer'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

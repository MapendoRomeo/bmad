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
  Grid,
  Autocomplete,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  Chip,
  Card,
  CardContent,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Receipt as ReceiptIcon,
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

interface Paiement {
  id: string;
  date: string;
  eleve: { nom: string; prenom: string };
  montant: number;
  mode: string;
  reference: string;
}

interface FactureImpayee {
  id: string;
  numero: string;
  montant: number;
  resteAPayer: number;
}

interface Recu {
  numero: string;
  date: string;
  eleve: { nom: string; prenom: string };
  montant: number;
  mode: string;
  reference: string;
  factures: { numero: string; montant: number }[];
}

const MODES_PAIEMENT = [
  { value: 'especes', label: 'Espèces' },
  { value: 'cheque', label: 'Chèque' },
  { value: 'virement', label: 'Virement' },
  { value: 'mobile_money', label: 'Mobile Money' },
];

export default function PaiementsPage() {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [paiements, setPaiements] = useState<Paiement[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');

  // Create dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [eleves, setEleves] = useState<Eleve[]>([]);
  const [selectedEleve, setSelectedEleve] = useState<Eleve | null>(null);
  const [facturesImpayees, setFacturesImpayees] = useState<FactureImpayee[]>([]);
  const [selectedFactures, setSelectedFactures] = useState<string[]>([]);
  const [form, setForm] = useState({ montant: '', mode: 'especes' });

  // Receipt dialog
  const [recuDialogOpen, setRecuDialogOpen] = useState(false);
  const [recu, setRecu] = useState<Recu | null>(null);
  const [loadingRecu, setLoadingRecu] = useState(false);

  const fetchPaiements = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/financier/paiements', {
        params: {
          page: page + 1,
          limit: rowsPerPage,
          search: search || undefined,
          dateDebut: dateDebut || undefined,
          dateFin: dateFin || undefined,
        },
      });
      setPaiements(res.data.data || res.data);
      setTotal(res.data.total || res.data.length || 0);
    } catch {
      dispatch(showSnackbar({ message: 'Erreur lors du chargement des paiements', severity: 'error' }));
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, search, dateDebut, dateFin, dispatch]);

  useEffect(() => {
    fetchPaiements();
  }, [fetchPaiements]);

  const handleOpenCreate = async () => {
    setSelectedEleve(null);
    setSelectedFactures([]);
    setFacturesImpayees([]);
    setForm({ montant: '', mode: 'especes' });
    try {
      const res = await api.get('/eleves', { params: { limit: 1000 } });
      setEleves(res.data.data || res.data);
    } catch {
      dispatch(showSnackbar({ message: 'Erreur lors du chargement des élèves', severity: 'error' }));
    }
    setDialogOpen(true);
  };

  const handleEleveChange = async (eleve: Eleve | null) => {
    setSelectedEleve(eleve);
    setSelectedFactures([]);
    setFacturesImpayees([]);
    if (!eleve) return;
    try {
      const res = await api.get(`/financier/factures`, {
        params: { eleveId: eleve.id, statut: 'impayee' },
      });
      const data = res.data.data || res.data;
      setFacturesImpayees(data);
    } catch {
      dispatch(showSnackbar({ message: 'Erreur lors du chargement des factures', severity: 'error' }));
    }
  };

  const handleCreate = async () => {
    if (!selectedEleve) return;
    setSaving(true);
    try {
      await api.post('/financier/paiements', {
        eleveId: selectedEleve.id,
        montant: parseFloat(form.montant),
        mode: form.mode,
        factureIds: selectedFactures.length > 0 ? selectedFactures : undefined,
      });
      dispatch(showSnackbar({ message: 'Paiement enregistré avec succès', severity: 'success' }));
      setDialogOpen(false);
      fetchPaiements();
    } catch {
      dispatch(showSnackbar({ message: "Erreur lors de l'enregistrement du paiement", severity: 'error' }));
    } finally {
      setSaving(false);
    }
  };

  const handleViewRecu = async (paiementId: string) => {
    setLoadingRecu(true);
    setRecuDialogOpen(true);
    setRecu(null);
    try {
      const res = await api.get(`/financier/paiements/${paiementId}/recu`);
      setRecu(res.data);
    } catch {
      dispatch(showSnackbar({ message: 'Erreur lors du chargement du reçu', severity: 'error' }));
      setRecuDialogOpen(false);
    } finally {
      setLoadingRecu(false);
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

  const getModeLabel = (mode: string) => {
    const found = MODES_PAIEMENT.find((m) => m.value === mode);
    return found ? found.label : mode;
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight={700}>
          Paiements
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreate}>
          Nouveau paiement
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              placeholder="Rechercher..."
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
            <TextField
              label="Date début"
              type="date"
              value={dateDebut}
              onChange={(e) => {
                setDateDebut(e.target.value);
                setPage(0);
              }}
              InputLabelProps={{ shrink: true }}
              size="small"
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Date fin"
              type="date"
              value={dateFin}
              onChange={(e) => {
                setDateFin(e.target.value);
                setPage(0);
              }}
              InputLabelProps={{ shrink: true }}
              size="small"
              fullWidth
            />
          </Grid>
        </Grid>
      </Paper>

      {loading ? (
        <Loader message="Chargement des paiements..." />
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Élève</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">Montant</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Mode</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Référence</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paiements.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">Aucun paiement trouvé</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paiements.map((p) => (
                  <TableRow key={p.id} hover>
                    <TableCell>{formatDateStr(p.date)}</TableCell>
                    <TableCell>{p.eleve.nom} {p.eleve.prenom}</TableCell>
                    <TableCell align="right">{formatCurrency(p.montant)}</TableCell>
                    <TableCell>
                      <Chip label={getModeLabel(p.mode)} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>{p.reference || '-'}</TableCell>
                    <TableCell align="right">
                      <Tooltip title="Voir le reçu">
                        <IconButton size="small" onClick={() => handleViewRecu(p.id)}>
                          <ReceiptIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
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

      {/* Create paiement dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Nouveau paiement</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Autocomplete
              options={eleves}
              getOptionLabel={(opt) => `${opt.nom} ${opt.prenom}`}
              value={selectedEleve}
              onChange={(_, v) => handleEleveChange(v)}
              renderInput={(params) => <TextField {...params} label="Élève" required />}
              isOptionEqualToValue={(opt, val) => opt.id === val.id}
            />
            <TextField
              label="Montant"
              type="number"
              value={form.montant}
              onChange={(e) => setForm({ ...form, montant: e.target.value })}
              fullWidth
              required
            />
            <FormControl fullWidth required>
              <InputLabel>Mode de paiement</InputLabel>
              <Select
                value={form.mode}
                label="Mode de paiement"
                onChange={(e) => setForm({ ...form, mode: e.target.value })}
              >
                {MODES_PAIEMENT.map((m) => (
                  <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
            {facturesImpayees.length > 0 && (
              <FormControl fullWidth>
                <InputLabel>Factures à régler</InputLabel>
                <Select
                  multiple
                  value={selectedFactures}
                  label="Factures à régler"
                  onChange={(e) => setSelectedFactures(e.target.value as string[])}
                  renderValue={(selected) =>
                    selected
                      .map((id) => {
                        const f = facturesImpayees.find((fi) => fi.id === id);
                        return f ? f.numero : id;
                      })
                      .join(', ')
                  }
                >
                  {facturesImpayees.map((f) => (
                    <MenuItem key={f.id} value={f.id}>
                      <Checkbox checked={selectedFactures.includes(f.id)} />
                      <ListItemText
                        primary={`${f.numero} - ${formatCurrency(f.resteAPayer || f.montant)}`}
                      />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Annuler</Button>
          <Button
            variant="contained"
            onClick={handleCreate}
            disabled={saving || !selectedEleve || !form.montant}
          >
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Receipt dialog */}
      <Dialog open={recuDialogOpen} onClose={() => setRecuDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Reçu de paiement</DialogTitle>
        <DialogContent>
          {loadingRecu ? (
            <Loader message="Chargement du reçu..." />
          ) : recu ? (
            <Card variant="outlined" sx={{ mt: 1 }}>
              <CardContent>
                <Box sx={{ textAlign: 'center', mb: 2 }}>
                  <Typography variant="h6" fontWeight={700}>
                    Reçu N° {recu.numero}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {formatDateStr(recu.date)}
                  </Typography>
                </Box>

                <Divider sx={{ mb: 2 }} />

                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Élève</Typography>
                    <Typography fontWeight={600}>
                      {recu.eleve.prenom} {recu.eleve.nom}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Mode de paiement</Typography>
                    <Typography fontWeight={600}>{getModeLabel(recu.mode)}</Typography>
                  </Grid>
                </Grid>

                {recu.reference && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">Référence</Typography>
                    <Typography fontWeight={600}>{recu.reference}</Typography>
                  </Box>
                )}

                {recu.factures && recu.factures.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Factures réglées
                    </Typography>
                    {recu.factures.map((f, idx) => (
                      <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                        <Typography variant="body2">{f.numero}</Typography>
                        <Typography variant="body2">{formatCurrency(f.montant)}</Typography>
                      </Box>
                    ))}
                  </Box>
                )}

                <Divider sx={{ mb: 2 }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6" fontWeight={700}>
                    Total payé
                  </Typography>
                  <Typography variant="h6" fontWeight={700} color="success.main">
                    {formatCurrency(recu.montant)}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRecuDialogOpen(false)}>Fermer</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

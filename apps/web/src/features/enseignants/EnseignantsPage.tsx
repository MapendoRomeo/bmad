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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  AssignmentInd as AffectIcon,
} from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import { showSnackbar } from '../../store/slices/uiSlice';
import Loader from '../../components/common/Loader';
import api from '../../services/api/client';

interface Enseignant {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
}

interface Classe {
  id: string;
  nom: string;
}

interface Matiere {
  id: string;
  nom: string;
}

export default function EnseignantsPage() {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [enseignants, setEnseignants] = useState<Enseignant[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEnseignant, setEditingEnseignant] = useState<Enseignant | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [affectationDialogOpen, setAffectationDialogOpen] = useState(false);
  const [affectationEnseignantId, setAffectationEnseignantId] = useState<string | null>(null);
  const [classes, setClasses] = useState<Classe[]>([]);
  const [matieres, setMatieres] = useState<Matiere[]>([]);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({ nom: '', prenom: '', email: '', telephone: '' });
  const [affectationForm, setAffectationForm] = useState({ classeId: '', matiereId: '' });

  const fetchEnseignants = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/enseignants', {
        params: { page: page + 1, limit: rowsPerPage, search: search || undefined },
      });
      setEnseignants(res.data.data || res.data);
      setTotal(res.data.total || res.data.length || 0);
    } catch {
      dispatch(showSnackbar({ message: 'Erreur lors du chargement des enseignants', severity: 'error' }));
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, search, dispatch]);

  useEffect(() => {
    fetchEnseignants();
  }, [fetchEnseignants]);

  const handleOpenCreate = () => {
    setEditingEnseignant(null);
    setForm({ nom: '', prenom: '', email: '', telephone: '' });
    setDialogOpen(true);
  };

  const handleOpenEdit = (enseignant: Enseignant) => {
    setEditingEnseignant(enseignant);
    setForm({
      nom: enseignant.nom,
      prenom: enseignant.prenom,
      email: enseignant.email,
      telephone: enseignant.telephone,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editingEnseignant) {
        await api.put(`/enseignants/${editingEnseignant.id}`, form);
        dispatch(showSnackbar({ message: 'Enseignant modifié avec succès', severity: 'success' }));
      } else {
        await api.post('/enseignants', form);
        dispatch(showSnackbar({ message: 'Enseignant créé avec succès', severity: 'success' }));
      }
      setDialogOpen(false);
      fetchEnseignants();
    } catch {
      dispatch(showSnackbar({ message: 'Erreur lors de la sauvegarde', severity: 'error' }));
    } finally {
      setSaving(false);
    }
  };

  const handleOpenDelete = (id: string) => {
    setDeletingId(id);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await api.delete(`/enseignants/${deletingId}`);
      dispatch(showSnackbar({ message: 'Enseignant supprimé', severity: 'success' }));
      setDeleteDialogOpen(false);
      setDeletingId(null);
      fetchEnseignants();
    } catch {
      dispatch(showSnackbar({ message: 'Erreur lors de la suppression', severity: 'error' }));
    }
  };

  const handleOpenAffectation = async (enseignantId: string) => {
    setAffectationEnseignantId(enseignantId);
    setAffectationForm({ classeId: '', matiereId: '' });
    try {
      const [classesRes, matieresRes] = await Promise.all([
        api.get('/classes'),
        api.get('/matieres'),
      ]);
      setClasses(classesRes.data.data || classesRes.data);
      setMatieres(matieresRes.data.data || matieresRes.data);
    } catch {
      dispatch(showSnackbar({ message: 'Erreur lors du chargement des données', severity: 'error' }));
    }
    setAffectationDialogOpen(true);
  };

  const handleAffectation = async () => {
    if (!affectationEnseignantId || !affectationForm.classeId) return;
    setSaving(true);
    try {
      await api.post(`/enseignants/${affectationEnseignantId}/affectation`, {
        classeId: affectationForm.classeId,
        matiereId: affectationForm.matiereId || undefined,
      });
      dispatch(showSnackbar({ message: 'Affectation enregistrée', severity: 'success' }));
      setAffectationDialogOpen(false);
    } catch {
      dispatch(showSnackbar({ message: "Erreur lors de l'affectation", severity: 'error' }));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight={700}>
          Enseignants
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreate}>
          Nouvel enseignant
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Rechercher un enseignant..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
          InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} /> }}
          size="small"
        />
      </Paper>

      {loading ? (
        <Loader message="Chargement des enseignants..." />
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Nom</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Prénom</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Téléphone</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {enseignants.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">Aucun enseignant trouvé</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                enseignants.map((e) => (
                  <TableRow key={e.id} hover>
                    <TableCell>{e.nom}</TableCell>
                    <TableCell>{e.prenom}</TableCell>
                    <TableCell>{e.email}</TableCell>
                    <TableCell>{e.telephone}</TableCell>
                    <TableCell align="right">
                      <Tooltip title="Modifier">
                        <IconButton size="small" onClick={() => handleOpenEdit(e)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Supprimer">
                        <IconButton size="small" color="error" onClick={() => handleOpenDelete(e.id)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Affectation">
                        <IconButton size="small" color="primary" onClick={() => handleOpenAffectation(e.id)}>
                          <AffectIcon fontSize="small" />
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

      {/* Create / Edit dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingEnseignant ? 'Modifier enseignant' : 'Nouvel enseignant'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Nom"
              value={form.nom}
              onChange={(e) => setForm({ ...form, nom: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Prénom"
              value={form.prenom}
              onChange={(e) => setForm({ ...form, prenom: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Téléphone"
              value={form.telephone}
              onChange={(e) => setForm({ ...form, telephone: e.target.value })}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Annuler</Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saving || !form.nom || !form.prenom || !form.email}
          >
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirmer la suppression</DialogTitle>
        <DialogContent>
          <Typography>Êtes-vous sûr de vouloir supprimer cet enseignant ? Cette action est irréversible.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Annuler</Button>
          <Button variant="contained" color="error" onClick={handleDelete}>
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Affectation dialog */}
      <Dialog open={affectationDialogOpen} onClose={() => setAffectationDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Affectation de l'enseignant</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <FormControl fullWidth required>
              <InputLabel>Classe</InputLabel>
              <Select
                value={affectationForm.classeId}
                label="Classe"
                onChange={(e) => setAffectationForm({ ...affectationForm, classeId: e.target.value })}
              >
                {classes.map((c) => (
                  <MenuItem key={c.id} value={c.id}>{c.nom}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Matière (optionnel)</InputLabel>
              <Select
                value={affectationForm.matiereId}
                label="Matière (optionnel)"
                onChange={(e) => setAffectationForm({ ...affectationForm, matiereId: e.target.value })}
              >
                <MenuItem value="">Aucune</MenuItem>
                {matieres.map((m) => (
                  <MenuItem key={m.id} value={m.id}>{m.nom}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAffectationDialogOpen(false)}>Annuler</Button>
          <Button
            variant="contained"
            onClick={handleAffectation}
            disabled={saving || !affectationForm.classeId}
          >
            {saving ? 'Enregistrement...' : 'Affecter'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

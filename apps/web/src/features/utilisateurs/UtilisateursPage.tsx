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
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import { showSnackbar } from '../../store/slices/uiSlice';
import Loader from '../../components/common/Loader';
import api from '../../services/api/client';

interface Utilisateur {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  role: string;
  actif: boolean;
}

const ROLES = [
  { value: 'super_admin', label: 'Super Admin', color: '#D32F2F' },
  { value: 'admin', label: 'Administrateur', color: '#1B5E7B' },
  { value: 'directeur', label: 'Directeur', color: '#7B1FA2' },
  { value: 'enseignant', label: 'Enseignant', color: '#2E7D32' },
  { value: 'comptable', label: 'Comptable', color: '#ED6C02' },
  { value: 'secretaire', label: 'Secrétaire', color: '#0288D1' },
];

function getRoleConfig(role: string) {
  return ROLES.find((r) => r.value === role) || { value: role, label: role, color: '#757575' };
}

export default function UtilisateursPage() {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [utilisateurs, setUtilisateurs] = useState<Utilisateur[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');

  // Create dialog
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    nom: '',
    prenom: '',
    email: '',
    motDePasse: '',
    role: '',
  });
  const [savingCreate, setSavingCreate] = useState(false);

  // Edit dialog
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Utilisateur | null>(null);
  const [editForm, setEditForm] = useState({
    nom: '',
    prenom: '',
    email: '',
    role: '',
    actif: true,
  });
  const [savingEdit, setSavingEdit] = useState(false);

  // Delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchUtilisateurs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/utilisateurs', {
        params: { page: page + 1, limit: rowsPerPage, search: search || undefined },
      });
      setUtilisateurs(res.data.data || res.data);
      setTotal(res.data.total || res.data.length || 0);
    } catch {
      dispatch(showSnackbar({ message: 'Erreur lors du chargement des utilisateurs', severity: 'error' }));
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, search, dispatch]);

  useEffect(() => {
    fetchUtilisateurs();
  }, [fetchUtilisateurs]);

  // Create handlers
  const handleOpenCreate = () => {
    setCreateForm({ nom: '', prenom: '', email: '', motDePasse: '', role: '' });
    setCreateDialogOpen(true);
  };

  const handleCreate = async () => {
    setSavingCreate(true);
    try {
      await api.post('/utilisateurs', createForm);
      dispatch(showSnackbar({ message: 'Utilisateur créé avec succès', severity: 'success' }));
      setCreateDialogOpen(false);
      fetchUtilisateurs();
    } catch {
      dispatch(showSnackbar({ message: "Erreur lors de la création de l'utilisateur", severity: 'error' }));
    } finally {
      setSavingCreate(false);
    }
  };

  // Edit handlers
  const handleOpenEdit = (user: Utilisateur) => {
    setEditingUser(user);
    setEditForm({
      nom: user.nom,
      prenom: user.prenom,
      email: user.email,
      role: user.role,
      actif: user.actif,
    });
    setEditDialogOpen(true);
  };

  const handleEdit = async () => {
    if (!editingUser) return;
    setSavingEdit(true);
    try {
      await api.put(`/utilisateurs/${editingUser.id}`, editForm);
      dispatch(showSnackbar({ message: 'Utilisateur modifié avec succès', severity: 'success' }));
      setEditDialogOpen(false);
      fetchUtilisateurs();
    } catch {
      dispatch(showSnackbar({ message: 'Erreur lors de la modification', severity: 'error' }));
    } finally {
      setSavingEdit(false);
    }
  };

  // Delete handlers
  const handleOpenDelete = (id: string) => {
    setDeletingId(id);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await api.delete(`/utilisateurs/${deletingId}`);
      dispatch(showSnackbar({ message: 'Utilisateur supprimé', severity: 'success' }));
      setDeleteDialogOpen(false);
      setDeletingId(null);
      fetchUtilisateurs();
    } catch {
      dispatch(showSnackbar({ message: 'Erreur lors de la suppression', severity: 'error' }));
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight={700}>
          Utilisateurs
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreate}>
          Nouvel utilisateur
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Rechercher un utilisateur..."
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
        <Loader message="Chargement des utilisateurs..." />
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Nom</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Prénom</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="center">Rôle</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="center">Statut</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {utilisateurs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">Aucun utilisateur trouvé</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                utilisateurs.map((u) => {
                  const roleConfig = getRoleConfig(u.role);
                  return (
                    <TableRow key={u.id} hover>
                      <TableCell>{u.nom}</TableCell>
                      <TableCell>{u.prenom}</TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell align="center">
                        <Chip
                          label={roleConfig.label}
                          size="small"
                          sx={{
                            backgroundColor: `${roleConfig.color}14`,
                            color: roleConfig.color,
                            fontWeight: 600,
                            borderColor: roleConfig.color,
                          }}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={u.actif ? 'Actif' : 'Inactif'}
                          size="small"
                          color={u.actif ? 'success' : 'default'}
                          variant={u.actif ? 'filled' : 'outlined'}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Modifier">
                          <IconButton size="small" onClick={() => handleOpenEdit(u)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Supprimer">
                          <IconButton size="small" color="error" onClick={() => handleOpenDelete(u.id)}>
                            <DeleteIcon fontSize="small" />
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
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Nouvel utilisateur</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Nom"
              value={createForm.nom}
              onChange={(e) => setCreateForm({ ...createForm, nom: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Prénom"
              value={createForm.prenom}
              onChange={(e) => setCreateForm({ ...createForm, prenom: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Email"
              type="email"
              value={createForm.email}
              onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Mot de passe"
              type="password"
              value={createForm.motDePasse}
              onChange={(e) => setCreateForm({ ...createForm, motDePasse: e.target.value })}
              fullWidth
              required
            />
            <FormControl fullWidth required>
              <InputLabel>Rôle</InputLabel>
              <Select
                value={createForm.role}
                label="Rôle"
                onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}
              >
                {ROLES.map((r) => (
                  <MenuItem key={r.value} value={r.value}>{r.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Annuler</Button>
          <Button
            variant="contained"
            onClick={handleCreate}
            disabled={
              savingCreate ||
              !createForm.nom ||
              !createForm.prenom ||
              !createForm.email ||
              !createForm.motDePasse ||
              !createForm.role
            }
          >
            {savingCreate ? 'Création...' : 'Créer'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Modifier l'utilisateur</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Nom"
              value={editForm.nom}
              onChange={(e) => setEditForm({ ...editForm, nom: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Prénom"
              value={editForm.prenom}
              onChange={(e) => setEditForm({ ...editForm, prenom: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Email"
              type="email"
              value={editForm.email}
              onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              fullWidth
              required
            />
            <FormControl fullWidth required>
              <InputLabel>Rôle</InputLabel>
              <Select
                value={editForm.role}
                label="Rôle"
                onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
              >
                {ROLES.map((r) => (
                  <MenuItem key={r.value} value={r.value}>{r.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControlLabel
              control={
                <Switch
                  checked={editForm.actif}
                  onChange={(e) => setEditForm({ ...editForm, actif: e.target.checked })}
                  color="success"
                />
              }
              label={editForm.actif ? 'Actif' : 'Inactif'}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Annuler</Button>
          <Button
            variant="contained"
            onClick={handleEdit}
            disabled={savingEdit || !editForm.nom || !editForm.prenom || !editForm.email || !editForm.role}
          >
            {savingEdit ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirmer la suppression</DialogTitle>
        <DialogContent>
          <Typography>
            Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Annuler</Button>
          <Button variant="contained" color="error" onClick={handleDelete}>
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

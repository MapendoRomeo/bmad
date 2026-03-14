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
  Tooltip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import { showSnackbar } from '../../store/slices/uiSlice';
import Loader from '../../components/common/Loader';
import api from '../../services/api/client';

interface TypeFrais {
  id: string;
  nom: string;
  description: string;
}

interface Niveau {
  id: string;
  nom: string;
}

interface Classe {
  id: string;
  nom: string;
}

interface MontantFrais {
  id: string;
  typeFrais: { id: string; nom: string };
  niveau: { id: string; nom: string };
  classe?: { id: string; nom: string };
  montant: number;
  echeance: string;
}

export default function ConfigFraisPage() {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [typesFrais, setTypesFrais] = useState<TypeFrais[]>([]);
  const [montants, setMontants] = useState<MontantFrais[]>([]);
  const [niveaux, setNiveaux] = useState<Niveau[]>([]);
  const [classes, setClasses] = useState<Classe[]>([]);

  // Type frais dialog
  const [typeDialogOpen, setTypeDialogOpen] = useState(false);
  const [typeForm, setTypeForm] = useState({ nom: '', description: '' });
  const [savingType, setSavingType] = useState(false);

  // Montant dialog
  const [montantDialogOpen, setMontantDialogOpen] = useState(false);
  const [montantForm, setMontantForm] = useState({
    typeFraisId: '',
    niveauId: '',
    classeId: '',
    montant: '',
    echeance: '',
  });
  const [savingMontant, setSavingMontant] = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [typesRes, montantsRes, niveauxRes, classesRes] = await Promise.all([
        api.get('/financier/types-frais'),
        api.get('/financier/montants-frais'),
        api.get('/niveaux'),
        api.get('/classes'),
      ]);
      setTypesFrais(typesRes.data.data || typesRes.data);
      setMontants(montantsRes.data.data || montantsRes.data);
      setNiveaux(niveauxRes.data.data || niveauxRes.data);
      setClasses(classesRes.data.data || classesRes.data);
    } catch {
      dispatch(showSnackbar({ message: 'Erreur lors du chargement de la configuration', severity: 'error' }));
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleCreateType = async () => {
    setSavingType(true);
    try {
      await api.post('/financier/types-frais', typeForm);
      dispatch(showSnackbar({ message: 'Type de frais créé avec succès', severity: 'success' }));
      setTypeDialogOpen(false);
      setTypeForm({ nom: '', description: '' });
      fetchAll();
    } catch {
      dispatch(showSnackbar({ message: 'Erreur lors de la création du type de frais', severity: 'error' }));
    } finally {
      setSavingType(false);
    }
  };

  const handleDeleteType = async (id: string) => {
    try {
      await api.delete(`/financier/types-frais/${id}`);
      dispatch(showSnackbar({ message: 'Type de frais supprimé', severity: 'success' }));
      fetchAll();
    } catch {
      dispatch(showSnackbar({ message: 'Erreur lors de la suppression', severity: 'error' }));
    }
  };

  const handleCreateMontant = async () => {
    setSavingMontant(true);
    try {
      await api.post('/financier/montants-frais', {
        typeFraisId: montantForm.typeFraisId,
        niveauId: montantForm.niveauId,
        classeId: montantForm.classeId || undefined,
        montant: parseFloat(montantForm.montant),
        echeance: montantForm.echeance,
      });
      dispatch(showSnackbar({ message: 'Montant configuré avec succès', severity: 'success' }));
      setMontantDialogOpen(false);
      setMontantForm({ typeFraisId: '', niveauId: '', classeId: '', montant: '', echeance: '' });
      fetchAll();
    } catch {
      dispatch(showSnackbar({ message: 'Erreur lors de la configuration du montant', severity: 'error' }));
    } finally {
      setSavingMontant(false);
    }
  };

  const handleDeleteMontant = async (id: string) => {
    try {
      await api.delete(`/financier/montants-frais/${id}`);
      dispatch(showSnackbar({ message: 'Montant supprimé', severity: 'success' }));
      fetchAll();
    } catch {
      dispatch(showSnackbar({ message: 'Erreur lors de la suppression', severity: 'error' }));
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

  if (loading) return <Loader message="Chargement de la configuration..." />;

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} sx={{ mb: 3 }}>
        Configuration des frais
      </Typography>

      {/* Types de frais section */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" fontWeight={700}>
            Types de frais
          </Typography>
          <Button
            variant="contained"
            size="small"
            startIcon={<AddIcon />}
            onClick={() => {
              setTypeForm({ nom: '', description: '' });
              setTypeDialogOpen(true);
            }}
          >
            Ajouter
          </Button>
        </Box>

        {typesFrais.length === 0 ? (
          <Typography color="text.secondary" sx={{ py: 2 }}>
            Aucun type de frais configuré
          </Typography>
        ) : (
          <List disablePadding>
            {typesFrais.map((t, idx) => (
              <Box key={t.id}>
                {idx > 0 && <Divider />}
                <ListItem>
                  <ListItemText
                    primary={t.nom}
                    secondary={t.description || 'Aucune description'}
                  />
                  <ListItemSecondaryAction>
                    <Tooltip title="Supprimer">
                      <IconButton edge="end" size="small" color="error" onClick={() => handleDeleteType(t.id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </ListItemSecondaryAction>
                </ListItem>
              </Box>
            ))}
          </List>
        )}
      </Paper>

      {/* Montants section */}
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" fontWeight={700}>
            Montants
          </Typography>
          <Button
            variant="contained"
            size="small"
            startIcon={<AddIcon />}
            onClick={() => {
              setMontantForm({ typeFraisId: '', niveauId: '', classeId: '', montant: '', echeance: '' });
              setMontantDialogOpen(true);
            }}
          >
            Ajouter
          </Button>
        </Box>

        {montants.length === 0 ? (
          <Typography color="text.secondary" sx={{ py: 2 }}>
            Aucun montant configuré
          </Typography>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Type de frais</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Niveau</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Classe</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="right">Montant</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Échéance</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {montants.map((m) => (
                  <TableRow key={m.id} hover>
                    <TableCell>{m.typeFrais.nom}</TableCell>
                    <TableCell>{m.niveau.nom}</TableCell>
                    <TableCell>{m.classe ? m.classe.nom : 'Toutes'}</TableCell>
                    <TableCell align="right">{formatCurrency(m.montant)}</TableCell>
                    <TableCell>{formatDateStr(m.echeance)}</TableCell>
                    <TableCell align="right">
                      <Tooltip title="Supprimer">
                        <IconButton size="small" color="error" onClick={() => handleDeleteMontant(m.id)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Type frais create dialog */}
      <Dialog open={typeDialogOpen} onClose={() => setTypeDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Nouveau type de frais</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Nom"
              value={typeForm.nom}
              onChange={(e) => setTypeForm({ ...typeForm, nom: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Description"
              value={typeForm.description}
              onChange={(e) => setTypeForm({ ...typeForm, description: e.target.value })}
              fullWidth
              multiline
              rows={3}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTypeDialogOpen(false)}>Annuler</Button>
          <Button
            variant="contained"
            onClick={handleCreateType}
            disabled={savingType || !typeForm.nom}
          >
            {savingType ? 'Création...' : 'Créer'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Montant create dialog */}
      <Dialog open={montantDialogOpen} onClose={() => setMontantDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Nouveau montant</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <FormControl fullWidth required>
              <InputLabel>Type de frais</InputLabel>
              <Select
                value={montantForm.typeFraisId}
                label="Type de frais"
                onChange={(e) => setMontantForm({ ...montantForm, typeFraisId: e.target.value })}
              >
                {typesFrais.map((t) => (
                  <MenuItem key={t.id} value={t.id}>{t.nom}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth required>
              <InputLabel>Niveau</InputLabel>
              <Select
                value={montantForm.niveauId}
                label="Niveau"
                onChange={(e) => setMontantForm({ ...montantForm, niveauId: e.target.value })}
              >
                {niveaux.map((n) => (
                  <MenuItem key={n.id} value={n.id}>{n.nom}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Classe (optionnel)</InputLabel>
              <Select
                value={montantForm.classeId}
                label="Classe (optionnel)"
                onChange={(e) => setMontantForm({ ...montantForm, classeId: e.target.value })}
              >
                <MenuItem value="">Toutes les classes</MenuItem>
                {classes.map((c) => (
                  <MenuItem key={c.id} value={c.id}>{c.nom}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Montant"
              type="number"
              value={montantForm.montant}
              onChange={(e) => setMontantForm({ ...montantForm, montant: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Échéance"
              type="date"
              value={montantForm.echeance}
              onChange={(e) => setMontantForm({ ...montantForm, echeance: e.target.value })}
              InputLabelProps={{ shrink: true }}
              fullWidth
              required
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMontantDialogOpen(false)}>Annuler</Button>
          <Button
            variant="contained"
            onClick={handleCreateMontant}
            disabled={
              savingMontant ||
              !montantForm.typeFraisId ||
              !montantForm.niveauId ||
              !montantForm.montant ||
              !montantForm.echeance
            }
          >
            {savingMontant ? 'Création...' : 'Créer'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

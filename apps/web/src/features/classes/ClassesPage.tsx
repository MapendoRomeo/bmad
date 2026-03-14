import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  InputLabel,
  LinearProgress,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import api from '../../services/api/client';
import { showSnackbar } from '../../store/slices/uiSlice';
import Loader from '../../components/common/Loader';

interface Classe {
  id: string;
  nom: string;
  niveau: string;
  effectifActuel: number;
  effectifMax: number;
}

interface AnneeScolaire {
  id: string;
  libelle: string;
}

interface CreateClasseForm {
  nom: string;
  niveau: string;
  effectifMax: string;
  anneeScolaireId: string;
}

const NIVEAUX = [
  'Petite Section',
  'Moyenne Section',
  'Grande Section',
  'CP',
  'CE1',
  'CE2',
  'CM1',
  'CM2',
  '6ème',
  '5ème',
  '4ème',
  '3ème',
  '2nde',
  '1ère',
  'Terminale',
];

export default function ClassesPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [classes, setClasses] = useState<Classe[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterNiveau, setFilterNiveau] = useState('tous');

  // Create dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [annees, setAnnees] = useState<AnneeScolaire[]>([]);
  const [createForm, setCreateForm] = useState<CreateClasseForm>({
    nom: '',
    niveau: '',
    effectifMax: '',
    anneeScolaireId: '',
  });
  const [createLoading, setCreateLoading] = useState(false);

  const fetchClasses = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (filterNiveau !== 'tous') params.niveau = filterNiveau;

      const { data } = await api.get<{ data: Classe[] }>('/classes', { params });
      setClasses(data.data);
    } catch {
      dispatch(showSnackbar({ message: 'Erreur lors du chargement des classes', severity: 'error' }));
    } finally {
      setLoading(false);
    }
  }, [filterNiveau, dispatch]);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  const openCreateDialog = async () => {
    try {
      const { data } = await api.get<{ data: AnneeScolaire[] }>('/annees-scolaires');
      setAnnees(data.data);
    } catch {
      dispatch(showSnackbar({ message: 'Erreur lors du chargement des années scolaires', severity: 'error' }));
    }
    setCreateForm({ nom: '', niveau: '', effectifMax: '', anneeScolaireId: '' });
    setDialogOpen(true);
  };

  const handleCreateChange = (field: keyof CreateClasseForm, value: string) => {
    setCreateForm((prev) => ({ ...prev, [field]: value }));
  };

  const isCreateValid =
    createForm.nom.trim() !== '' &&
    createForm.niveau !== '' &&
    createForm.effectifMax !== '' &&
    parseInt(createForm.effectifMax, 10) > 0 &&
    createForm.anneeScolaireId !== '';

  const handleCreate = async () => {
    if (!isCreateValid) return;
    setCreateLoading(true);
    try {
      await api.post('/classes', {
        nom: createForm.nom.trim(),
        niveau: createForm.niveau,
        effectifMax: parseInt(createForm.effectifMax, 10),
        anneeScolaireId: createForm.anneeScolaireId,
      });
      dispatch(showSnackbar({ message: 'Classe créée avec succès', severity: 'success' }));
      setDialogOpen(false);
      fetchClasses();
    } catch {
      dispatch(showSnackbar({ message: 'Erreur lors de la création de la classe', severity: 'error' }));
    } finally {
      setCreateLoading(false);
    }
  };

  const getCapacityColor = (current: number, max: number): 'success' | 'warning' | 'error' => {
    const ratio = max > 0 ? current / max : 0;
    if (ratio >= 0.9) return 'error';
    if (ratio >= 0.7) return 'warning';
    return 'success';
  };

  const filteredClasses = classes;

  // Extract unique niveaux from the loaded classes for the filter dropdown
  const niveauxPresents = Array.from(new Set(classes.map((c) => c.niveau))).sort();

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight={700}>
          Gestion des Classes
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={openCreateDialog}
          sx={{ textTransform: 'none', borderRadius: 2 }}
        >
          Nouvelle classe
        </Button>
      </Box>

      {/* Filter */}
      <Box sx={{ mb: 3 }}>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Niveau</InputLabel>
          <Select
            value={filterNiveau}
            label="Niveau"
            onChange={(e) => setFilterNiveau(e.target.value)}
          >
            <MenuItem value="tous">Tous les niveaux</MenuItem>
            {niveauxPresents.map((n) => (
              <MenuItem key={n} value={n}>
                {n}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Classes grid */}
      {loading ? (
        <Loader message="Chargement des classes..." />
      ) : filteredClasses.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography color="text.secondary">Aucune classe trouvée</Typography>
        </Box>
      ) : (
        <Grid container spacing={2.5}>
          {filteredClasses.map((classe) => {
            const capacityPercent = classe.effectifMax > 0
              ? Math.round((classe.effectifActuel / classe.effectifMax) * 100)
              : 0;
            const capacityColor = getCapacityColor(classe.effectifActuel, classe.effectifMax);

            return (
              <Grid item xs={12} sm={6} md={4} lg={3} key={classe.id}>
                <Card
                  sx={{
                    borderRadius: 2,
                    height: '100%',
                    transition: 'box-shadow 0.2s',
                    '&:hover': { boxShadow: 4 },
                  }}
                >
                  <CardActionArea
                    onClick={() => navigate(`/classes/${classe.id}`)}
                    sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
                  >
                    <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <Typography variant="h6" fontWeight={700} sx={{ mb: 0.5 }}>
                        {classe.nom}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {classe.niveau}
                      </Typography>

                      <Box sx={{ mt: 'auto' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="body2" fontWeight={500}>
                            Effectif
                          </Typography>
                          <Typography variant="body2" fontWeight={600} color={`${capacityColor}.main`}>
                            {classe.effectifActuel}/{classe.effectifMax}
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={Math.min(capacityPercent, 100)}
                          color={capacityColor}
                          sx={{ height: 8, borderRadius: 4 }}
                        />
                      </Box>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Create class dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>Nouvelle classe</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
            <TextField
              label="Nom de la classe"
              value={createForm.nom}
              onChange={(e) => handleCreateChange('nom', e.target.value)}
              fullWidth
              required
              placeholder="Ex: CP-A"
            />
            <FormControl fullWidth required>
              <InputLabel>Niveau</InputLabel>
              <Select
                value={createForm.niveau}
                label="Niveau"
                onChange={(e) => handleCreateChange('niveau', e.target.value)}
              >
                {NIVEAUX.map((n) => (
                  <MenuItem key={n} value={n}>
                    {n}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Effectif maximum"
              type="number"
              value={createForm.effectifMax}
              onChange={(e) => handleCreateChange('effectifMax', e.target.value)}
              fullWidth
              required
              inputProps={{ min: 1 }}
            />
            <FormControl fullWidth required>
              <InputLabel>Année scolaire</InputLabel>
              <Select
                value={createForm.anneeScolaireId}
                label="Année scolaire"
                onChange={(e) => handleCreateChange('anneeScolaireId', e.target.value)}
              >
                {annees.map((a) => (
                  <MenuItem key={a.id} value={a.id}>
                    {a.libelle}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)} sx={{ textTransform: 'none' }}>
            Annuler
          </Button>
          <Button
            variant="contained"
            onClick={handleCreate}
            disabled={!isCreateValid || createLoading}
            sx={{ textTransform: 'none', borderRadius: 2 }}
          >
            {createLoading ? 'Création...' : 'Créer la classe'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Typography,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  CheckCircle as AdmitIcon,
  School as ClassIcon,
  SwapHoriz as TransferIcon,
  PersonOff as DesinscriptionIcon,
} from '@mui/icons-material';
import api from '../../services/api/client';
import { showSnackbar } from '../../store/slices/uiSlice';
import Loader from '../../components/common/Loader';

interface Parent {
  id: string;
  nom: string;
  telephone: string;
  email: string;
  adresse: string;
}

interface ClasseAffectation {
  id: string;
  classe: { id: string; nom: string; niveau: string };
  dateDebut: string;
  dateFin?: string | null;
}

interface EleveDetail {
  id: string;
  numeroEleve: string;
  nom: string;
  prenom: string;
  dateNaissance: string;
  sexe: string;
  statut: 'inscrit' | 'admis' | 'desinscrit';
  parents: Parent[];
  affectations: ClasseAffectation[];
}

interface ClasseOption {
  id: string;
  nom: string;
  niveau: string;
}

const statutColors: Record<string, 'info' | 'success' | 'default'> = {
  inscrit: 'info',
  admis: 'success',
  desinscrit: 'default',
};

const statutLabels: Record<string, string> = {
  inscrit: 'Inscrit',
  admis: 'Admis',
  desinscrit: 'Désinscrit',
};

function TabPanel({ children, value, index }: { children: React.ReactNode; value: number; index: number }) {
  return value === index ? <Box sx={{ pt: 3 }}>{children}</Box> : null;
}

export default function EleveDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [eleve, setEleve] = useState<EleveDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [tabIndex, setTabIndex] = useState(0);

  // Affectation dialog
  const [affectDialogOpen, setAffectDialogOpen] = useState(false);
  const [classes, setClasses] = useState<ClasseOption[]>([]);
  const [selectedClasseId, setSelectedClasseId] = useState('');
  const [affectLoading, setAffectLoading] = useState(false);

  const fetchEleve = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get<EleveDetail>(`/eleves/${id}`);
      setEleve(data);
    } catch {
      dispatch(showSnackbar({ message: "Erreur lors du chargement de l'élève", severity: 'error' }));
    } finally {
      setLoading(false);
    }
  }, [id, dispatch]);

  useEffect(() => {
    fetchEleve();
  }, [fetchEleve]);

  const handleAdmettre = async () => {
    try {
      await api.patch(`/eleves/${id}/admettre`);
      dispatch(showSnackbar({ message: 'Élève admis avec succès', severity: 'success' }));
      fetchEleve();
    } catch {
      dispatch(showSnackbar({ message: "Erreur lors de l'admission", severity: 'error' }));
    }
  };

  const handleDesinscrire = async () => {
    try {
      await api.patch(`/eleves/${id}/desinscrire`);
      dispatch(showSnackbar({ message: 'Élève désinscrit', severity: 'success' }));
      fetchEleve();
    } catch {
      dispatch(showSnackbar({ message: 'Erreur lors de la désinscription', severity: 'error' }));
    }
  };

  const handleTransferer = async () => {
    try {
      await api.post(`/eleves/${id}/transfert`);
      dispatch(showSnackbar({ message: 'Transfert initié avec succès', severity: 'success' }));
      fetchEleve();
    } catch {
      dispatch(showSnackbar({ message: 'Erreur lors du transfert', severity: 'error' }));
    }
  };

  const openAffectDialog = async () => {
    try {
      const { data } = await api.get<{ data: ClasseOption[] }>('/classes');
      setClasses(data.data);
      setSelectedClasseId('');
      setAffectDialogOpen(true);
    } catch {
      dispatch(showSnackbar({ message: 'Erreur lors du chargement des classes', severity: 'error' }));
    }
  };

  const handleAffectation = async () => {
    if (!selectedClasseId) return;
    setAffectLoading(true);
    try {
      await api.post(`/eleves/${id}/affectation`, { classeId: selectedClasseId });
      dispatch(showSnackbar({ message: 'Affectation réussie', severity: 'success' }));
      setAffectDialogOpen(false);
      fetchEleve();
    } catch {
      dispatch(showSnackbar({ message: "Erreur lors de l'affectation", severity: 'error' }));
    } finally {
      setAffectLoading(false);
    }
  };

  const currentAffectation = eleve?.affectations?.find((a) => !a.dateFin) ?? null;

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  if (loading) return <Loader message="Chargement des informations..." />;
  if (!eleve) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography color="text.secondary">Élève introuvable</Typography>
        <Button onClick={() => navigate('/eleves')} sx={{ mt: 2 }}>
          Retour à la liste
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      {/* Back button */}
      <IconButton onClick={() => navigate('/eleves')} sx={{ mb: 2 }}>
        <BackIcon />
      </IconButton>

      {/* Student header card */}
      <Card sx={{ mb: 3, borderRadius: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
            <Avatar
              sx={{
                width: 80,
                height: 80,
                bgcolor: 'primary.main',
                fontSize: '2rem',
                fontWeight: 700,
              }}
            >
              {eleve.prenom.charAt(0)}
              {eleve.nom.charAt(0)}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 200 }}>
              <Typography variant="h5" fontWeight={700}>
                {eleve.prenom} {eleve.nom}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                N° {eleve.numeroEleve}
              </Typography>
            </Box>
            <Chip
              label={statutLabels[eleve.statut] ?? eleve.statut}
              color={statutColors[eleve.statut] ?? 'default'}
              sx={{ fontWeight: 600, fontSize: '0.9rem', px: 1 }}
            />
          </Box>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Card sx={{ borderRadius: 2 }}>
        <Tabs
          value={tabIndex}
          onChange={(_, v) => setTabIndex(v)}
          sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}
        >
          <Tab label="Informations" />
          <Tab label="Parents" />
          <Tab label="Classe" />
          <Tab label="Actions" />
        </Tabs>

        <CardContent>
          {/* Informations Tab */}
          <TabPanel value={tabIndex} index={0}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Nom
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {eleve.nom}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Prénom
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {eleve.prenom}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Date de naissance
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {formatDate(eleve.dateNaissance)}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Sexe
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {eleve.sexe === 'M' ? 'Masculin' : 'Féminin'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Statut
                </Typography>
                <Chip
                  label={statutLabels[eleve.statut] ?? eleve.statut}
                  color={statutColors[eleve.statut] ?? 'default'}
                  size="small"
                />
              </Grid>
            </Grid>
          </TabPanel>

          {/* Parents Tab */}
          <TabPanel value={tabIndex} index={1}>
            {eleve.parents.length === 0 ? (
              <Typography color="text.secondary">Aucun parent enregistré</Typography>
            ) : (
              <Grid container spacing={2}>
                {eleve.parents.map((parent) => (
                  <Grid item xs={12} md={6} key={parent.id}>
                    <Card variant="outlined" sx={{ borderRadius: 2 }}>
                      <CardContent>
                        <Typography variant="h6" fontWeight={600} sx={{ mb: 1.5 }}>
                          {parent.nom}
                        </Typography>
                        <Divider sx={{ mb: 1.5 }} />
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          <Box>
                            <Typography variant="subtitle2" color="text.secondary">
                              Téléphone
                            </Typography>
                            <Typography variant="body2">{parent.telephone || '—'}</Typography>
                          </Box>
                          <Box>
                            <Typography variant="subtitle2" color="text.secondary">
                              Email
                            </Typography>
                            <Typography variant="body2">{parent.email || '—'}</Typography>
                          </Box>
                          <Box>
                            <Typography variant="subtitle2" color="text.secondary">
                              Adresse
                            </Typography>
                            <Typography variant="body2">{parent.adresse || '—'}</Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </TabPanel>

          {/* Classe Tab */}
          <TabPanel value={tabIndex} index={2}>
            {currentAffectation ? (
              <Card variant="outlined" sx={{ borderRadius: 2, maxWidth: 400 }}>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} sx={{ mb: 1.5 }}>
                    {currentAffectation.classe.nom}
                  </Typography>
                  <Divider sx={{ mb: 1.5 }} />
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Niveau
                      </Typography>
                      <Typography variant="body2">{currentAffectation.classe.niveau}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Date de début
                      </Typography>
                      <Typography variant="body2">
                        {formatDate(currentAffectation.dateDebut)}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ) : (
              <Typography color="text.secondary">
                Aucune classe affectée actuellement
              </Typography>
            )}
          </TabPanel>

          {/* Actions Tab */}
          <TabPanel value={tabIndex} index={3}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 400 }}>
              {eleve.statut === 'inscrit' && (
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<AdmitIcon />}
                  onClick={handleAdmettre}
                  sx={{ textTransform: 'none', borderRadius: 2 }}
                >
                  Admettre l'élève
                </Button>
              )}

              <Button
                variant="outlined"
                startIcon={<ClassIcon />}
                onClick={openAffectDialog}
                sx={{ textTransform: 'none', borderRadius: 2 }}
              >
                Affecter à une classe
              </Button>

              <Button
                variant="outlined"
                color="warning"
                startIcon={<TransferIcon />}
                onClick={handleTransferer}
                sx={{ textTransform: 'none', borderRadius: 2 }}
              >
                Transférer
              </Button>

              <Button
                variant="outlined"
                color="error"
                startIcon={<DesinscriptionIcon />}
                onClick={handleDesinscrire}
                sx={{ textTransform: 'none', borderRadius: 2 }}
              >
                Désinscrire
              </Button>
            </Box>
          </TabPanel>
        </CardContent>
      </Card>

      {/* Affectation Dialog */}
      <Dialog
        open={affectDialogOpen}
        onClose={() => setAffectDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 600 }}>Affecter à une classe</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 1 }}>
            <InputLabel>Classe</InputLabel>
            <Select
              value={selectedClasseId}
              label="Classe"
              onChange={(e) => setSelectedClasseId(e.target.value)}
            >
              {classes.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.nom} — {c.niveau}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setAffectDialogOpen(false)} sx={{ textTransform: 'none' }}>
            Annuler
          </Button>
          <Button
            variant="contained"
            onClick={handleAffectation}
            disabled={!selectedClasseId || affectLoading}
            sx={{ textTransform: 'none', borderRadius: 2 }}
          >
            {affectLoading ? 'Affectation...' : 'Confirmer'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

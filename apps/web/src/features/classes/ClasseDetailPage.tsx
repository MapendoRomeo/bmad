import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  Box,
  Card,
  CardContent,
  IconButton,
  LinearProgress,
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
import { ArrowBack as BackIcon } from '@mui/icons-material';
import api from '../../services/api/client';
import { showSnackbar } from '../../store/slices/uiSlice';
import Loader from '../../components/common/Loader';

interface ClasseDetail {
  id: string;
  nom: string;
  niveau: string;
  effectifActuel: number;
  effectifMax: number;
}

interface EleveClasse {
  id: string;
  nom: string;
  prenom: string;
  dateDebut: string;
}

interface EnseignantClasse {
  id: string;
  nom: string;
  prenom: string;
  matiere?: string | null;
  dateDebut: string;
}

function TabPanel({ children, value, index }: { children: React.ReactNode; value: number; index: number }) {
  return value === index ? <Box sx={{ pt: 3 }}>{children}</Box> : null;
}

export default function ClasseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [classe, setClasse] = useState<ClasseDetail | null>(null);
  const [eleves, setEleves] = useState<EleveClasse[]>([]);
  const [enseignants, setEnseignants] = useState<EnseignantClasse[]>([]);
  const [loading, setLoading] = useState(true);
  const [tabIndex, setTabIndex] = useState(0);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [classeRes, elevesRes, enseignantsRes] = await Promise.all([
        api.get<ClasseDetail>(`/classes/${id}`),
        api.get<{ data: EleveClasse[] }>(`/classes/${id}/eleves`),
        api.get<{ data: EnseignantClasse[] }>(`/classes/${id}/enseignants`),
      ]);
      setClasse(classeRes.data);
      setEleves(elevesRes.data.data);
      setEnseignants(enseignantsRes.data.data);
    } catch {
      dispatch(showSnackbar({ message: 'Erreur lors du chargement de la classe', severity: 'error' }));
    } finally {
      setLoading(false);
    }
  }, [id, dispatch]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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

  const getCapacityColor = (current: number, max: number): 'success' | 'warning' | 'error' => {
    const ratio = max > 0 ? current / max : 0;
    if (ratio >= 0.9) return 'error';
    if (ratio >= 0.7) return 'warning';
    return 'success';
  };

  if (loading) return <Loader message="Chargement de la classe..." />;

  if (!classe) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography color="text.secondary">Classe introuvable</Typography>
      </Box>
    );
  }

  const capacityPercent = classe.effectifMax > 0
    ? Math.round((classe.effectifActuel / classe.effectifMax) * 100)
    : 0;
  const capacityColor = getCapacityColor(classe.effectifActuel, classe.effectifMax);

  return (
    <Box>
      {/* Back button */}
      <IconButton onClick={() => navigate('/classes')} sx={{ mb: 2 }}>
        <BackIcon />
      </IconButton>

      {/* Class info card */}
      <Card sx={{ mb: 3, borderRadius: 2 }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant="h5" fontWeight={700}>
                {classe.nom}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
                {classe.niveau}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ mt: 3, maxWidth: 400 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="body2" fontWeight={500}>
                Effectif
              </Typography>
              <Typography variant="body2" fontWeight={600} color={`${capacityColor}.main`}>
                {classe.effectifActuel} / {classe.effectifMax}
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={Math.min(capacityPercent, 100)}
              color={capacityColor}
              sx={{ height: 10, borderRadius: 5 }}
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
          <Tab label={`Élèves (${eleves.length})`} />
          <Tab label={`Enseignants (${enseignants.length})`} />
        </Tabs>

        <CardContent>
          {/* Élèves Tab */}
          <TabPanel value={tabIndex} index={0}>
            {eleves.length === 0 ? (
              <Typography color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
                Aucun élève dans cette classe
              </Typography>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: 'grey.50' }}>
                      <TableCell sx={{ fontWeight: 600 }}>Nom</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Prénom</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Date de début</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {eleves.map((eleve) => (
                      <TableRow key={eleve.id} hover sx={{ '&:last-child td': { border: 0 } }}>
                        <TableCell>{eleve.nom}</TableCell>
                        <TableCell>{eleve.prenom}</TableCell>
                        <TableCell>{formatDate(eleve.dateDebut)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </TabPanel>

          {/* Enseignants Tab */}
          <TabPanel value={tabIndex} index={1}>
            {enseignants.length === 0 ? (
              <Typography color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
                Aucun enseignant affecté à cette classe
              </Typography>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: 'grey.50' }}>
                      <TableCell sx={{ fontWeight: 600 }}>Nom</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Prénom</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Matière</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Date de début</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {enseignants.map((ens) => (
                      <TableRow key={ens.id} hover sx={{ '&:last-child td': { border: 0 } }}>
                        <TableCell>{ens.nom}</TableCell>
                        <TableCell>{ens.prenom}</TableCell>
                        <TableCell>{ens.matiere ?? '—'}</TableCell>
                        <TableCell>{formatDate(ens.dateDebut)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </TabPanel>
        </CardContent>
      </Card>
    </Box>
  );
}

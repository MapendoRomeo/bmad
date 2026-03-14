import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
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
  TextField,
  Card,
  CardContent,
  Divider,
  Grid,
  Chip,
} from '@mui/material';
import {
  Save as SaveIcon,
  CheckCircle as ValidateIcon,
  Calculate as CalculateIcon,
} from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import { showSnackbar } from '../../store/slices/uiSlice';
import Loader from '../../components/common/Loader';
import api from '../../services/api/client';

const DOMAINES_MATERNELLE = [
  { code: 'langage', label: 'Mobiliser le langage' },
  { code: 'activite_physique', label: 'Agir, s\'exprimer à travers l\'activité physique' },
  { code: 'activites_artistiques', label: 'Agir, s\'exprimer à travers les activités artistiques' },
  { code: 'nombres_formes', label: 'Construire les premiers outils (nombres et formes)' },
  { code: 'explorer_monde', label: 'Explorer le monde' },
];

const NIVEAUX_ACQUIS = [
  { value: 'acquis', label: 'Acquis', color: 'success' as const },
  { value: 'en_cours', label: 'En cours', color: 'warning' as const },
  { value: 'non_acquis', label: 'Non acquis', color: 'error' as const },
];

interface Classe {
  id: string;
  nom: string;
  niveauId: string;
}

interface Matiere {
  id: string;
  nom: string;
}

interface Periode {
  id: string;
  nom: string;
}

interface Eleve {
  id: string;
  nom: string;
  prenom: string;
}

interface NoteRow {
  eleveId: string;
  nom: string;
  prenom: string;
  note: string;
  noteId?: string;
}

interface QualitativeRow {
  eleveId: string;
  nom: string;
  prenom: string;
  evaluations: Record<string, string>;
}

interface BulletinMatiere {
  matiere: string;
  note: number;
  noteMax: number;
  coefficient: number;
  moyenne: number;
}

interface Bulletin {
  eleve: { nom: string; prenom: string };
  classe: string;
  periode: string;
  matieres: BulletinMatiere[];
  moyenneGenerale: number;
  appreciation: string;
}

export default function EvaluationsPage() {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState(0);

  // Shared data
  const [classes, setClasses] = useState<Classe[]>([]);
  const [periodes, setPeriodes] = useState<Periode[]>([]);
  const [loadingInit, setLoadingInit] = useState(true);

  useEffect(() => {
    const fetchInitial = async () => {
      try {
        const [classesRes, periodesRes] = await Promise.all([
          api.get('/classes'),
          api.get('/periodes'),
        ]);
        setClasses(classesRes.data.data || classesRes.data);
        setPeriodes(periodesRes.data.data || periodesRes.data);
      } catch {
        dispatch(showSnackbar({ message: 'Erreur lors du chargement des données', severity: 'error' }));
      } finally {
        setLoadingInit(false);
      }
    };
    fetchInitial();
  }, [dispatch]);

  if (loadingInit) return <Loader message="Chargement..." />;

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} sx={{ mb: 3 }}>
        Évaluations
      </Typography>

      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)}>
          <Tab label="Saisie des notes" />
          <Tab label="Qualitatives" />
          <Tab label="Bulletins" />
        </Tabs>
      </Paper>

      {activeTab === 0 && <NotesTab classes={classes} periodes={periodes} />}
      {activeTab === 1 && <QualitativesTab classes={classes} periodes={periodes} />}
      {activeTab === 2 && <BulletinsTab classes={classes} periodes={periodes} />}
    </Box>
  );
}

/* =============================== NOTES TAB =============================== */

function NotesTab({ classes, periodes }: { classes: Classe[]; periodes: Periode[] }) {
  const dispatch = useDispatch();
  const [selectedClasse, setSelectedClasse] = useState('');
  const [selectedMatiere, setSelectedMatiere] = useState('');
  const [selectedPeriode, setSelectedPeriode] = useState('');
  const [matieres, setMatieres] = useState<Matiere[]>([]);
  const [notes, setNotes] = useState<NoteRow[]>([]);
  const [noteMax, setNoteMax] = useState('20');
  const [coefficient, setCoefficient] = useState('1');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const selectedClasseObj = classes.find((c) => c.id === selectedClasse);

  useEffect(() => {
    if (!selectedClasseObj) {
      setMatieres([]);
      setSelectedMatiere('');
      return;
    }
    const fetchMatieres = async () => {
      try {
        const res = await api.get('/matieres', { params: { niveauId: selectedClasseObj.niveauId } });
        setMatieres(res.data.data || res.data);
      } catch {
        dispatch(showSnackbar({ message: 'Erreur lors du chargement des matières', severity: 'error' }));
      }
    };
    fetchMatieres();
  }, [selectedClasseObj, dispatch]);

  const fetchNotes = useCallback(async () => {
    if (!selectedClasse || !selectedMatiere || !selectedPeriode) return;
    setLoading(true);
    try {
      const res = await api.get('/evaluations/notes', {
        params: { classeId: selectedClasse, matiereId: selectedMatiere, periodeId: selectedPeriode },
      });
      const data = res.data.data || res.data;
      setNotes(
        data.map((item: { eleve: Eleve; note?: number; id?: string }) => ({
          eleveId: item.eleve.id,
          nom: item.eleve.nom,
          prenom: item.eleve.prenom,
          note: item.note !== undefined && item.note !== null ? String(item.note) : '',
          noteId: item.id,
        })),
      );
    } catch {
      dispatch(showSnackbar({ message: 'Erreur lors du chargement des notes', severity: 'error' }));
    } finally {
      setLoading(false);
    }
  }, [selectedClasse, selectedMatiere, selectedPeriode, dispatch]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const handleNoteChange = (eleveId: string, value: string) => {
    setNotes((prev) =>
      prev.map((n) => (n.eleveId === eleveId ? { ...n, note: value } : n)),
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = notes
        .filter((n) => n.note !== '')
        .map((n) => ({
          eleveId: n.eleveId,
          matiereId: selectedMatiere,
          periodeId: selectedPeriode,
          classeId: selectedClasse,
          note: parseFloat(n.note),
          noteMax: parseFloat(noteMax),
          coefficient: parseFloat(coefficient),
        }));
      for (const entry of payload) {
        await api.post('/evaluations/notes', entry);
      }
      dispatch(showSnackbar({ message: 'Notes sauvegardées avec succès', severity: 'success' }));
      fetchNotes();
    } catch {
      dispatch(showSnackbar({ message: 'Erreur lors de la sauvegarde des notes', severity: 'error' }));
    } finally {
      setSaving(false);
    }
  };

  const handleValidate = async () => {
    setSaving(true);
    try {
      const noteIds = notes.filter((n) => n.noteId).map((n) => n.noteId);
      for (const id of noteIds) {
        await api.post(`/evaluations/notes/${id}/valider`);
      }
      dispatch(showSnackbar({ message: 'Notes validées avec succès', severity: 'success' }));
      fetchNotes();
    } catch {
      dispatch(showSnackbar({ message: 'Erreur lors de la validation', severity: 'error' }));
    } finally {
      setSaving(false);
    }
  };

  const handleCalculerMoyennes = async () => {
    setSaving(true);
    try {
      await api.post('/evaluations/moyennes', {
        classeId: selectedClasse,
        periodeId: selectedPeriode,
      });
      dispatch(showSnackbar({ message: 'Moyennes calculées avec succès', severity: 'success' }));
    } catch {
      dispatch(showSnackbar({ message: 'Erreur lors du calcul des moyennes', severity: 'error' }));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Classe</InputLabel>
              <Select
                value={selectedClasse}
                label="Classe"
                onChange={(e) => {
                  setSelectedClasse(e.target.value);
                  setSelectedMatiere('');
                }}
              >
                {classes.map((c) => (
                  <MenuItem key={c.id} value={c.id}>{c.nom}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth size="small" disabled={!selectedClasse}>
              <InputLabel>Matière</InputLabel>
              <Select
                value={selectedMatiere}
                label="Matière"
                onChange={(e) => setSelectedMatiere(e.target.value)}
              >
                {matieres.map((m) => (
                  <MenuItem key={m.id} value={m.id}>{m.nom}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Période</InputLabel>
              <Select
                value={selectedPeriode}
                label="Période"
                onChange={(e) => setSelectedPeriode(e.target.value)}
              >
                {periodes.map((p) => (
                  <MenuItem key={p.id} value={p.id}>{p.nom}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {selectedClasse && selectedMatiere && selectedPeriode && (
        <>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={6} sm={3}>
                <TextField
                  label="Note maximale"
                  type="number"
                  value={noteMax}
                  onChange={(e) => setNoteMax(e.target.value)}
                  size="small"
                  fullWidth
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <TextField
                  label="Coefficient"
                  type="number"
                  value={coefficient}
                  onChange={(e) => setCoefficient(e.target.value)}
                  size="small"
                  fullWidth
                />
              </Grid>
            </Grid>
          </Paper>

          {loading ? (
            <Loader message="Chargement des notes..." />
          ) : (
            <>
              <TableContainer component={Paper} sx={{ mb: 2 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Nom</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Prénom</TableCell>
                      <TableCell sx={{ fontWeight: 700 }} align="center">
                        Note / {noteMax}
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {notes.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} align="center" sx={{ py: 4 }}>
                          <Typography color="text.secondary">Aucun élève trouvé</Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      notes.map((n) => (
                        <TableRow key={n.eleveId} hover>
                          <TableCell>{n.nom}</TableCell>
                          <TableCell>{n.prenom}</TableCell>
                          <TableCell align="center" sx={{ width: 150 }}>
                            <TextField
                              type="number"
                              size="small"
                              value={n.note}
                              onChange={(e) => handleNoteChange(n.eleveId, e.target.value)}
                              inputProps={{ min: 0, max: parseFloat(noteMax), step: 0.5 }}
                              sx={{ width: 100 }}
                            />
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? 'Sauvegarde...' : 'Sauvegarder'}
                </Button>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<ValidateIcon />}
                  onClick={handleValidate}
                  disabled={saving}
                >
                  Valider les notes
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<CalculateIcon />}
                  onClick={handleCalculerMoyennes}
                  disabled={saving}
                >
                  Calculer les moyennes
                </Button>
              </Box>
            </>
          )}
        </>
      )}
    </Box>
  );
}

/* ========================== QUALITATIVES TAB ========================== */

function QualitativesTab({ classes, periodes }: { classes: Classe[]; periodes: Periode[] }) {
  const dispatch = useDispatch();
  const [selectedClasse, setSelectedClasse] = useState('');
  const [selectedPeriode, setSelectedPeriode] = useState('');
  const [rows, setRows] = useState<QualitativeRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    if (!selectedClasse || !selectedPeriode) return;
    setLoading(true);
    try {
      const res = await api.get('/evaluations/qualitatives', {
        params: { classeId: selectedClasse, periodeId: selectedPeriode },
      });
      const data = res.data.data || res.data;
      setRows(
        data.map((item: { eleve: Eleve; evaluations?: Record<string, string> }) => ({
          eleveId: item.eleve.id,
          nom: item.eleve.nom,
          prenom: item.eleve.prenom,
          evaluations: item.evaluations || {},
        })),
      );
    } catch {
      dispatch(showSnackbar({ message: 'Erreur lors du chargement', severity: 'error' }));
    } finally {
      setLoading(false);
    }
  }, [selectedClasse, selectedPeriode, dispatch]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleChange = (eleveId: string, domaine: string, value: string) => {
    setRows((prev) =>
      prev.map((r) =>
        r.eleveId === eleveId
          ? { ...r, evaluations: { ...r.evaluations, [domaine]: value } }
          : r,
      ),
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.post('/evaluations/qualitatives', {
        classeId: selectedClasse,
        periodeId: selectedPeriode,
        evaluations: rows.map((r) => ({
          eleveId: r.eleveId,
          domaines: r.evaluations,
        })),
      });
      dispatch(showSnackbar({ message: 'Évaluations qualitatives sauvegardées', severity: 'success' }));
    } catch {
      dispatch(showSnackbar({ message: 'Erreur lors de la sauvegarde', severity: 'error' }));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2}>
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
            <FormControl fullWidth size="small">
              <InputLabel>Période</InputLabel>
              <Select
                value={selectedPeriode}
                label="Période"
                onChange={(e) => setSelectedPeriode(e.target.value)}
              >
                {periodes.map((p) => (
                  <MenuItem key={p.id} value={p.id}>{p.nom}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {selectedClasse && selectedPeriode && (
        loading ? (
          <Loader message="Chargement des évaluations..." />
        ) : (
          <>
            <TableContainer component={Paper} sx={{ mb: 2, overflowX: 'auto' }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, minWidth: 180 }}>Élève</TableCell>
                    {DOMAINES_MATERNELLE.map((d) => (
                      <TableCell key={d.code} sx={{ fontWeight: 700, minWidth: 160 }} align="center">
                        {d.label}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={DOMAINES_MATERNELLE.length + 1} align="center" sx={{ py: 4 }}>
                        <Typography color="text.secondary">Aucun élève trouvé</Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    rows.map((r) => (
                      <TableRow key={r.eleveId} hover>
                        <TableCell>{r.nom} {r.prenom}</TableCell>
                        {DOMAINES_MATERNELLE.map((d) => (
                          <TableCell key={d.code} align="center">
                            <FormControl size="small" sx={{ minWidth: 130 }}>
                              <Select
                                value={r.evaluations[d.code] || ''}
                                onChange={(e) => handleChange(r.eleveId, d.code, e.target.value)}
                                displayEmpty
                              >
                                <MenuItem value="">-</MenuItem>
                                {NIVEAUX_ACQUIS.map((n) => (
                                  <MenuItem key={n.value} value={n.value}>{n.label}</MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </TableCell>
                        ))}
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
              disabled={saving}
            >
              {saving ? 'Sauvegarde...' : 'Sauvegarder'}
            </Button>
          </>
        )
      )}
    </Box>
  );
}

/* ============================== BULLETINS TAB ============================== */

function BulletinsTab({ classes, periodes }: { classes: Classe[]; periodes: Periode[] }) {
  const dispatch = useDispatch();
  const [selectedClasse, setSelectedClasse] = useState('');
  const [selectedPeriode, setSelectedPeriode] = useState('');
  const [eleves, setEleves] = useState<Eleve[]>([]);
  const [selectedEleve, setSelectedEleve] = useState('');
  const [bulletin, setBulletin] = useState<Bulletin | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedClasse) {
      setEleves([]);
      setSelectedEleve('');
      return;
    }
    const fetchEleves = async () => {
      try {
        const res = await api.get(`/classes/${selectedClasse}/eleves`);
        setEleves(res.data.data || res.data);
      } catch {
        dispatch(showSnackbar({ message: 'Erreur lors du chargement des élèves', severity: 'error' }));
      }
    };
    fetchEleves();
  }, [selectedClasse, dispatch]);

  useEffect(() => {
    if (!selectedEleve || !selectedPeriode) {
      setBulletin(null);
      return;
    }
    const fetchBulletin = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/evaluations/bulletin/${selectedEleve}/${selectedPeriode}`);
        setBulletin(res.data);
      } catch {
        dispatch(showSnackbar({ message: 'Erreur lors du chargement du bulletin', severity: 'error' }));
        setBulletin(null);
      } finally {
        setLoading(false);
      }
    };
    fetchBulletin();
  }, [selectedEleve, selectedPeriode, dispatch]);

  return (
    <Box>
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Classe</InputLabel>
              <Select
                value={selectedClasse}
                label="Classe"
                onChange={(e) => {
                  setSelectedClasse(e.target.value);
                  setSelectedEleve('');
                }}
              >
                {classes.map((c) => (
                  <MenuItem key={c.id} value={c.id}>{c.nom}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth size="small" disabled={!selectedClasse}>
              <InputLabel>Élève</InputLabel>
              <Select
                value={selectedEleve}
                label="Élève"
                onChange={(e) => setSelectedEleve(e.target.value)}
              >
                {eleves.map((el) => (
                  <MenuItem key={el.id} value={el.id}>
                    {el.nom} {el.prenom}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Période</InputLabel>
              <Select
                value={selectedPeriode}
                label="Période"
                onChange={(e) => setSelectedPeriode(e.target.value)}
              >
                {periodes.map((p) => (
                  <MenuItem key={p.id} value={p.id}>{p.nom}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {loading && <Loader message="Chargement du bulletin..." />}

      {bulletin && !loading && (
        <Card sx={{ maxWidth: 800, mx: 'auto' }}>
          <CardContent>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Typography variant="h5" fontWeight={700}>
                Bulletin scolaire
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                {bulletin.periode}
              </Typography>
            </Box>

            <Divider sx={{ mb: 2 }} />

            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Élève</Typography>
                <Typography fontWeight={600}>
                  {bulletin.eleve.prenom} {bulletin.eleve.nom}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Classe</Typography>
                <Typography fontWeight={600}>{bulletin.classe}</Typography>
              </Grid>
            </Grid>

            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Matière</TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="center">Note</TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="center">Sur</TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="center">Coef.</TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="center">Moyenne</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {bulletin.matieres.map((m, idx) => (
                    <TableRow key={idx} hover>
                      <TableCell>{m.matiere}</TableCell>
                      <TableCell align="center">{m.note}</TableCell>
                      <TableCell align="center">{m.noteMax}</TableCell>
                      <TableCell align="center">{m.coefficient}</TableCell>
                      <TableCell align="center">
                        <Chip
                          label={m.moyenne.toFixed(2)}
                          size="small"
                          color={m.moyenne >= 10 ? 'success' : 'error'}
                          variant="outlined"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" fontWeight={700}>
                Moyenne générale
              </Typography>
              <Chip
                label={bulletin.moyenneGenerale.toFixed(2) + ' / 20'}
                color={bulletin.moyenneGenerale >= 10 ? 'success' : 'error'}
                sx={{ fontWeight: 700, fontSize: '1rem' }}
              />
            </Box>

            {bulletin.appreciation && (
              <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  Appréciation générale
                </Typography>
                <Typography>{bulletin.appreciation}</Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      )}
    </Box>
  );
}

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box, Typography, Card, CardContent, Grid, TextField, Button, Tabs, Tab,
  Table, TableHead, TableRow, TableCell, TableBody, Chip, Dialog, DialogTitle,
  DialogContent, DialogActions, Select, MenuItem, FormControl, InputLabel,
  IconButton, Divider, Switch, FormControlLabel,
} from '@mui/material';
import { Edit, Save, Add, CalendarMonth } from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import { showSnackbar } from '../../store/slices/uiSlice';
import api from '../../services/api/client';
import Loader from '../../components/common/Loader';
import StatCard from '../../components/common/StatCard';

interface EtablissementData {
  id: string;
  nom: string;
  type: string;
  adresse: string | null;
  telephone: string | null;
  email: string | null;
  logoUrl: string | null;
  actif: boolean;
  _count?: { utilisateurs: number; eleves: number; classes: number; enseignants: number };
}

interface AnneeScolaire {
  id: string;
  nom: string;
  dateDebut: string;
  dateFin: string;
  active: boolean;
  _count?: { classes: number; periodes: number };
}

export default function EtablissementPage() {
  const dispatch = useDispatch();
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [etab, setEtab] = useState<EtablissementData | null>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ nom: '', type: '', adresse: '', telephone: '', email: '' });
  const [annees, setAnnees] = useState<AnneeScolaire[]>([]);
  const [anneeDialog, setAnneeDialog] = useState(false);
  const [anneeForm, setAnneeForm] = useState({ nom: '', dateDebut: '', dateFin: '' });

  const fetchEtab = async () => {
    try {
      setLoading(true);
      // Get the current user's etablissement
      const userStr = localStorage.getItem('sgs_user');
      if (!userStr) return;
      const user = JSON.parse(userStr);
      const res = await api.get(`/etablissements/${user.etablissementId}`);
      setEtab(res.data.data || res.data);
      const e = res.data.data || res.data;
      setForm({ nom: e.nom, type: e.type, adresse: e.adresse || '', telephone: e.telephone || '', email: e.email || '' });
    } catch {
      dispatch(showSnackbar({ message: 'Erreur lors du chargement', severity: 'error' }));
    } finally {
      setLoading(false);
    }
  };

  const fetchAnnees = async () => {
    try {
      if (!etab) return;
      const res = await api.get(`/etablissements/${etab.id}/annees-scolaires`);
      setAnnees(res.data.data || res.data || []);
    } catch {
      // silent
    }
  };

  useEffect(() => { fetchEtab(); }, []);
  useEffect(() => { if (etab) fetchAnnees(); }, [etab]);

  const handleSave = async () => {
    try {
      if (!etab) return;
      await api.put(`/etablissements/${etab.id}`, form);
      dispatch(showSnackbar({ message: 'Établissement mis à jour', severity: 'success' }));
      setEditing(false);
      fetchEtab();
    } catch {
      dispatch(showSnackbar({ message: 'Erreur lors de la mise à jour', severity: 'error' }));
    }
  };

  const handleCreateAnnee = async () => {
    try {
      if (!etab) return;
      await api.post(`/etablissements/${etab.id}/annees-scolaires`, anneeForm);
      dispatch(showSnackbar({ message: 'Année scolaire créée', severity: 'success' }));
      setAnneeDialog(false);
      setAnneeForm({ nom: '', dateDebut: '', dateFin: '' });
      fetchAnnees();
    } catch {
      dispatch(showSnackbar({ message: 'Erreur lors de la création', severity: 'error' }));
    }
  };

  const handleActiverAnnee = async (anneeId: string) => {
    try {
      await api.put(`/etablissements/annees-scolaires/${anneeId}/activer`);
      dispatch(showSnackbar({ message: 'Année scolaire activée', severity: 'success' }));
      fetchAnnees();
    } catch {
      dispatch(showSnackbar({ message: 'Erreur', severity: 'error' }));
    }
  };

  if (loading) return <Loader message="Chargement de l'établissement..." />;
  if (!etab) return <Typography>Établissement non trouvé</Typography>;

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>
        Configuration de l'établissement
      </Typography>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
        <Tab label="Informations" />
        <Tab label="Années scolaires" />
      </Tabs>

      {tab === 0 && (
        <Card>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h6">Informations générales</Typography>
              <Button
                variant={editing ? 'contained' : 'outlined'}
                startIcon={editing ? <Save /> : <Edit />}
                onClick={editing ? handleSave : () => setEditing(true)}
              >
                {editing ? 'Sauvegarder' : 'Modifier'}
              </Button>
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Nom de l'établissement"
                  value={form.nom}
                  onChange={(e) => setForm({ ...form, nom: e.target.value })}
                  fullWidth
                  disabled={!editing}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth disabled={!editing}>
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={form.type}
                    label="Type"
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                  >
                    <MenuItem value="maternelle">Maternelle</MenuItem>
                    <MenuItem value="primaire">Primaire</MenuItem>
                    <MenuItem value="secondaire">Secondaire</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Adresse"
                  value={form.adresse}
                  onChange={(e) => setForm({ ...form, adresse: e.target.value })}
                  fullWidth
                  disabled={!editing}
                  multiline
                  rows={2}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Téléphone"
                  value={form.telephone}
                  onChange={(e) => setForm({ ...form, telephone: e.target.value })}
                  fullWidth
                  disabled={!editing}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  fullWidth
                  disabled={!editing}
                />
              </Grid>
            </Grid>

            {etab._count && (
              <>
                <Divider sx={{ my: 3 }} />
                <Typography variant="h6" sx={{ mb: 2 }}>Statistiques</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6} md={3}>
                    <StatCard title="Utilisateurs" value={etab._count.utilisateurs} icon={<span>👥</span>} />
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <StatCard title="Élèves" value={etab._count.eleves} icon={<span>🎓</span>} />
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <StatCard title="Classes" value={etab._count.classes} icon={<span>🏫</span>} />
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <StatCard title="Enseignants" value={etab._count.enseignants} icon={<span>👨‍🏫</span>} />
                  </Grid>
                </Grid>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {tab === 1 && (
        <Card>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h6">Années scolaires</Typography>
              <Button variant="contained" startIcon={<Add />} onClick={() => setAnneeDialog(true)}>
                Nouvelle année
              </Button>
            </Box>

            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nom</TableCell>
                  <TableCell>Date de début</TableCell>
                  <TableCell>Date de fin</TableCell>
                  <TableCell>Classes</TableCell>
                  <TableCell>Statut</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {annees.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell sx={{ fontWeight: 500 }}>{a.nom}</TableCell>
                    <TableCell>{new Date(a.dateDebut).toLocaleDateString('fr-FR')}</TableCell>
                    <TableCell>{new Date(a.dateFin).toLocaleDateString('fr-FR')}</TableCell>
                    <TableCell>{a._count?.classes || 0}</TableCell>
                    <TableCell>
                      <Chip
                        label={a.active ? 'Active' : 'Inactive'}
                        color={a.active ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {!a.active && (
                        <Button size="small" onClick={() => handleActiverAnnee(a.id)}>
                          Activer
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {annees.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                      Aucune année scolaire
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Dialog open={anneeDialog} onClose={() => setAnneeDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Nouvelle année scolaire</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <TextField
                label="Nom (ex: 2025-2026)"
                value={anneeForm.nom}
                onChange={(e) => setAnneeForm({ ...anneeForm, nom: e.target.value })}
                fullWidth
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Date de début"
                type="date"
                value={anneeForm.dateDebut}
                onChange={(e) => setAnneeForm({ ...anneeForm, dateDebut: e.target.value })}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Date de fin"
                type="date"
                value={anneeForm.dateFin}
                onChange={(e) => setAnneeForm({ ...anneeForm, dateFin: e.target.value })}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAnneeDialog(false)}>Annuler</Button>
          <Button variant="contained" onClick={handleCreateAnnee}>Créer</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

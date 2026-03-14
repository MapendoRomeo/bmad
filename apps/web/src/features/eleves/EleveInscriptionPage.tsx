import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import api from '../../services/api/client';
import { showSnackbar } from '../../store/slices/uiSlice';
import Loader from '../../components/common/Loader';

interface ClasseOption {
  id: string;
  nom: string;
  niveau: string;
}

interface ParentForm {
  nom: string;
  telephone: string;
  email: string;
  adresse: string;
}

interface EleveForm {
  nom: string;
  prenom: string;
  dateNaissance: string;
  sexe: string;
  classeSouhaiteeId: string;
}

const steps = ['Informations élève', 'Parents', 'Confirmation'];

const emptyParent = (): ParentForm => ({
  nom: '',
  telephone: '',
  email: '',
  adresse: '',
});

export default function EleveInscriptionPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [activeStep, setActiveStep] = useState(0);
  const [classes, setClasses] = useState<ClasseOption[]>([]);
  const [classesLoading, setClassesLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [eleveForm, setEleveForm] = useState<EleveForm>({
    nom: '',
    prenom: '',
    dateNaissance: '',
    sexe: '',
    classeSouhaiteeId: '',
  });

  const [parents, setParents] = useState<ParentForm[]>([emptyParent()]);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const { data } = await api.get<{ data: ClasseOption[] }>('/classes');
        setClasses(data.data);
      } catch {
        dispatch(showSnackbar({ message: 'Erreur lors du chargement des classes', severity: 'error' }));
      } finally {
        setClassesLoading(false);
      }
    };
    fetchClasses();
  }, [dispatch]);

  const handleEleveChange = (field: keyof EleveForm, value: string) => {
    setEleveForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleParentChange = (index: number, field: keyof ParentForm, value: string) => {
    setParents((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const addParent = () => {
    setParents((prev) => [...prev, emptyParent()]);
  };

  const removeParent = (index: number) => {
    if (parents.length <= 1) return;
    setParents((prev) => prev.filter((_, i) => i !== index));
  };

  const isStep1Valid =
    eleveForm.nom.trim() !== '' &&
    eleveForm.prenom.trim() !== '' &&
    eleveForm.dateNaissance !== '' &&
    eleveForm.sexe !== '';

  const isStep2Valid = parents.every(
    (p) => p.nom.trim() !== '' && p.telephone.trim() !== '',
  );

  const handleNext = () => {
    if (activeStep < steps.length - 1) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await api.post('/eleves/inscription', {
        ...eleveForm,
        parents,
      });
      dispatch(showSnackbar({ message: 'Inscription réussie !', severity: 'success' }));
      navigate('/eleves');
    } catch {
      dispatch(showSnackbar({ message: "Erreur lors de l'inscription", severity: 'error' }));
    } finally {
      setSubmitting(false);
    }
  };

  const formatDateDisplay = (dateStr: string) => {
    if (!dateStr) return '—';
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

  const selectedClasse = classes.find((c) => c.id === eleveForm.classeSouhaiteeId);

  if (classesLoading) return <Loader message="Chargement du formulaire..." />;

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" fontWeight={700} sx={{ mb: 3 }}>
        Nouvelle inscription
      </Typography>

      {/* Stepper */}
      <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {/* Step 1: Informations élève */}
      {activeStep === 0 && (
        <Card sx={{ borderRadius: 2 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
              Informations de l'élève
            </Typography>
            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Nom"
                  value={eleveForm.nom}
                  onChange={(e) => handleEleveChange('nom', e.target.value)}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Prénom"
                  value={eleveForm.prenom}
                  onChange={(e) => handleEleveChange('prenom', e.target.value)}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Date de naissance"
                  type="date"
                  value={eleveForm.dateNaissance}
                  onChange={(e) => handleEleveChange('dateNaissance', e.target.value)}
                  fullWidth
                  required
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Sexe</InputLabel>
                  <Select
                    value={eleveForm.sexe}
                    label="Sexe"
                    onChange={(e) => handleEleveChange('sexe', e.target.value)}
                  >
                    <MenuItem value="M">Masculin</MenuItem>
                    <MenuItem value="F">Féminin</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Classe souhaitée</InputLabel>
                  <Select
                    value={eleveForm.classeSouhaiteeId}
                    label="Classe souhaitée"
                    onChange={(e) => handleEleveChange('classeSouhaiteeId', e.target.value)}
                  >
                    <MenuItem value="">
                      <em>Non spécifiée</em>
                    </MenuItem>
                    {classes.map((c) => (
                      <MenuItem key={c.id} value={c.id}>
                        {c.nom} — {c.niveau}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Parents */}
      {activeStep === 1 && (
        <Box>
          {parents.map((parent, index) => (
            <Card key={index} sx={{ borderRadius: 2, mb: 2 }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" fontWeight={600}>
                    Parent {index + 1}
                  </Typography>
                  {parents.length > 1 && (
                    <IconButton
                      color="error"
                      onClick={() => removeParent(index)}
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  )}
                </Box>
                <Grid container spacing={2.5}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Nom complet"
                      value={parent.nom}
                      onChange={(e) => handleParentChange(index, 'nom', e.target.value)}
                      fullWidth
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Téléphone"
                      value={parent.telephone}
                      onChange={(e) => handleParentChange(index, 'telephone', e.target.value)}
                      fullWidth
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Email"
                      type="email"
                      value={parent.email}
                      onChange={(e) => handleParentChange(index, 'email', e.target.value)}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Adresse"
                      value={parent.adresse}
                      onChange={(e) => handleParentChange(index, 'adresse', e.target.value)}
                      fullWidth
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          ))}

          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={addParent}
            sx={{ textTransform: 'none', borderRadius: 2 }}
          >
            Ajouter un parent
          </Button>
        </Box>
      )}

      {/* Step 3: Confirmation */}
      {activeStep === 2 && (
        <Card sx={{ borderRadius: 2 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
              Récapitulatif de l'inscription
            </Typography>

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1.5 }}>
              Informations de l'élève
            </Typography>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Nom</Typography>
                <Typography variant="body1" fontWeight={500}>{eleveForm.nom}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Prénom</Typography>
                <Typography variant="body1" fontWeight={500}>{eleveForm.prenom}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Date de naissance</Typography>
                <Typography variant="body1" fontWeight={500}>
                  {formatDateDisplay(eleveForm.dateNaissance)}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Sexe</Typography>
                <Typography variant="body1" fontWeight={500}>
                  {eleveForm.sexe === 'M' ? 'Masculin' : 'Féminin'}
                </Typography>
              </Grid>
              {selectedClasse && (
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">Classe souhaitée</Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {selectedClasse.nom} — {selectedClasse.niveau}
                  </Typography>
                </Grid>
              )}
            </Grid>

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1.5 }}>
              Parents ({parents.length})
            </Typography>
            {parents.map((parent, index) => (
              <Card
                key={index}
                variant="outlined"
                sx={{ mb: 1.5, borderRadius: 1.5 }}
              >
                <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                  <Typography variant="body1" fontWeight={600}>
                    {parent.nom}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Tél: {parent.telephone}
                    {parent.email ? ` | Email: ${parent.email}` : ''}
                    {parent.adresse ? ` | Adresse: ${parent.adresse}` : ''}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Navigation buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        <Button
          onClick={activeStep === 0 ? () => navigate('/eleves') : handleBack}
          sx={{ textTransform: 'none', borderRadius: 2 }}
        >
          {activeStep === 0 ? 'Annuler' : 'Précédent'}
        </Button>

        {activeStep < steps.length - 1 ? (
          <Button
            variant="contained"
            onClick={handleNext}
            disabled={
              (activeStep === 0 && !isStep1Valid) ||
              (activeStep === 1 && !isStep2Valid)
            }
            sx={{ textTransform: 'none', borderRadius: 2 }}
          >
            Suivant
          </Button>
        ) : (
          <Button
            variant="contained"
            color="success"
            onClick={handleSubmit}
            disabled={submitting}
            sx={{ textTransform: 'none', borderRadius: 2, px: 4 }}
          >
            {submitting ? 'Inscription en cours...' : "Confirmer l'inscription"}
          </Button>
        )}
      </Box>
    </Box>
  );
}

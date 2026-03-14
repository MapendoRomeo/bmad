import { useState, FormEvent } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  InputAdornment,
  CircularProgress,
  Link as MuiLink,
  Fade,
} from '@mui/material';
import {
  School as SchoolIcon,
  Email as EmailIcon,
  ArrowBack as ArrowBackIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import api from '../../services/api/client';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [apiError, setApiError] = useState('');

  const validate = (): boolean => {
    setEmailError('');
    if (!email.trim()) {
      setEmailError('L\'adresse email est requise');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError('Adresse email invalide');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setApiError('');

    try {
      await api.post('/auth/forgot-password', { email: email.trim() });
      setSuccess(true);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: { message?: string } } } };
      setApiError(
        error.response?.data?.error?.message ||
          'Une erreur est survenue. Veuillez réessayer.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0D3B50 0%, #1B5E7B 50%, #4A8BA8 100%)',
        p: 2,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background decorative circles */}
      <Box
        sx={{
          position: 'absolute',
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.03)',
          top: -100,
          right: -100,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.04)',
          bottom: -80,
          left: -80,
        }}
      />

      <Fade in timeout={600}>
        <Card
          sx={{
            width: '100%',
            maxWidth: 440,
            borderRadius: 4,
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            overflow: 'visible',
            position: 'relative',
          }}
        >
          <CardContent sx={{ p: { xs: 3, sm: 5 } }}>
            {/* Logo / Icon */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Box
                sx={{
                  width: 72,
                  height: 72,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #0D3B50, #1B5E7B)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2,
                  boxShadow: '0 8px 24px rgba(13, 59, 80, 0.35)',
                }}
              >
                <SchoolIcon sx={{ fontSize: 36, color: '#fff' }} />
              </Box>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  color: 'text.primary',
                  letterSpacing: '-0.02em',
                }}
              >
                Gestion Scolaire
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                Réinitialisation du mot de passe
              </Typography>
            </Box>

            {success ? (
              /* Success state */
              <Fade in>
                <Box sx={{ textAlign: 'center' }}>
                  <Box
                    sx={{
                      width: 64,
                      height: 64,
                      borderRadius: '50%',
                      backgroundColor: 'success.main',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 2,
                    }}
                  >
                    <CheckCircleOutlineIcon sx={{ fontSize: 32, color: '#fff' }} />
                  </Box>
                  <Typography variant="h6" sx={{ mb: 1, color: 'text.primary' }}>
                    Email envoyé !
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: 'text.secondary', mb: 3, lineHeight: 1.6 }}
                  >
                    Si un compte est associé à l'adresse{' '}
                    <strong>{email}</strong>, vous recevrez un email
                    contenant les instructions pour réinitialiser votre mot de
                    passe.
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: 'text.secondary', mb: 4 }}
                  >
                    Pensez à vérifier vos spams si vous ne le trouvez pas.
                  </Typography>

                  <Button
                    component={Link}
                    to="/login"
                    variant="contained"
                    fullWidth
                    size="large"
                    startIcon={<ArrowBackIcon />}
                    sx={{
                      py: 1.5,
                      fontSize: '1rem',
                      fontWeight: 600,
                      background: 'linear-gradient(135deg, #0D3B50, #1B5E7B)',
                      boxShadow: '0 4px 16px rgba(13, 59, 80, 0.35)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #0A2F40, #165270)',
                        boxShadow: '0 6px 20px rgba(13, 59, 80, 0.45)',
                      },
                    }}
                  >
                    Retour à la connexion
                  </Button>
                </Box>
              </Fade>
            ) : (
              /* Form state */
              <>
                <Typography
                  variant="body2"
                  sx={{
                    color: 'text.secondary',
                    mb: 3,
                    textAlign: 'center',
                    lineHeight: 1.6,
                  }}
                >
                  Entrez votre adresse email et nous vous enverrons un lien
                  pour réinitialiser votre mot de passe.
                </Typography>

                {/* Error alert */}
                {apiError && (
                  <Fade in>
                    <Alert
                      severity="error"
                      sx={{ mb: 3, borderRadius: 2 }}
                      onClose={() => setApiError('')}
                    >
                      {apiError}
                    </Alert>
                  </Fade>
                )}

                <Box component="form" onSubmit={handleSubmit} noValidate>
                  <TextField
                    fullWidth
                    label="Adresse email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (emailError) setEmailError('');
                    }}
                    error={!!emailError}
                    helperText={emailError}
                    autoComplete="email"
                    autoFocus
                    sx={{ mb: 3 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                        </InputAdornment>
                      ),
                    }}
                  />

                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    size="large"
                    disabled={loading}
                    sx={{
                      py: 1.5,
                      fontSize: '1rem',
                      fontWeight: 600,
                      mb: 2,
                      background: 'linear-gradient(135deg, #0D3B50, #1B5E7B)',
                      boxShadow: '0 4px 16px rgba(13, 59, 80, 0.35)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #0A2F40, #165270)',
                        boxShadow: '0 6px 20px rgba(13, 59, 80, 0.45)',
                      },
                      '&:disabled': {
                        background: 'linear-gradient(135deg, #0D3B50, #1B5E7B)',
                        opacity: 0.7,
                      },
                    }}
                  >
                    {loading ? (
                      <CircularProgress size={24} sx={{ color: '#fff' }} />
                    ) : (
                      'Envoyer le lien'
                    )}
                  </Button>
                </Box>

                {/* Back to login */}
                <Box sx={{ textAlign: 'center' }}>
                  <MuiLink
                    component={Link}
                    to="/login"
                    variant="body2"
                    sx={{
                      color: 'primary.main',
                      textDecoration: 'none',
                      fontWeight: 500,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 0.5,
                      '&:hover': { textDecoration: 'underline' },
                    }}
                  >
                    <ArrowBackIcon sx={{ fontSize: 16 }} />
                    Retour à la connexion
                  </MuiLink>
                </Box>
              </>
            )}

            {/* Footer text */}
            <Typography
              variant="caption"
              sx={{
                display: 'block',
                textAlign: 'center',
                mt: 4,
                color: 'text.secondary',
              }}
            >
              SGS - Système de Gestion Scolaire
            </Typography>
          </CardContent>
        </Card>
      </Fade>
    </Box>
  );
}

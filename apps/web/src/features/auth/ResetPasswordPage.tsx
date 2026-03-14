import { useState, useEffect, FormEvent } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Box, Card, CardContent, TextField, Button, Typography, CircularProgress, Alert,
} from '@mui/material';
import { School, ArrowBack, Lock } from '@mui/icons-material';
import api from '../../services/api/client';

export default function ResetPasswordPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [motDePasse, setMotDePasse] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (motDePasse.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }
    if (motDePasse !== confirm) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, motDePasse });
      setSuccess(true);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: { message?: string } } } };
      setError(error.response?.data?.error?.message || 'Erreur lors de la réinitialisation');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Box sx={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(135deg, #0D3B50, #1B5E7B, #4A8BA8)',
      }}>
        <Card sx={{ maxWidth: 440, width: '100%', mx: 2, borderRadius: 4, boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
          <CardContent sx={{ p: 4, textAlign: 'center' }}>
            <Box sx={{ mb: 2, p: 2, borderRadius: '50%', bgcolor: 'success.main', display: 'inline-flex', color: '#fff' }}>
              <Lock fontSize="large" />
            </Box>
            <Typography variant="h5" sx={{ mb: 1, fontWeight: 700 }}>Mot de passe réinitialisé</Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              Votre mot de passe a été modifié avec succès.
            </Typography>
            <Button variant="contained" fullWidth onClick={() => navigate('/login')}>
              Se connecter
            </Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #0D3B50, #1B5E7B, #4A8BA8)',
    }}>
      <Card sx={{ maxWidth: 440, width: '100%', mx: 2, borderRadius: 4, boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Box sx={{ mb: 2, p: 1.5, borderRadius: '50%', bgcolor: 'primary.main', display: 'inline-flex', color: '#fff' }}>
              <School fontSize="large" />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>Nouveau mot de passe</Typography>
            <Typography color="text.secondary" sx={{ mt: 0.5 }}>
              Choisissez un nouveau mot de passe sécurisé
            </Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

          <form onSubmit={handleSubmit}>
            <TextField
              label="Nouveau mot de passe"
              type="password"
              value={motDePasse}
              onChange={(e) => setMotDePasse(e.target.value)}
              fullWidth
              required
              sx={{ mb: 2 }}
            />
            <TextField
              label="Confirmer le mot de passe"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              fullWidth
              required
              sx={{ mb: 3 }}
            />
            <Button type="submit" variant="contained" fullWidth size="large" disabled={loading}>
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Réinitialiser'}
            </Button>
          </form>

          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Button component={Link} to="/login" startIcon={<ArrowBack />} sx={{ color: 'text.secondary' }}>
              Retour à la connexion
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

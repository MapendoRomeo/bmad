import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  Box,
  Button,
  Chip,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Visibility as ViewIcon,
  CheckCircleOutline as AdmitIcon,
} from '@mui/icons-material';
import api from '../../services/api/client';
import { showSnackbar } from '../../store/slices/uiSlice';
import Loader from '../../components/common/Loader';

interface Eleve {
  id: string;
  numeroEleve: string;
  nom: string;
  prenom: string;
  classe?: { id: string; nom: string } | null;
  statut: 'inscrit' | 'admis' | 'desinscrit';
}

interface ElevesResponse {
  data: Eleve[];
  total: number;
  page: number;
  limit: number;
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

export default function ElevesPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [eleves, setEleves] = useState<Eleve[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [statut, setStatut] = useState('tous');
  const [loading, setLoading] = useState(true);

  const fetchEleves = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = {
        page: page + 1,
        limit: rowsPerPage,
      };
      if (search.trim()) params.search = search.trim();
      if (statut !== 'tous') params.statut = statut;

      const { data } = await api.get<ElevesResponse>('/eleves', { params });
      setEleves(data.data);
      setTotal(data.total);
    } catch {
      dispatch(showSnackbar({ message: 'Erreur lors du chargement des élèves', severity: 'error' }));
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, search, statut, dispatch]);

  useEffect(() => {
    fetchEleves();
  }, [fetchEleves]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(0);
  };

  const handleStatutChange = (value: string) => {
    setStatut(value);
    setPage(0);
  };

  const handlePageChange = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  const handleQuickAdmit = async (eleveId: string) => {
    try {
      await api.patch(`/eleves/${eleveId}/admettre`);
      dispatch(showSnackbar({ message: 'Élève admis avec succès', severity: 'success' }));
      fetchEleves();
    } catch {
      dispatch(showSnackbar({ message: "Erreur lors de l'admission", severity: 'error' }));
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight={700}>
          Gestion des Élèves
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/eleves/inscription')}
          sx={{ textTransform: 'none', borderRadius: 2 }}
        >
          Nouvelle inscription
        </Button>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            placeholder="Rechercher un élève..."
            value={search}
            onChange={handleSearch}
            size="small"
            sx={{ minWidth: 280, flex: 1 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Statut</InputLabel>
            <Select
              value={statut}
              label="Statut"
              onChange={(e) => handleStatutChange(e.target.value)}
            >
              <MenuItem value="tous">Tous les statuts</MenuItem>
              <MenuItem value="inscrit">Inscrit</MenuItem>
              <MenuItem value="admis">Admis</MenuItem>
              <MenuItem value="desinscrit">Désinscrit</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {/* Table */}
      {loading ? (
        <Loader message="Chargement des élèves..." />
      ) : (
        <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: 'grey.50' }}>
                  <TableCell sx={{ fontWeight: 600 }}>Numéro</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Nom</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Prénom</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Classe</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Statut</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {eleves.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                      <Typography color="text.secondary">Aucun élève trouvé</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  eleves.map((eleve) => (
                    <TableRow
                      key={eleve.id}
                      hover
                      sx={{ cursor: 'pointer', '&:last-child td': { border: 0 } }}
                    >
                      <TableCell>{eleve.numeroEleve}</TableCell>
                      <TableCell>{eleve.nom}</TableCell>
                      <TableCell>{eleve.prenom}</TableCell>
                      <TableCell>{eleve.classe?.nom ?? '—'}</TableCell>
                      <TableCell>
                        <Chip
                          label={statutLabels[eleve.statut] ?? eleve.statut}
                          color={statutColors[eleve.statut] ?? 'default'}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Voir le détail">
                          <IconButton
                            size="small"
                            onClick={() => navigate(`/eleves/${eleve.id}`)}
                            color="primary"
                          >
                            <ViewIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        {eleve.statut === 'inscrit' && (
                          <Tooltip title="Admettre rapidement">
                            <IconButton
                              size="small"
                              onClick={() => handleQuickAdmit(eleve.id)}
                              color="success"
                            >
                              <AdmitIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={total}
            page={page}
            onPageChange={handlePageChange}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleRowsPerPageChange}
            rowsPerPageOptions={[5, 10, 25, 50]}
            labelRowsPerPage="Lignes par page"
            labelDisplayedRows={({ from, to, count }) =>
              `${from}-${to} sur ${count !== -1 ? count : `plus de ${to}`}`
            }
          />
        </Paper>
      )}
    </Box>
  );
}

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { elevesApi } from '../../services/api/eleves.api';

interface Eleve {
  id: string;
  nom: string;
  prenom: string;
  dateNaissance: string;
  sexe: string;
  statut: string;
  numeroEleve?: string;
  classeId?: string;
  [key: string]: unknown;
}

interface ElevesState {
  list: Eleve[];
  selected: Eleve | null;
  total: number;
  loading: boolean;
  error: string | null;
  filters: { search: string; statut: string; classeId: string; page: number; limit: number };
}

const initialState: ElevesState = {
  list: [],
  selected: null,
  total: 0,
  loading: false,
  error: null,
  filters: { search: '', statut: '', classeId: '', page: 1, limit: 10 },
};

export const fetchEleves = createAsyncThunk('eleves/fetchAll', async (params: Record<string, unknown> | undefined, { rejectWithValue }) => {
  try {
    const res = await elevesApi.getAll(params);
    return res.data;
  } catch (err: unknown) {
    const error = err as { response?: { data?: { error?: { message?: string } } } };
    return rejectWithValue(error.response?.data?.error?.message || 'Erreur lors du chargement des élèves');
  }
});

export const fetchEleveById = createAsyncThunk('eleves/fetchById', async (id: string, { rejectWithValue }) => {
  try {
    const res = await elevesApi.getById(id);
    return res.data;
  } catch (err: unknown) {
    const error = err as { response?: { data?: { error?: { message?: string } } } };
    return rejectWithValue(error.response?.data?.error?.message || 'Erreur lors du chargement de l\'élève');
  }
});

const elevesSlice = createSlice({
  name: 'eleves',
  initialState,
  reducers: {
    setFilters(state, action: PayloadAction<Partial<ElevesState['filters']>>) {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearSelected(state) {
      state.selected = null;
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEleves.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchEleves.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.data || action.payload;
        state.total = action.payload.pagination?.total || state.list.length;
      })
      .addCase(fetchEleves.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })
      .addCase(fetchEleveById.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchEleveById.fulfilled, (state, action) => { state.loading = false; state.selected = action.payload; })
      .addCase(fetchEleveById.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; });
  },
});

export const { setFilters, clearSelected, clearError } = elevesSlice.actions;
export default elevesSlice.reducer;

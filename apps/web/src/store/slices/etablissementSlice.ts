import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { etablissementsApi } from '../../services/api/etablissements.api';

interface EtablissementState {
  current: Record<string, unknown> | null;
  anneesScolaires: Record<string, unknown>[];
  loading: boolean;
  error: string | null;
}

const initialState: EtablissementState = {
  current: null,
  anneesScolaires: [],
  loading: false,
  error: null,
};

export const fetchEtablissement = createAsyncThunk('etablissement/fetch', async (id: string, { rejectWithValue }) => {
  try {
    const res = await etablissementsApi.get(id);
    return res.data;
  } catch (err: unknown) {
    const error = err as { response?: { data?: { error?: { message?: string } } } };
    return rejectWithValue(error.response?.data?.error?.message || 'Erreur');
  }
});

export const fetchAnneesScolaires = createAsyncThunk('etablissement/fetchAnnees', async (etabId: string, { rejectWithValue }) => {
  try {
    const res = await etablissementsApi.getAnneesScolaires(etabId);
    return res.data;
  } catch (err: unknown) {
    const error = err as { response?: { data?: { error?: { message?: string } } } };
    return rejectWithValue(error.response?.data?.error?.message || 'Erreur');
  }
});

const etablissementSlice = createSlice({
  name: 'etablissement',
  initialState,
  reducers: {
    clearError(state) { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEtablissement.pending, (state) => { state.loading = true; })
      .addCase(fetchEtablissement.fulfilled, (state, action) => { state.loading = false; state.current = action.payload; })
      .addCase(fetchEtablissement.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })
      .addCase(fetchAnneesScolaires.pending, (state) => { state.loading = true; })
      .addCase(fetchAnneesScolaires.fulfilled, (state, action) => { state.loading = false; state.anneesScolaires = action.payload.data || action.payload; })
      .addCase(fetchAnneesScolaires.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; });
  },
});

export const { clearError } = etablissementSlice.actions;
export default etablissementSlice.reducer;

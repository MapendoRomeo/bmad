import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { financierApi } from '../../services/api/financier.api';

interface FinancierState {
  factures: Record<string, unknown>[];
  paiements: Record<string, unknown>[];
  typesFrais: Record<string, unknown>[];
  loading: boolean;
  error: string | null;
}

const initialState: FinancierState = {
  factures: [],
  paiements: [],
  typesFrais: [],
  loading: false,
  error: null,
};

export const fetchFactures = createAsyncThunk('financier/fetchFactures', async (params: Record<string, unknown> | undefined, { rejectWithValue }) => {
  try {
    const res = await financierApi.getFactures(params);
    return res.data;
  } catch (err: unknown) {
    const error = err as { response?: { data?: { error?: { message?: string } } } };
    return rejectWithValue(error.response?.data?.error?.message || 'Erreur');
  }
});

export const fetchPaiements = createAsyncThunk('financier/fetchPaiements', async (params: Record<string, unknown> | undefined, { rejectWithValue }) => {
  try {
    const res = await financierApi.getPaiements(params);
    return res.data;
  } catch (err: unknown) {
    const error = err as { response?: { data?: { error?: { message?: string } } } };
    return rejectWithValue(error.response?.data?.error?.message || 'Erreur');
  }
});

export const fetchTypesFrais = createAsyncThunk('financier/fetchTypesFrais', async (_, { rejectWithValue }) => {
  try {
    const res = await financierApi.getTypesFrais();
    return res.data;
  } catch (err: unknown) {
    const error = err as { response?: { data?: { error?: { message?: string } } } };
    return rejectWithValue(error.response?.data?.error?.message || 'Erreur');
  }
});

const financierSlice = createSlice({
  name: 'financier',
  initialState,
  reducers: {
    clearError(state) { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFactures.pending, (state) => { state.loading = true; })
      .addCase(fetchFactures.fulfilled, (state, action) => { state.loading = false; state.factures = action.payload.data || action.payload; })
      .addCase(fetchFactures.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })
      .addCase(fetchPaiements.pending, (state) => { state.loading = true; })
      .addCase(fetchPaiements.fulfilled, (state, action) => { state.loading = false; state.paiements = action.payload.data || action.payload; })
      .addCase(fetchPaiements.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })
      .addCase(fetchTypesFrais.pending, (state) => { state.loading = true; })
      .addCase(fetchTypesFrais.fulfilled, (state, action) => { state.loading = false; state.typesFrais = action.payload.data || action.payload; })
      .addCase(fetchTypesFrais.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; });
  },
});

export const { clearError } = financierSlice.actions;
export default financierSlice.reducer;

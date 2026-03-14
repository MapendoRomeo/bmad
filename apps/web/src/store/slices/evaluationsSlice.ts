import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { evaluationsApi } from '../../services/api/evaluations.api';

interface EvaluationsState {
  notes: Record<string, unknown>[];
  periodes: Record<string, unknown>[];
  matieres: Record<string, unknown>[];
  loading: boolean;
  error: string | null;
}

const initialState: EvaluationsState = {
  notes: [],
  periodes: [],
  matieres: [],
  loading: false,
  error: null,
};

export const fetchPeriodes = createAsyncThunk('evaluations/fetchPeriodes', async (params: Record<string, unknown> | undefined, { rejectWithValue }) => {
  try {
    const res = await evaluationsApi.getPeriodes(params);
    return res.data;
  } catch (err: unknown) {
    const error = err as { response?: { data?: { error?: { message?: string } } } };
    return rejectWithValue(error.response?.data?.error?.message || 'Erreur');
  }
});

export const fetchNotes = createAsyncThunk('evaluations/fetchNotes', async (params: Record<string, unknown>, { rejectWithValue }) => {
  try {
    const res = await evaluationsApi.getNotes(params);
    return res.data;
  } catch (err: unknown) {
    const error = err as { response?: { data?: { error?: { message?: string } } } };
    return rejectWithValue(error.response?.data?.error?.message || 'Erreur');
  }
});

export const fetchMatieres = createAsyncThunk('evaluations/fetchMatieres', async (params: Record<string, unknown> | undefined, { rejectWithValue }) => {
  try {
    const res = await evaluationsApi.getMatieres(params);
    return res.data;
  } catch (err: unknown) {
    const error = err as { response?: { data?: { error?: { message?: string } } } };
    return rejectWithValue(error.response?.data?.error?.message || 'Erreur');
  }
});

const evaluationsSlice = createSlice({
  name: 'evaluations',
  initialState,
  reducers: {
    clearError(state) { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPeriodes.pending, (state) => { state.loading = true; })
      .addCase(fetchPeriodes.fulfilled, (state, action) => { state.loading = false; state.periodes = action.payload.data || action.payload; })
      .addCase(fetchPeriodes.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })
      .addCase(fetchNotes.pending, (state) => { state.loading = true; })
      .addCase(fetchNotes.fulfilled, (state, action) => { state.loading = false; state.notes = action.payload.data || action.payload; })
      .addCase(fetchNotes.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })
      .addCase(fetchMatieres.pending, (state) => { state.loading = true; })
      .addCase(fetchMatieres.fulfilled, (state, action) => { state.loading = false; state.matieres = action.payload.data || action.payload; })
      .addCase(fetchMatieres.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; });
  },
});

export const { clearError } = evaluationsSlice.actions;
export default evaluationsSlice.reducer;

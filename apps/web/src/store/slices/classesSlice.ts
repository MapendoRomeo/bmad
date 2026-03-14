import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { classesApi } from '../../services/api/classes.api';

interface Classe {
  id: string;
  nom: string;
  niveau: string;
  capaciteMax: number;
  effectifActuel: number;
  [key: string]: unknown;
}

interface ClassesState {
  list: Classe[];
  selected: Classe | null;
  loading: boolean;
  error: string | null;
}

const initialState: ClassesState = {
  list: [],
  selected: null,
  loading: false,
  error: null,
};

export const fetchClasses = createAsyncThunk('classes/fetchAll', async (params: Record<string, unknown> | undefined, { rejectWithValue }) => {
  try {
    const res = await classesApi.getAll(params);
    return res.data;
  } catch (err: unknown) {
    const error = err as { response?: { data?: { error?: { message?: string } } } };
    return rejectWithValue(error.response?.data?.error?.message || 'Erreur lors du chargement des classes');
  }
});

export const fetchClasseById = createAsyncThunk('classes/fetchById', async (id: string, { rejectWithValue }) => {
  try {
    const res = await classesApi.getById(id);
    return res.data;
  } catch (err: unknown) {
    const error = err as { response?: { data?: { error?: { message?: string } } } };
    return rejectWithValue(error.response?.data?.error?.message || 'Erreur lors du chargement de la classe');
  }
});

const classesSlice = createSlice({
  name: 'classes',
  initialState,
  reducers: {
    clearSelected(state) { state.selected = null; },
    clearError(state) { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchClasses.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchClasses.fulfilled, (state, action) => { state.loading = false; state.list = action.payload.data || action.payload; })
      .addCase(fetchClasses.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })
      .addCase(fetchClasseById.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchClasseById.fulfilled, (state, action) => { state.loading = false; state.selected = action.payload; })
      .addCase(fetchClasseById.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; });
  },
});

export const { clearSelected, clearError } = classesSlice.actions;
export default classesSlice.reducer;

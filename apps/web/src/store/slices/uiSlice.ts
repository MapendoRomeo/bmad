import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UiState {
  sidebarOpen: boolean;
  loading: boolean;
  snackbar: { open: boolean; message: string; severity: 'success' | 'error' | 'warning' | 'info' };
}

const initialState: UiState = {
  sidebarOpen: true,
  loading: false,
  snackbar: { open: false, message: '', severity: 'info' },
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar(state) {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen(state, action: PayloadAction<boolean>) {
      state.sidebarOpen = action.payload;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    showSnackbar(state, action: PayloadAction<{ message: string; severity: 'success' | 'error' | 'warning' | 'info' }>) {
      state.snackbar = { open: true, ...action.payload };
    },
    hideSnackbar(state) {
      state.snackbar.open = false;
    },
  },
});

export const { toggleSidebar, setSidebarOpen, setLoading, showSnackbar, hideSnackbar } = uiSlice.actions;
export default uiSlice.reducer;

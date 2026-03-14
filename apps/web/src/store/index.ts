import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import uiReducer from './slices/uiSlice';
import elevesReducer from './slices/elevesSlice';
import classesReducer from './slices/classesSlice';
import evaluationsReducer from './slices/evaluationsSlice';
import financierReducer from './slices/financierSlice';
import etablissementReducer from './slices/etablissementSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    eleves: elevesReducer,
    classes: classesReducer,
    evaluations: evaluationsReducer,
    financier: financierReducer,
    etablissement: etablissementReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

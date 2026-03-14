import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';
import { useSelector } from 'react-redux';
import { RootState } from './store';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import AppSnackbar from './components/common/AppSnackbar';
import Loader from './components/common/Loader';

// Lazy-loaded pages
const Login = lazy(() => import('./features/auth/LoginPage'));
const ForgotPassword = lazy(() => import('./features/auth/ForgotPasswordPage'));
const DashboardPage = lazy(() => import('./features/dashboard/DashboardPage'));
const ElevesPage = lazy(() => import('./features/eleves/ElevesPage'));
const EleveDetailPage = lazy(() => import('./features/eleves/EleveDetailPage'));
const EleveInscriptionPage = lazy(() => import('./features/eleves/EleveInscriptionPage'));
const ClassesPage = lazy(() => import('./features/classes/ClassesPage'));
const ClasseDetailPage = lazy(() => import('./features/classes/ClasseDetailPage'));
const EnseignantsPage = lazy(() => import('./features/enseignants/EnseignantsPage'));
const EvaluationsPage = lazy(() => import('./features/evaluations/EvaluationsPage'));
const PresencesPage = lazy(() => import('./features/presence/PresencesPage'));
const FacturesPage = lazy(() => import('./features/financier/FacturesPage'));
const PaiementsPage = lazy(() => import('./features/financier/PaiementsPage'));
const RapportsPage = lazy(() => import('./features/financier/RapportsPage'));
const ConfigFraisPage = lazy(() => import('./features/financier/ConfigFraisPage'));
const ExportsPage = lazy(() => import('./features/exports/ExportsPage'));
const UtilisateursPage = lazy(() => import('./features/utilisateurs/UtilisateursPage'));

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = useSelector((s: RootState) => s.auth.token);
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AppLayout() {
  const sidebarOpen = useSelector((s: RootState) => s.ui.sidebarOpen);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: 'background.default' }}>
      <Sidebar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          transition: 'margin-left 0.3s',
          marginLeft: { md: sidebarOpen ? '260px' : 0, xs: 0 },
          width: { md: sidebarOpen ? 'calc(100% - 260px)' : '100%', xs: '100%' },
        }}
      >
        <Header />
        <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1400, mx: 'auto' }}>
          <Suspense fallback={<Loader message="Chargement..." />}>
            <Routes>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/eleves" element={<ElevesPage />} />
              <Route path="/eleves/inscription" element={<EleveInscriptionPage />} />
              <Route path="/eleves/:id" element={<EleveDetailPage />} />
              <Route path="/classes" element={<ClassesPage />} />
              <Route path="/classes/:id" element={<ClasseDetailPage />} />
              <Route path="/enseignants" element={<EnseignantsPage />} />
              <Route path="/evaluations" element={<EvaluationsPage />} />
              <Route path="/presences" element={<PresencesPage />} />
              <Route path="/financier/factures" element={<FacturesPage />} />
              <Route path="/financier/paiements" element={<PaiementsPage />} />
              <Route path="/financier/rapports" element={<RapportsPage />} />
              <Route path="/financier/config" element={<ConfigFraisPage />} />
              <Route path="/exports" element={<ExportsPage />} />
              <Route path="/utilisateurs" element={<UtilisateursPage />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Suspense>
        </Box>
      </Box>
    </Box>
  );
}

export default function App() {
  return (
    <>
      <Suspense fallback={<Loader fullPage message="Chargement de l'application..." />}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Suspense>
      <AppSnackbar />
    </>
  );
}

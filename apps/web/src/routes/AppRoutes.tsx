import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Loader from '../components/common/Loader';

// Lazy-loaded pages
const Login = lazy(() => import('../features/auth/LoginPage'));
const ForgotPassword = lazy(() => import('../features/auth/ForgotPasswordPage'));
const ResetPassword = lazy(() => import('../features/auth/ResetPasswordPage'));
const DashboardPage = lazy(() => import('../features/dashboard/DashboardPage'));
const ElevesPage = lazy(() => import('../features/eleves/ElevesPage'));
const EleveDetailPage = lazy(() => import('../features/eleves/EleveDetailPage'));
const EleveInscriptionPage = lazy(() => import('../features/eleves/EleveInscriptionPage'));
const ClassesPage = lazy(() => import('../features/classes/ClassesPage'));
const ClasseDetailPage = lazy(() => import('../features/classes/ClasseDetailPage'));
const EnseignantsPage = lazy(() => import('../features/enseignants/EnseignantsPage'));
const EvaluationsPage = lazy(() => import('../features/evaluations/EvaluationsPage'));
const PresencesPage = lazy(() => import('../features/presence/PresencesPage'));
const FacturesPage = lazy(() => import('../features/financier/FacturesPage'));
const PaiementsPage = lazy(() => import('../features/financier/PaiementsPage'));
const RapportsPage = lazy(() => import('../features/financier/RapportsPage'));
const ConfigFraisPage = lazy(() => import('../features/financier/ConfigFraisPage'));
const ExportsPage = lazy(() => import('../features/exports/ExportsPage'));
const UtilisateursPage = lazy(() => import('../features/utilisateurs/UtilisateursPage'));
const EtablissementPage = lazy(() => import('../features/etablissements/EtablissementPage'));

/** Routes publiques (login, mot de passe oublié, reset) */
export function PublicRoutes() {
  return (
    <Suspense fallback={<Loader fullPage message="Chargement..." />}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
      </Routes>
    </Suspense>
  );
}

/** Routes protégées intégrées dans le layout principal */
export function ProtectedRoutes() {
  return (
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
        <Route path="/etablissement" element={<EtablissementPage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  );
}

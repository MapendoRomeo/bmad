import { Routes, Route } from 'react-router-dom';
import { Box } from '@mui/material';
import { useSelector } from 'react-redux';
import { RootState } from './store';
import { PublicRoutes, ProtectedRoutes } from './routes/AppRoutes';
import ProtectedRoute from './routes/ProtectedRoute';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import AppSnackbar from './components/common/AppSnackbar';

/** Layout principal avec sidebar et header */
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
          <ProtectedRoutes />
        </Box>
      </Box>
    </Box>
  );
}

export default function App() {
  return (
    <>
      <PublicRoutes />
      <Routes>
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        />
      </Routes>
      <AppSnackbar />
    </>
  );
}

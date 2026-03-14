import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Drawer, List, ListItemButton, ListItemIcon, ListItemText,
  Box, Typography, Divider, Avatar, IconButton, useMediaQuery, useTheme,
} from '@mui/material';
import {
  Dashboard, People, School, Class as ClassIcon, Person,
  Assessment, EventNote, AttachMoney, Receipt, BarChart,
  FileDownload, Settings, ChevronLeft,
} from '@mui/icons-material';
import { RootState } from '../../store';
import { setSidebarOpen } from '../../store/slices/uiSlice';

const DRAWER_WIDTH = 260;

interface NavItem {
  label: string;
  icon: React.ReactNode;
  path: string;
  roles?: string[];
}

const navItems: NavItem[] = [
  { label: 'Tableau de bord', icon: <Dashboard />, path: '/dashboard' },
  { label: 'Élèves', icon: <People />, path: '/eleves', roles: ['directeur', 'admin', 'secretaire'] },
  { label: 'Classes', icon: <ClassIcon />, path: '/classes' },
  { label: 'Enseignants', icon: <Person />, path: '/enseignants', roles: ['directeur', 'admin'] },
  { label: 'Évaluations', icon: <Assessment />, path: '/evaluations', roles: ['directeur', 'admin', 'enseignant'] },
  { label: 'Présences', icon: <EventNote />, path: '/presences', roles: ['directeur', 'admin', 'enseignant'] },
  { label: 'Facturation', icon: <Receipt />, path: '/financier/factures', roles: ['directeur', 'admin', 'comptable'] },
  { label: 'Paiements', icon: <AttachMoney />, path: '/financier/paiements', roles: ['directeur', 'admin', 'comptable'] },
  { label: 'Rapports', icon: <BarChart />, path: '/financier/rapports', roles: ['directeur', 'admin', 'comptable'] },
  { label: 'Exports', icon: <FileDownload />, path: '/exports', roles: ['directeur', 'admin', 'secretaire', 'comptable'] },
  { label: 'Utilisateurs', icon: <Settings />, path: '/utilisateurs', roles: ['directeur', 'admin'] },
];

export default function Sidebar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { sidebarOpen } = useSelector((s: RootState) => s.ui);
  const user = useSelector((s: RootState) => s.auth.user);

  const visibleItems = navItems.filter(
    (item) => !item.roles || (user && item.roles.includes(user.role)),
  );

  return (
    <Drawer
      variant={isMobile ? 'temporary' : 'persistent'}
      open={sidebarOpen}
      onClose={() => dispatch(setSidebarOpen(false))}
      sx={{
        width: sidebarOpen ? DRAWER_WIDTH : 0,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
          borderRight: 'none',
          background: 'linear-gradient(180deg, #0D3B50 0%, #1B5E7B 100%)',
          color: '#fff',
        },
      }}
    >
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <School sx={{ fontSize: 32, color: '#E8913A' }} />
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#fff', fontSize: '1.1rem' }}>
            SGS
          </Typography>
        </Box>
        {isMobile && (
          <IconButton onClick={() => dispatch(setSidebarOpen(false))} sx={{ color: '#fff' }}>
            <ChevronLeft />
          </IconButton>
        )}
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.12)', mx: 1 }} />

      <List sx={{ flex: 1, px: 1, py: 1 }}>
        {visibleItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          return (
            <ListItemButton
              key={item.path}
              onClick={() => {
                navigate(item.path);
                if (isMobile) dispatch(setSidebarOpen(false));
              }}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                color: isActive ? '#fff' : 'rgba(255,255,255,0.7)',
                backgroundColor: isActive ? 'rgba(232, 145, 58, 0.2)' : 'transparent',
                '&:hover': {
                  backgroundColor: isActive ? 'rgba(232, 145, 58, 0.3)' : 'rgba(255,255,255,0.08)',
                },
              }}
            >
              <ListItemIcon sx={{ color: isActive ? '#E8913A' : 'rgba(255,255,255,0.6)', minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: isActive ? 600 : 400 }}
              />
            </ListItemButton>
          );
        })}
      </List>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.12)', mx: 1 }} />
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Avatar sx={{ width: 36, height: 36, bgcolor: '#E8913A', fontSize: '0.875rem' }}>
          {user?.prenom?.[0]}{user?.nom?.[0]}
        </Avatar>
        <Box sx={{ overflow: 'hidden' }}>
          <Typography variant="body2" sx={{ color: '#fff', fontWeight: 500, fontSize: '0.8rem' }} noWrap>
            {user?.prenom} {user?.nom}
          </Typography>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', textTransform: 'capitalize' }}>
            {user?.role}
          </Typography>
        </Box>
      </Box>
    </Drawer>
  );
}

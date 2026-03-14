import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState, AppDispatch } from '../store';
import { loginAsync, logout, clearError } from '../store/slices/authSlice';

export function useAuth() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { user, token, loading, error } = useSelector((s: RootState) => s.auth);

  const isAuthenticated = !!token;

  const login = async (email: string, motDePasse: string) => {
    const result = await dispatch(loginAsync({ email, motDePasse }));
    if (loginAsync.fulfilled.match(result)) {
      navigate('/dashboard');
    }
    return result;
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return { user, token, isAuthenticated, loading, error, login, logout: handleLogout, clearError: () => dispatch(clearError()) };
}

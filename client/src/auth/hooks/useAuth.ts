import { useAppDispatch, useAppSelector } from '../../shared/store';
import { 
  selectUser, 
  selectIsAuthenticated, 
  selectIsLoading, 
  selectAuthError
} from '../store/selectors';
import { logoutUser, checkUserAuth } from '../store/authSlice';

export const useAuth = () => {
  const dispatch = useAppDispatch();

  const user = useAppSelector(selectUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isLoading = useAppSelector(selectIsLoading);
  const error = useAppSelector(selectAuthError);

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  const refreshUser = () => {
    dispatch(checkUserAuth());
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    logout: handleLogout,
    refreshUser,
  };
};
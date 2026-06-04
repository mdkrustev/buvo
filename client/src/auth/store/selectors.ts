import { type RootState } from '../../shared/store/store';

const selectAuthDomain = (state: RootState) => state.auth;

export const selectUser = (state: RootState) => selectAuthDomain(state).user;

export const selectIsAuthenticated = (state: RootState) => {
  const user = selectUser(state);
  return !!user;
};

export const selectIsLoading = (state: RootState) => selectAuthDomain(state).isLoading;

export const selectAuthError = (state: RootState) => selectAuthDomain(state).error;

export const selectAuthState = (state: RootState) => selectAuthDomain(state);
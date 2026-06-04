import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { authApi } from '../api/authApi';
import type { User } from '../api/types';
import type { ApiError } from '../../shared/utils/apiFetch';

// --- 1. (Initial State) ---
interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: ApiError | null;
}

const initialState: AuthState = {
  user: null,
  isLoading: false,
  isAuthenticated: false,
  error: null,
};

// --- 2. Async Thunks ---
export const checkUserAuth = createAsyncThunk<
  User,
  void,                   
  { rejectValue: ApiError }
>(
  'auth/checkUserAuth',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authApi.getMe();
      return response;
    } catch (error: any) {
      return rejectWithValue(error as ApiError);
    }
  }
);

export const logoutUser = createAsyncThunk<void, void>(
  'auth/logoutUser',
  async () => {
    await authApi.logOut();
  }
);

// --- 3. Slice Definition ---
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
  },
  extraReducers: (builder) => {
    builder
      // --- Логика за checkUserAuth ---
      .addCase(checkUserAuth.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(checkUserAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(checkUserAuth.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.error = action.payload || { message: 'Failed to check auth', status: 0 };
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
      });
  },
});

export const { clearError, setUser } = authSlice.actions;
export default authSlice.reducer;
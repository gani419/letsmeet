import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { supabase } from '../../api/supabaseClient';
import { AuthState, UserProfile } from '../../types';

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// Async Thunk: Sign Up with Supabase Auth
export const registerUser = createAsyncThunk(
  'auth/register',
  async (
    { email, password, fullName }: { email: string; password: string; fullName: string },
    { rejectWithValue }
  ) => {
    try {
      const defaultAvatar = `https://api.dicebear.com/7.x/bottts/png?seed=${encodeURIComponent(
        fullName || email
      )}`;

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            avatar_url: defaultAvatar,
          },
        },
      });

      if (error) {
        return rejectWithValue(error.message);
      }

      if (!data.user) {
        return rejectWithValue('User registration failed');
      }

      // Check or insert profile record
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      const userProfile: UserProfile = {
        id: data.user.id,
        email: data.user.email ?? email,
        fullName: profile?.full_name ?? fullName,
        avatarUrl: profile?.avatar_url ?? defaultAvatar,
      };

      return {
        user: userProfile,
        token: data.session?.access_token ?? null,
      };
    } catch (err: any) {
      return rejectWithValue(err.message || 'An error occurred during registration');
    }
  }
);

// Async Thunk: Sign In with Supabase Auth
export const loginUser = createAsyncThunk(
  'auth/login',
  async (
    { email, password }: { email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return rejectWithValue(error.message);
      }

      if (!data.user) {
        return rejectWithValue('User not found');
      }

      // Fetch user profile from profiles table
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      const userProfile: UserProfile = {
        id: data.user.id,
        email: data.user.email ?? email,
        fullName: profile?.full_name ?? data.user.user_metadata?.full_name ?? 'User',
        avatarUrl:
          profile?.avatar_url ??
          data.user.user_metadata?.avatar_url ??
          `https://api.dicebear.com/7.x/bottts/png?seed=${data.user.id}`,
      };

      return {
        user: userProfile,
        token: data.session?.access_token ?? null,
      };
    } catch (err: any) {
      return rejectWithValue(err.message || 'Login failed');
    }
  }
);

// Async Thunk: Check existing Supabase session
export const checkSession = createAsyncThunk(
  'auth/checkSession',
  async (_, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error || !data.session?.user) {
        return null;
      }

      const user = data.session.user;
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      const userProfile: UserProfile = {
        id: user.id,
        email: user.email ?? '',
        fullName: profile?.full_name ?? user.user_metadata?.full_name ?? 'User',
        avatarUrl:
          profile?.avatar_url ??
          `https://api.dicebear.com/7.x/bottts/png?seed=${user.id}`,
      };

      return {
        user: userProfile,
        token: data.session.access_token,
      };
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

// Async Thunk: Logout
export const logoutUser = createAsyncThunk('auth/logout', async () => {
  await supabase.auth.signOut();
  return null;
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    updateLocalAvatar: (state, action: PayloadAction<string>) => {
      if (state.user) {
        state.user.avatarUrl = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    // Register
    builder
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Check Session
    builder.addCase(checkSession.fulfilled, (state, action) => {
      if (action.payload) {
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      } else {
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
      }
    });

    // Logout
    builder.addCase(logoutUser.fulfilled, (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
    });
  },
});

export const { clearError, updateLocalAvatar } = authSlice.actions;
export default authSlice.reducer;

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { supabase } from '../../api/supabaseClient';
import { avatarService } from '../../api/avatarService';
import { updateLocalAvatar } from './authSlice';

interface UserSliceState {
  isGeneratingAvatar: boolean;
  avatarError: string | null;
}

const initialState: UserSliceState = {
  isGeneratingAvatar: false,
  avatarError: null,
};

// Async Thunk: Generate AI Avatar from photo & save to Supabase Profile
export const generateAndSaveAvatar = createAsyncThunk(
  'user/generateAndSaveAvatar',
  async (
    {
      userId,
      imageUri,
      fullName,
    }: { userId: string; imageUri: string; fullName: string },
    { dispatch, rejectWithValue }
  ) => {
    try {
      // 1. Process image with AI / DiceBear fallback
      const avatarUrl = await avatarService.generateAIAvatar(imageUri, fullName);

      // 2. Update Supabase profiles table
      const { error } = await supabase
        .from('profiles')
        .update({
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (error) {
        return rejectWithValue(error.message);
      }

      // 3. Update auth state so UI refreshes immediately
      dispatch(updateLocalAvatar(avatarUrl));

      return avatarUrl;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to update avatar');
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearAvatarError: (state) => {
      state.avatarError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(generateAndSaveAvatar.pending, (state) => {
        state.isGeneratingAvatar = true;
        state.avatarError = null;
      })
      .addCase(generateAndSaveAvatar.fulfilled, (state) => {
        state.isGeneratingAvatar = false;
      })
      .addCase(generateAndSaveAvatar.rejected, (state, action) => {
        state.isGeneratingAvatar = false;
        state.avatarError = action.payload as string;
      });
  },
});

export const { clearAvatarError } = userSlice.actions;
export default userSlice.reducer;

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { supabase } from '../../api/supabaseClient';
import { Meeting, MeetingHistoryItem, MeetingState } from '../../types';

const initialState: MeetingState = {
  currentMeeting: null,
  recentMeetings: [],
  isLoading: false,
  error: null,
  isMicMuted: false,
  isCameraOff: false,
};

// Helper: Generate Google Meet-like formatted code: "abc-defg-hij"
const generateMeetingCode = (): string => {
  const chars = 'abcdefghijklmnopqrstuvwxyz';
  const segment = (len: number) =>
    Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `${segment(3)}-${segment(4)}-${segment(3)}`;
};

// Async Thunk: Create a new meeting in Supabase
export const createMeeting = createAsyncThunk(
  'meeting/createMeeting',
  async (userId: string, { rejectWithValue }) => {
    try {
      const roomCode = generateMeetingCode();

      const { data, error } = await supabase
        .from('meetings')
        .insert({
          room_code: roomCode,
          created_by: userId,
          is_active: true,
        })
        .select('*')
        .single();

      if (error) {
        return rejectWithValue(error.message);
      }

      // Record in meeting history
      await supabase.from('meeting_history').insert({
        user_id: userId,
        meeting_id: data.id,
      });

      const meeting: Meeting = {
        id: data.id,
        roomCode: data.room_code,
        createdBy: data.created_by,
        createdAt: data.created_at,
        isActive: data.is_active,
      };

      return meeting;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to create meeting');
    }
  }
);

// Async Thunk: Join meeting by room code
export const joinMeeting = createAsyncThunk(
  'meeting/joinMeeting',
  async (
    { roomCode, userId }: { roomCode: string; userId: string },
    { rejectWithValue }
  ) => {
    try {
      const cleanCode = roomCode.trim().toLowerCase();

      // Look up meeting in Supabase
      const { data, error } = await supabase
        .from('meetings')
        .select('*')
        .eq('room_code', cleanCode)
        .single();

      if (error || !data) {
        return rejectWithValue('Meeting not found. Please check the code.');
      }

      if (!data.is_active) {
        return rejectWithValue('This meeting has already ended.');
      }

      // Insert into meeting history
      await supabase.from('meeting_history').insert({
        user_id: userId,
        meeting_id: data.id,
      });

      const meeting: Meeting = {
        id: data.id,
        roomCode: data.room_code,
        createdBy: data.created_by,
        createdAt: data.created_at,
        isActive: data.is_active,
      };

      return meeting;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to join meeting');
    }
  }
);

// Async Thunk: Fetch recent meetings for user
export const fetchRecentMeetings = createAsyncThunk(
  'meeting/fetchRecentMeetings',
  async (userId: string, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('meeting_history')
        .select(`
          id,
          joined_at,
          meetings (
            id,
            room_code
          )
        `)
        .eq('user_id', userId)
        .order('joined_at', { ascending: false })
        .limit(10);

      if (error) {
        return rejectWithValue(error.message);
      }

      const history: MeetingHistoryItem[] = (data || []).map((item: any) => ({
        id: item.id,
        meetingId: item.meetings?.id ?? '',
        roomCode: item.meetings?.room_code ?? 'Unknown',
        joinedAt: item.joined_at,
      }));

      return history;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch history');
    }
  }
);

const meetingSlice = createSlice({
  name: 'meeting',
  initialState,
  reducers: {
    toggleMic: (state) => {
      state.isMicMuted = !state.isMicMuted;
    },
    toggleCamera: (state) => {
      state.isCameraOff = !state.isCameraOff;
    },
    leaveMeeting: (state) => {
      state.currentMeeting = null;
      state.isMicMuted = false;
      state.isCameraOff = false;
    },
    clearMeetingError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Create Meeting
    builder
      .addCase(createMeeting.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createMeeting.fulfilled, (state, action: PayloadAction<Meeting>) => {
        state.isLoading = false;
        state.currentMeeting = action.payload;
      })
      .addCase(createMeeting.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Join Meeting
    builder
      .addCase(joinMeeting.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(joinMeeting.fulfilled, (state, action: PayloadAction<Meeting>) => {
        state.isLoading = false;
        state.currentMeeting = action.payload;
      })
      .addCase(joinMeeting.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Recent meetings
    builder.addCase(fetchRecentMeetings.fulfilled, (state, action: PayloadAction<MeetingHistoryItem[]>) => {
      state.recentMeetings = action.payload;
    });
  },
});

export const { toggleMic, toggleCamera, leaveMeeting, clearMeetingError } = meetingSlice.actions;
export default meetingSlice.reducer;

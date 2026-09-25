export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  avatarUrl: string;
  updatedAt?: string;
}

export interface Meeting {
  id: string;
  roomCode: string;
  createdBy?: string;
  createdAt: string;
  isActive: boolean;
}

export interface MeetingHistoryItem {
  id: string;
  meetingId: string;
  roomCode: string;
  joinedAt: string;
}

export interface AuthState {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface MeetingState {
  currentMeeting: Meeting | null;
  recentMeetings: MeetingHistoryItem[];
  isLoading: boolean;
  error: string | null;
  isMicMuted: boolean;
  isCameraOff: boolean;
}

import { combineReducers } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import meetingReducer from './slices/meetingSlice';
import userReducer from './slices/userSlice';

export const rootReducer = combineReducers({
  auth: authReducer,
  meeting: meetingReducer,
  user: userReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

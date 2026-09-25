import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { useAppDispatch, useAppSelector } from '../../redux/store';
import {
  createMeeting,
  joinMeeting,
  fetchRecentMeetings,
  clearMeetingError,
} from '../../redux/slices/meetingSlice';
import { UserCard } from '../../components/UserCard';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const [inputCode, setInputCode] = useState('');

  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const { recentMeetings, isLoading, error } = useAppSelector(
    (state) => state.meeting
  );

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchRecentMeetings(user.id));
    }
  }, [dispatch, user?.id]);

  useEffect(() => {
    if (error) {
      Alert.alert('Notice', error, [
        { text: 'OK', onPress: () => dispatch(clearMeetingError()) },
      ]);
    }
  }, [error, dispatch]);

  const handleCreateMeeting = async () => {
    if (!user?.id) return;
    const action = await dispatch(createMeeting(user.id));
    if (createMeeting.fulfilled.match(action)) {
      navigation.navigate('MeetingRoom', { roomCode: action.payload.roomCode });
    }
  };

  const handleJoinMeeting = async (codeToJoin?: string) => {
    const code = (codeToJoin || inputCode).trim().toLowerCase();
    if (!code || !user?.id) return;

    const action = await dispatch(joinMeeting({ roomCode: code, userId: user.id }));
    if (joinMeeting.fulfilled.match(action)) {
      setInputCode('');
      navigation.navigate('MeetingRoom', { roomCode: action.payload.roomCode });
    }
  };

  return (
    <View style={styles.container}>
      {/* Top User Card with AI Avatar */}
      <UserCard />

      {/* Main Action Buttons */}
      <View style={styles.actionSection}>
        <TouchableOpacity
          style={styles.newMeetingBtn}
          onPress={handleCreateMeeting}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.btnIcon}>📹</Text>
              <Text style={styles.newMeetingText}>New Meeting</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Join with Code input box */}
        <View style={styles.joinContainer}>
          <TextInput
            style={styles.joinInput}
            placeholder="Enter meeting code (e.g. abc-defg-hij)"
            placeholderTextColor="#64748B"
            value={inputCode}
            onChangeText={setInputCode}
            autoCapitalize="none"
          />
          <TouchableOpacity
            style={[styles.joinBtn, !inputCode.trim() && styles.joinBtnDisabled]}
            onPress={() => handleJoinMeeting()}
            disabled={!inputCode.trim() || isLoading}
          >
            <Text style={styles.joinBtnText}>Join</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recent Meetings Section */}
      <View style={styles.historySection}>
        <Text style={styles.historyTitle}>Recent Meetings</Text>

        {recentMeetings.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No recent meetings yet.</Text>
            <Text style={styles.emptySubText}>
              Start a new meeting or join one with a link or code!
            </Text>
          </View>
        ) : (
          <FlatList
            data={recentMeetings}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <View style={styles.historyItem}>
                <View>
                  <Text style={styles.roomCodeText}>{item.roomCode}</Text>
                  <Text style={styles.dateText}>
                    {new Date(item.joinedAt).toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.rejoinBtn}
                  onPress={() => handleJoinMeeting(item.roomCode)}
                >
                  <Text style={styles.rejoinBtnText}>Rejoin</Text>
                </TouchableOpacity>
              </View>
            )}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  actionSection: {
    paddingHorizontal: 16,
    marginVertical: 10,
  },
  newMeetingBtn: {
    backgroundColor: '#0284C7',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 14,
    shadowColor: '#0284C7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  btnIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  newMeetingText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  joinContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  joinInput: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    color: '#F8FAFC',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
  },
  joinBtn: {
    backgroundColor: '#334155',
    justifyContent: 'center',
    paddingHorizontal: 18,
    borderRadius: 12,
  },
  joinBtnDisabled: {
    opacity: 0.5,
  },
  joinBtnText: {
    color: '#38BDF8',
    fontSize: 14,
    fontWeight: '700',
  },
  historySection: {
    flex: 1,
    marginTop: 14,
    paddingHorizontal: 16,
  },
  historyTitle: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  listContent: {
    paddingBottom: 20,
  },
  historyItem: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  roomCodeText: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '700',
  },
  dateText: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 4,
  },
  rejoinBtn: {
    backgroundColor: '#0369A1',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  rejoinBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 40,
  },
  emptyText: {
    color: '#CBD5E1',
    fontSize: 16,
    fontWeight: '600',
  },
  emptySubText: {
    color: '#64748B',
    fontSize: 13,
    marginTop: 6,
    textAlign: 'center',
    paddingHorizontal: 30,
  },
});

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { useAppSelector } from '../../redux/store';
import { MeetingGrid, ParticipantItem } from '../../components/MeetingGrid';
import { CallControls } from '../../components/CallControls';

type Props = NativeStackScreenProps<RootStackParamList, 'MeetingRoom'>;

export const MeetingRoomScreen: React.FC<Props> = ({ route, navigation }) => {
  const { roomCode } = route.params;

  const user = useAppSelector((state) => state.auth.user);
  const isMicMuted = useAppSelector((state) => state.meeting.isMicMuted);
  const isCameraOff = useAppSelector((state) => state.meeting.isCameraOff);

  // Equal-priority WhatsApp style peer participants list (up to 5 peers)
  const [participants, setParticipants] = useState<ParticipantItem[]>([]);

  useEffect(() => {
    // Initialize with local participant
    const localUser: ParticipantItem = {
      id: user?.id || 'local-user',
      name: user?.fullName || 'You',
      avatarUrl:
        user?.avatarUrl ||
        `https://api.dicebear.com/7.x/bottts/png?seed=${user?.id || 'local'}`,
      isLocal: true,
      isMuted: isMicMuted,
      isVideoOff: isCameraOff,
    };

    setParticipants([localUser]);
  }, [user]);

  // Update local participant state on mic or cam toggle
  useEffect(() => {
    setParticipants((prev) =>
      prev.map((p) =>
        p.isLocal
          ? {
              ...p,
              isMuted: isMicMuted,
              isVideoOff: isCameraOff,
            }
          : p
      )
    );
  }, [isMicMuted, isCameraOff]);

  const handleLeave = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Top Header Bar */}
        <View style={styles.headerBar}>
          <View style={styles.roomCodeContainer}>
            <Text style={styles.roomCodeLabel}>ROOM CODE</Text>
            <Text style={styles.roomCodeValue}>{roomCode}</Text>
          </View>
          <View style={styles.participantCountBadge}>
            <Text style={styles.participantCountText}>
              👥 {participants.length}/5
            </Text>
          </View>
        </View>

        {/* WhatsApp-Style 5-Peer Meeting Grid */}
        <MeetingGrid participants={participants} />

        {/* Bottom Call Controls (Equal priority peers, no host) */}
        <CallControls roomCode={roomCode} onLeave={handleLeave} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  roomCodeContainer: {
    flexDirection: 'column',
  },
  roomCodeLabel: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  roomCodeValue: {
    color: '#38BDF8',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  participantCountBadge: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  participantCountText: {
    color: '#E2E8F0',
    fontSize: 12,
    fontWeight: '600',
  },
});

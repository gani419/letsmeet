import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Share, Alert } from 'react-native';
import { useAppDispatch, useAppSelector } from '../redux/store';
import { toggleMic, toggleCamera, leaveMeeting } from '../redux/slices/meetingSlice';

interface CallControlsProps {
  roomCode: string;
  onLeave: () => void;
}

export const CallControls: React.FC<CallControlsProps> = ({ roomCode, onLeave }) => {
  const dispatch = useAppDispatch();
  const isMicMuted = useAppSelector((state) => state.meeting.isMicMuted);
  const isCameraOff = useAppSelector((state) => state.meeting.isCameraOff);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Join my meeting on LetsMeet!\nMeeting Code: ${roomCode}\nLink: letsmeet://meet/${roomCode}`,
        title: 'LetsMeet Invitation',
      });
    } catch (error) {
      Alert.alert('Error', 'Unable to share meeting details.');
    }
  };

  const handleLeave = () => {
    dispatch(leaveMeeting());
    onLeave();
  };

  return (
    <View style={styles.container}>
      {/* Mic Toggle */}
      <TouchableOpacity
        style={[styles.controlBtn, isMicMuted && styles.controlBtnMuted]}
        onPress={() => dispatch(toggleMic())}
      >
        <Text style={styles.btnIcon}>{isMicMuted ? '🔇' : '🎤'}</Text>
        <Text style={styles.btnLabel}>{isMicMuted ? 'Unmute' : 'Mute'}</Text>
      </TouchableOpacity>

      {/* Camera Toggle */}
      <TouchableOpacity
        style={[styles.controlBtn, isCameraOff && styles.controlBtnMuted]}
        onPress={() => dispatch(toggleCamera())}
      >
        <Text style={styles.btnIcon}>{isCameraOff ? '🚫' : '📹'}</Text>
        <Text style={styles.btnLabel}>{isCameraOff ? 'Start Cam' : 'Stop Cam'}</Text>
      </TouchableOpacity>

      {/* Share to WhatsApp / Friends */}
      <TouchableOpacity style={styles.controlBtn} onPress={handleShare}>
        <Text style={styles.btnIcon}>🔗</Text>
        <Text style={styles.btnLabel}>Share</Text>
      </TouchableOpacity>

      {/* End / Leave Meeting */}
      <TouchableOpacity style={[styles.controlBtn, styles.leaveBtn]} onPress={handleLeave}>
        <Text style={styles.btnIcon}>📞</Text>
        <Text style={styles.leaveBtnText}>Leave</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  controlBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#1E293B',
  },
  controlBtnMuted: {
    backgroundColor: '#475569',
  },
  leaveBtn: {
    backgroundColor: '#EF4444',
  },
  btnIcon: {
    fontSize: 22,
  },
  btnLabel: {
    color: '#CBD5E1',
    fontSize: 10,
    marginTop: 2,
    fontWeight: '500',
  },
  leaveBtnText: {
    color: '#FFFFFF',
    fontSize: 10,
    marginTop: 2,
    fontWeight: '700',
  },
});

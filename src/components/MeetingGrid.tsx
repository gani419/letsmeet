import React from 'react';
import { View, Text, StyleSheet, Image, Dimensions } from 'react-native';

export interface ParticipantItem {
  id: string;
  name: string;
  avatarUrl: string;
  isLocal?: boolean;
  isMuted?: boolean;
  isVideoOff?: boolean;
}

interface MeetingGridProps {
  participants: ParticipantItem[];
}

const { width, height } = Dimensions.get('window');

export const MeetingGrid: React.FC<MeetingGridProps> = ({ participants }) => {
  const count = participants.length;

  const getTileStyle = (index: number) => {
    if (count === 1) {
      return styles.tileFull;
    }
    if (count === 2) {
      return styles.tileHalf;
    }
    if (count <= 4) {
      return styles.tileQuarter;
    }
    // 5 participants: WhatsApp style
    if (index < 3) {
      return styles.tileThird;
    }
    return styles.tileHalfBottom;
  };

  return (
    <View style={styles.gridContainer}>
      {participants.map((p, index) => (
        <View key={p.id || index.toString()} style={[styles.tileBase, getTileStyle(index)]}>
          {p.isVideoOff ? (
            <View style={styles.avatarPlaceholder}>
              <Image source={{ uri: p.avatarUrl }} style={styles.participantAvatar} />
            </View>
          ) : (
            <View style={styles.videoSimulated}>
              <Image source={{ uri: p.avatarUrl }} style={styles.participantAvatar} />
              <View style={styles.liveIndicator}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>LIVE</Text>
              </View>
            </View>
          )}

          {/* Participant Info Banner */}
          <View style={styles.infoBanner}>
            <Text style={styles.participantName} numberOfLines={1}>
              {p.name} {p.isLocal ? '(You)' : ''}
            </Text>
            {p.isMuted && <Text style={styles.mutedBadge}>🔇</Text>}
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  gridContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 6,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tileBase: {
    padding: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  tileFull: {
    width: '100%',
    height: '100%',
  },
  tileHalf: {
    width: '100%',
    height: '49%',
    marginVertical: '0.5%',
  },
  tileQuarter: {
    width: '49%',
    height: '49%',
    margin: '0.5%',
  },
  tileThird: {
    width: '32.3%',
    height: '49%',
    margin: '0.5%',
  },
  tileHalfBottom: {
    width: '49%',
    height: '49%',
    margin: '0.5%',
  },
  videoSimulated: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
    position: 'relative',
  },
  avatarPlaceholder: {
    flex: 1,
    backgroundColor: '#111827',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1F2937',
  },
  participantAvatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#374151',
  },
  liveIndicator: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 4,
  },
  liveText: {
    color: '#E2E8F0',
    fontSize: 10,
    fontWeight: '700',
  },
  infoBanner: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  participantName: {
    color: '#F8FAFC',
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  mutedBadge: {
    fontSize: 12,
    marginLeft: 4,
  },
});

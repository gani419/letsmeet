import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { useAppDispatch, useAppSelector } from '../redux/store';
import { generateAndSaveAvatar } from '../redux/slices/userSlice';
import { logoutUser } from '../redux/slices/authSlice';

export const UserCard: React.FC = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const isGeneratingAvatar = useAppSelector(
    (state) => state.user.isGeneratingAvatar
  );

  const handlePickAvatar = async () => {
    if (!user) return;

    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
      });

      if (result.assets && result.assets.length > 0 && result.assets[0].uri) {
        dispatch(
          generateAndSaveAvatar({
            userId: user.id,
            imageUri: result.assets[0].uri,
            fullName: user.fullName,
          })
        );
      }
    } catch (err) {
      Alert.alert('Error', 'Unable to pick image for avatar.');
    }
  };

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  if (!user) return null;

  return (
    <View style={styles.card}>
      <View style={styles.avatarContainer}>
        <Image
          source={{
            uri:
              user.avatarUrl ||
              `https://api.dicebear.com/7.x/bottts/png?seed=${user.id}`,
          }}
          style={styles.avatar}
        />
        {isGeneratingAvatar && (
          <View style={styles.avatarLoadingOverlay}>
            <ActivityIndicator color="#fff" size="small" />
          </View>
        )}
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.nameText} numberOfLines={1}>
          {user.fullName || 'Welcome'}
        </Text>
        <Text style={styles.emailText} numberOfLines={1}>
          {user.email}
        </Text>

        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.avatarButton}
            onPress={handlePickAvatar}
            disabled={isGeneratingAvatar}
          >
            <Text style={styles.avatarButtonText}>
              {isGeneratingAvatar ? 'Generating AI...' : 'AI Avatar'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 14,
  },
  avatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#334155',
  },
  avatarLoadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 34,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    flex: 1,
  },
  nameText: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '700',
  },
  emailText: {
    color: '#94A3B8',
    fontSize: 13,
    marginTop: 2,
    marginBottom: 8,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatarButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  avatarButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: '#475569',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  logoutButtonText: {
    color: '#E2E8F0',
    fontSize: 12,
    fontWeight: '500',
  },
});

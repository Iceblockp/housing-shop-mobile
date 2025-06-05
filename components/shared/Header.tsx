import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Bell } from 'lucide-react-native';
import { fonts } from '@/constants/fonts';
import { colors } from '@/constants/colors';
import { useNotifications } from '@/hooks/useNotifications';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  showNotification?: boolean;
  rightComponent?: React.ReactNode;
  onBackPress?: () => void; // Add this line
}

export function Header({
  title,
  showBack = false,
  showNotification = true,
  rightComponent,
  onBackPress, // Add this line
}: HeaderProps) {
  const { unreadCount } = useNotifications();
  const router = useRouter();

  const handleGoBack = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };

  const handleNotificationPress = () => {
    router.push('/(app)/notifications');
  };

  return (
    <View style={styles.header}>
      <View style={styles.leftContainer}>
        {showBack && (
          <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
            <ArrowLeft size={24} color={colors.text} />
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>

      <View style={styles.rightContainer}>
        {rightComponent}

        {showNotification && (
          <TouchableOpacity
            onPress={handleNotificationPress}
            style={styles.notificationButton}
          >
            <Bell size={24} color={colors.text} />
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  leftContainer: {
    width: 40,
    alignItems: 'flex-start',
  },
  rightContainer: {
    width: 40,
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontFamily: fonts.semiBold,
    color: colors.text,
    textAlign: 'center',
  },
  backButton: {
    padding: 4,
  },
  notificationButton: {
    padding: 4,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: colors.error,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontFamily: fonts.bold,
  },
});

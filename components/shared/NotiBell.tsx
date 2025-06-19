import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Bell } from 'lucide-react-native';
import { fonts } from '@/constants/fonts';
import { colors } from '@/constants/colors';
import { useNotifications } from '@/hooks/useNotifications';

interface HeaderProps {
  showNotification?: boolean;
  rightComponent?: React.ReactNode;
}

export function NotiBell({
  showNotification = true,
  rightComponent,
}: HeaderProps) {
  const { unreadCount } = useNotifications();
  const router = useRouter();

  const handleNotificationPress = () => {
    router.push('/notifications');
  };

  return (
    <View style={styles.rightContainer}>
      {rightComponent}

      {showNotification && (
        //    <TouchableOpacity style={styles.cartButton}>
        //    <Bell size={24} color="#1E293B" />
        //    <View style={styles.cartBadge}>
        //      <Text style={styles.cartBadgeText}>3</Text>
        //    </View>
        //  </TouchableOpacity>
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
    position: 'relative',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#F97316',
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    fontFamily: 'Inter-Bold',
    fontSize: 10,
    color: '#FFFFFF',
  },
});

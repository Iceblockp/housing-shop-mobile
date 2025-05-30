import React, { useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Container } from '@/components/shared/Container';
import { Header } from '@/components/shared/Header';
import { Button } from '@/components/ui/Button';
import { useNotifications } from '@/hooks/useNotifications';
import { router } from 'expo-router';
import { format, parseISO } from 'date-fns';
import { Bell, Check } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';
import { NotificationType } from '@/types';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function NotificationsScreen() {
  const {
    notifications,
    isLoading,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    markAsRead,
    markAllAsRead,
    isMarkingAllAsRead,
  } = useNotifications();

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'NEW_ORDER':
        return <Bell size={20} color={colors.accent} />;
      case 'ORDER_STATUS_CHANGE':
        return <Bell size={20} color={colors.primary} />;
      case 'ORDER_CANCELLED':
        return <Bell size={20} color={colors.error} />;
      case 'SYSTEM':
        return <Bell size={20} color={colors.secondary} />;
      default:
        return <Bell size={20} color={colors.textLight} />;
    }
  };

  const handleNotificationPress = (notification: any) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }

    if (notification.orderId) {
      router.push(`/order/${notification.orderId}`);
    }

    if (notification.requestId) {
      router.push(`/request/${notification.requestId}`);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'MMM dd, yyyy HH:mm');
    } catch (error) {
      return dateString;
    }
  };

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  // Render footer loader
  const renderFooter = () => {
    if (!isFetchingNextPage) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  };

  const renderNotification = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[styles.notificationItem, !item.isRead && styles.unreadItem]}
      onPress={() => handleNotificationPress(item)}
    >
      <View style={styles.notificationIcon}>
        {getNotificationIcon(item.type)}
      </View>
      <View style={styles.notificationContent}>
        <Text style={styles.notificationTitle}>{item.title}</Text>
        <Text style={styles.notificationMessage}>{item.message}</Text>
        <Text style={styles.notificationTime}>
          {formatDate(item.createdAt)}
        </Text>
      </View>
      {!item.isRead && <View style={styles.unreadIndicator} />}
    </TouchableOpacity>
  );

  // Render content based on loading/error state
  const renderContent = () => {
    if (isLoading) {
      return (
        <View style={styles.centerContainer}>
          <Text style={styles.statusText}>Loading notifications...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Failed to load notifications</Text>
          <Button
            variant="outline"
            onPress={() => refetch()}
            style={styles.retryButton}
          >
            Retry
          </Button>
        </View>
      );
    }

    if (!notifications || notifications.length === 0) {
      return (
        <View style={styles.centerContainer}>
          <Bell size={40} color={colors.textLight} />
          <Text style={styles.emptyText}>No notifications yet</Text>
        </View>
      );
    }

    return null;
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={styles.container}>
        <Header title="Notifications" showBack showNotification={false} />

        {/* Header actions outside of scrollable container */}
        {notifications && notifications.length > 0 && (
          <View style={[styles.headerActions, { paddingHorizontal: 16 }]}>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Check size={16} color={colors.primary} />}
              onPress={() => markAllAsRead()}
              loading={isMarkingAllAsRead}
            >
              Mark all as read
            </Button>
          </View>
        )}

        {/* Use Container with scrollable={false} since we're using FlatList */}
        <Container scrollable={false} style={styles.notificationsContainer}>
          {renderContent() || (
            <FlatList
              data={notifications}
              keyExtractor={(item) => item.id}
              renderItem={renderNotification}
              contentContainerStyle={styles.notificationsList}
              refreshing={isLoading}
              onRefresh={refetch}
              scrollEnabled={true}
              onEndReached={handleLoadMore}
              onEndReachedThreshold={0.5}
              ListFooterComponent={renderFooter}
            />
          )}
        </Container>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  notificationsContainer: {
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  notificationsList: {
    paddingBottom: 20,
    paddingHorizontal: 16,
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: colors.card,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  unreadItem: {
    backgroundColor: colors.primaryLight + '30', // Semi-transparent primary light
  },
  notificationIcon: {
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontFamily: fonts.semiBold,
    color: colors.text,
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.text,
    marginBottom: 8,
  },
  notificationTime: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: colors.textLight,
  },
  unreadIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  statusText: {
    fontSize: 16,
    fontFamily: fonts.regular,
    color: colors.textLight,
    marginTop: 8,
  },
  errorText: {
    fontSize: 16,
    fontFamily: fonts.medium,
    color: colors.error,
    marginBottom: 16,
    marginTop: 8,
  },
  retryButton: {
    width: 120,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: fonts.regular,
    color: colors.textLight,
    marginTop: 16,
  },
  footerLoader: {
    padding: 16,
    alignItems: 'center',
  },
});

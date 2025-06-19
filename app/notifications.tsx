import React, { useCallback, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  SectionList,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Container } from '@/components/shared/Container';
import { Header } from '@/components/shared/Header';
import { Button } from '@/components/ui/Button';
import { useNotifications } from '@/hooks/useNotifications';
import { router } from 'expo-router';
import { format, parseISO } from 'date-fns';
import {
  Bell,
  Check,
  ShoppingBag,
  RefreshCw,
  XCircle,
  Ticket,
} from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';
import { NotificationType } from '@/types';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlatList } from 'react-native';

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

  // Add this function to get notification type style
  const getNotificationTypeStyle = (type: NotificationType) => {
    switch (type) {
      case 'NEW_ORDER':
        return styles.accentIcon;
      case 'ORDER_STATUS_CHANGE':
        return styles.primaryIcon;
      case 'ORDER_CANCELLED':
        return styles.errorIcon;
      case 'SYSTEM':
        return styles.secondaryIcon;
      case 'NEW_COUPON':
        return styles.cuponIcon;
      default:
        return styles.defaultIcon;
    }
  };

  // Update the getNotificationIcon function
  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'NEW_ORDER':
        return <ShoppingBag size={20} color="#fff" />;
      case 'ORDER_STATUS_CHANGE':
        return <RefreshCw size={20} color="#fff" />;
      case 'ORDER_CANCELLED':
        return <XCircle size={20} color="#fff" />;
      case 'SYSTEM':
        return <Bell size={20} color="#fff" />;
      case 'NEW_COUPON':
        return <Ticket size={20} color="#fff" />;
      default:
        return <Bell size={20} color="#fff" />;
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
      <View
        style={[
          styles.notificationIconContainer,
          getNotificationTypeStyle(item.type),
        ]}
      >
        {getNotificationIcon(item.type)}
      </View>
      <View style={styles.notificationContent}>
        <View style={styles.notificationHeader}>
          <Text style={styles.notificationTitle} numberOfLines={1}>
            {item.title}
          </Text>
          {!item.isRead && <View style={styles.unreadIndicator} />}
        </View>
        <Text style={styles.notificationMessage} numberOfLines={2}>
          {item.message}
        </Text>
        <View style={styles.notificationFooter}>
          <Text style={styles.notificationTime}>
            {formatRelativeTime(item.createdAt)}
          </Text>
          {item.orderId && (
            <TouchableOpacity
              style={styles.viewDetailsButton}
              onPress={() => router.push(`/order/${item.orderId}`)}
            >
              <Text style={styles.viewDetailsText}>View Order</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  // Render content based on loading/error state
  const renderContent = () => {
    if (isLoading && !notifications.length) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.statusText}>Loading notifications...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.centerContainer}>
          <View style={styles.errorContainer}>
            <Bell size={40} color={colors.error} />
            <Text style={styles.errorText}>Failed to load notifications</Text>
            <Text style={styles.errorSubtext}>
              Please check your connection and try again
            </Text>
            <Button
              variant="primary"
              onPress={() => refetch()}
              style={styles.retryButton}
            >
              Retry
            </Button>
          </View>
        </View>
      );
    }

    if (!notifications || notifications.length === 0) {
      return (
        <View style={styles.centerContainer}>
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <Bell size={40} color={colors.textLight} />
            </View>
            <Text style={styles.emptyText}>No notifications yet</Text>
            <Text style={styles.emptySubtext}>
              We'll notify you when something important happens
            </Text>
            <Button
              variant="outline"
              onPress={() => router.push('/')}
              style={styles.homeButton}
            >
              Go to Home
            </Button>
          </View>
        </View>
      );
    }

    return null;
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={styles.container}>
        <Header title="Notifications" showBack showNotification={false} />

        {/* Filter tabs */}
        {/* {notifications && notifications.length > 0 && (
          <View style={styles.filterContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterScroll}
            >
              <TouchableOpacity
                style={[
                  styles.filterTab,
                  activeFilter === 'all' && styles.activeFilterTab,
                ]}
              >
                <Text
                  style={[
                    styles.filterText,
                    activeFilter === 'all' && styles.activeFilterText,
                  ]}
                >
                  All
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.filterTab,
                  activeFilter === 'unread' && styles.activeFilterTab,
                ]}
                onPress={() => setActiveFilter('unread')}
              >
                <Text
                  style={[
                    styles.filterText,
                    activeFilter === 'unread' && styles.activeFilterText,
                  ]}
                >
                  Unread
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        )} */}

        {/* Mark all as read button */}
        {notifications && notifications.length > 0 && (
          <View style={styles.headerActions}>
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

        {/* Rest of the component */}
        {/* Use Container with scrollable={false} since we're using FlatList */}
        <Container scrollable={false} style={styles.notificationsContainer}>
          {renderContent() || (
            <SectionList
              sections={groupNotificationsByDate(notifications)}
              keyExtractor={(item) => item.id}
              renderItem={renderNotification}
              renderSectionHeader={({ section: { date } }) => (
                <View style={styles.dateHeader}>
                  <Text style={styles.dateHeaderText}>{date}</Text>
                </View>
              )}
              contentContainerStyle={styles.notificationsList}
              refreshing={isLoading}
              onRefresh={refetch}
              onEndReached={handleLoadMore}
              onEndReachedThreshold={0.5}
              ListFooterComponent={renderFooter}
            />
            // <FlatList
            //   data={notifications}
            //   keyExtractor={(item) => item.id}
            //   renderItem={renderNotification}
            //   contentContainerStyle={styles.notificationsList}
            //   refreshing={isLoading}
            //   onRefresh={refetch}
            //   scrollEnabled={true}
            //   onEndReached={handleLoadMore}
            //   onEndReachedThreshold={0.5}
            //   ListFooterComponent={renderFooter}
            // />
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
    paddingHorizontal: 16,
    marginBottom: 8,
    marginTop: 8,
  },
  filterContainer: {
    marginTop: 8,
    marginBottom: 8,
  },
  filterScroll: {
    paddingHorizontal: 16,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: colors.card,
  },
  activeFilterTab: {
    backgroundColor: colors.primary + '20',
  },
  filterText: {
    fontFamily: fonts.medium,
    color: colors.textLight,
    fontSize: 14,
  },
  activeFilterText: {
    color: colors.primary,
    fontFamily: fonts.semiBold,
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
    backgroundColor: colors.primaryLight + '15', // Lighter semi-transparent primary
  },
  notificationIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  primaryIcon: {
    backgroundColor: colors.primary,
  },
  accentIcon: {
    backgroundColor: colors.accent,
  },
  errorIcon: {
    backgroundColor: colors.error,
  },
  secondaryIcon: {
    backgroundColor: colors.secondary,
  },
  successIcon: {
    backgroundColor: colors.success,
  },
  cuponIcon: {
    backgroundColor: colors.warning,
  },
  defaultIcon: {
    backgroundColor: colors.textLight,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 16,
    fontFamily: fonts.semiBold,
    color: colors.text,
    flex: 1,
  },
  notificationMessage: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.text,
    marginBottom: 8,
    lineHeight: 20,
  },
  notificationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notificationTime: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: colors.textLight,
  },
  viewDetailsButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    backgroundColor: colors.primaryLight + '20',
  },
  viewDetailsText: {
    fontSize: 12,
    fontFamily: fonts.medium,
    color: colors.primary,
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginLeft: 8,
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
    marginTop: 16,
  },
  errorContainer: {
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontFamily: fonts.semiBold,
    color: colors.error,
    marginTop: 16,
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.textLight,
    marginBottom: 24,
    textAlign: 'center',
  },
  retryButton: {
    width: 120,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 20,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontFamily: fonts.semiBold,
    color: colors.text,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.textLight,
    marginBottom: 24,
    textAlign: 'center',
  },
  homeButton: {
    width: 120,
  },
  dateHeader: {
    paddingVertical: 8,
    backgroundColor: colors.background,
  },
  dateHeaderText: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: colors.textLight,
  },
  footerLoader: {
    padding: 16,
    alignItems: 'center',
  },
});

// Add this function to group notifications by date
const groupNotificationsByDate = (notifications: any[]) => {
  const groups: { [key: string]: any[] } = {};

  notifications.forEach((notification) => {
    const date = new Date(notification.createdAt);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let groupKey;

    if (date.toDateString() === today.toDateString()) {
      groupKey = 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      groupKey = 'Yesterday';
    } else {
      groupKey = format(date, 'MMM dd, yyyy');
    }

    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }

    groups[groupKey].push(notification);
  });

  return Object.entries(groups).map(([date, items]) => ({
    date,
    data: items,
  }));
};

// Then in your render method, use SectionList instead of FlatList

// Add this function to format relative time
const formatRelativeTime = (dateString: string) => {
  try {
    const date = parseISO(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'Just now';
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return `${diffInDays}d ago`;
    }

    return format(date, 'MMM dd, yyyy');
  } catch (error) {
    return dateString;
  }
};

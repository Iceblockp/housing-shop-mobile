import React, { useCallback, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { Container } from '@/components/shared/Container';
import { Button } from '@/components/ui/Button';
import { OrderItem } from '@/components/orders/OrderItem';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';
import { useAuth } from '@/lib/auth/auth-provider';
import { OrderStatus } from '@/types';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { useOrders } from '@/hooks/use-orders';
import { NotiBell } from '@/components/shared/NotiBell';

export default function OrdersScreen() {
  const { isAdmin } = useAuth();
  const insets = useSafeAreaInsets();

  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'ALL'>('ALL');

  const {
    data: rawOrders,
    isLoading,
    error,
    refetch,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useOrders({ status: statusFilter !== 'ALL' ? statusFilter : undefined });

  const orders = rawOrders?.pages.flatMap((page) => page.orders) || [];

  const filterOptions: Array<{ label: string; value: OrderStatus | 'ALL' }> = [
    { label: 'All', value: 'ALL' },
    { label: 'Pending', value: 'PENDING' },
    { label: 'Confirmed', value: 'CONFIRMED' },
    { label: 'Processing', value: 'PROCESSING' },
    { label: 'Delivering', value: 'DELIVERING' },
    { label: 'Completed', value: 'COMPLETED' },
    { label: 'Cancelled', value: 'CANCELLED' },
  ];

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

  // Render the content based on loading/error state
  const renderContent = () => {
    if (isLoading) {
      return (
        <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
          <View style={styles.centerContainer}>
            <Text style={styles.loadingText}>Loading orders...</Text>
          </View>
        </SafeAreaView>
      );
    }

    if (error) {
      return (
        <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
          <View style={styles.centerContainer}>
            <Text style={styles.errorText}>Failed to load orders</Text>
            <Button
              variant="outline"
              onPress={() => refetch()}
              style={styles.retryButton}
            >
              Retry
            </Button>
          </View>
        </SafeAreaView>
      );
    }

    if (!orders || orders.length === 0) {
      return (
        <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
          <View style={styles.centerContainer}>
            <Text style={styles.emptyText}>No orders found</Text>
          </View>
        </SafeAreaView>
      );
    }

    return null;
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <View style={styles.container}>
        {/* <Header title={isAdmin ? 'All Orders' : 'My Orders'} showBack={false} /> */}
        <View style={[styles.header, { paddingTop: insets.top > 0 ? 0 : 16 }]}>
          <View>
            <Text style={styles.title}>
              {isAdmin ? 'All Orders' : 'My Orders'}
            </Text>
          </View>

          <NotiBell />
        </View>

        {/* Filter section - outside of scrollable container */}
        <View style={styles.filterContainer}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={filterOptions}
            keyExtractor={(item) => item.value}
            renderItem={({ item }) => (
              <Button
                variant={statusFilter === item.value ? 'primary' : 'outline'}
                size="sm"
                style={styles.filterButton}
                onPress={() => setStatusFilter(item.value)}
              >
                {item.label}
              </Button>
            )}
            contentContainerStyle={styles.filterList}
          />
        </View>

        {/* Use Container with scrollable={false} since we're using FlatList */}
        <Container scrollable={false} style={styles.ordersContainer}>
          {renderContent() || (
            <FlatList
              data={orders}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => <OrderItem order={item} />}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.ordersList}
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
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: '#1E293B',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  ordersContainer: {
    flex: 1,
  },
  filterContainer: {
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  filterList: {
    paddingVertical: 8,
  },
  filterButton: {
    marginRight: 8,
  },
  ordersList: {
    paddingBottom: 20,
    paddingHorizontal: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: fonts.regular,
    color: colors.textLight,
  },
  errorText: {
    fontSize: 16,
    fontFamily: fonts.medium,
    color: colors.error,
    marginBottom: 16,
  },
  retryButton: {
    width: 120,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: fonts.regular,
    color: colors.textLight,
  },
  footerLoader: {
    padding: 16,
    alignItems: 'center',
  },
});

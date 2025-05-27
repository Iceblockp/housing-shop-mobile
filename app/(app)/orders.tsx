import React, { useState } from 'react';
import { StyleSheet, View, Text, FlatList } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Container } from '@/components/shared/Container';
import { Header } from '@/components/shared/Header';
import { Button } from '@/components/ui/Button';
import { OrderItem } from '@/components/orders/OrderItem';
import { orderApi } from '@/lib/api';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';
import { useAuth } from '@/lib/auth/auth-provider';
import { OrderStatus } from '@/types';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function OrdersScreen() {
  const { isAdmin } = useAuth();
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'ALL'>('ALL');

  const {
    data: orders,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['orders', statusFilter !== 'ALL' ? statusFilter : undefined],
    queryFn: () =>
      orderApi.getAll(
        statusFilter !== 'ALL' ? { status: statusFilter } : undefined
      ),
  });

  const filterOptions: Array<{ label: string; value: OrderStatus | 'ALL' }> = [
    { label: 'All', value: 'ALL' },
    { label: 'Pending', value: 'PENDING' },
    { label: 'Confirmed', value: 'CONFIRMED' },
    { label: 'Processing', value: 'PROCESSING' },
    { label: 'Delivering', value: 'DELIVERING' },
    { label: 'Completed', value: 'COMPLETED' },
    { label: 'Cancelled', value: 'CANCELLED' },
  ];

  // Render the content based on loading/error state
  const renderContent = () => {
    if (isLoading) {
      return (
        <View style={styles.centerContainer}>
          <Text style={styles.loadingText}>Loading orders...</Text>
        </View>
      );
    }

    if (error) {
      return (
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
      );
    }

    if (!orders || orders.length === 0) {
      return (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>No orders found</Text>
        </View>
      );
    }

    return null;
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <View style={styles.container}>
        <Header title={isAdmin ? 'All Orders' : 'My Orders'} showBack={false} />

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
});

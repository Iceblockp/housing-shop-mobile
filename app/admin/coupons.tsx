import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '@/components/shared/Header';
import { Container } from '@/components/shared/Container';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';
import { Ticket, Plus, Search, Filter, X } from 'lucide-react-native';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/lib/auth/auth-provider';
import { router } from 'expo-router';
import { useAdminCoupons } from '@/hooks/use-admin-coupons';
import CouponCreateModal from '@/components/ui/CouponCreateModal';

export default function AdminCouponsScreen() {
  const { isAdmin } = useAuth();
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'used' | 'active'>(
    'all'
  );
  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);

  // Redirect if not admin
  useEffect(() => {
    if (isAdmin === false) {
      router.replace('/(app)');
    }
  }, [isAdmin]);

  // Prepare query parameters
  const queryParams = {
    page,
    limit: 10,
    q: searchQuery || undefined,
    isUsed: filterStatus === 'all' ? undefined : filterStatus === 'used',
  };

  const { data, isLoading, isError, error, refetch, isFetching } =
    useAdminCoupons(queryParams);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleSearch = () => {
    setPage(1);
    refetch();
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setPage(1);
    refetch();
  };

  const handleLoadMore = () => {
    if (data?.pagination && page < data.pagination.totalPages && !isFetching) {
      setPage(page + 1);
    }
  };

  const renderCouponItem = ({ item }: { item: any }) => (
    <View style={styles.couponCard}>
      <View style={styles.couponHeader}>
        <View style={styles.couponIconContainer}>
          <Ticket size={24} color={colors.primary} />
        </View>
        <View style={styles.couponInfo}>
          <Text style={styles.couponCode}>{item.code}</Text>
          <Text style={styles.couponAmount}>MMK {item.amount.toFixed(0)}</Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            item.isUsed ? styles.usedBadge : styles.activeBadge,
          ]}
        >
          <Text style={styles.statusText}>
            {item.isUsed ? 'Used' : 'Active'}
          </Text>
        </View>
      </View>

      <View style={styles.couponDetails}>
        <Text style={styles.detailLabel}>Secret Code:</Text>
        <Text style={styles.detailValue}>{item.secretCode}</Text>
      </View>

      {item.user && (
        <View style={styles.couponDetails}>
          <Text style={styles.detailLabel}>Assigned to:</Text>
          <Text style={styles.detailValue}>
            {item.user.name} ({item.user.email})
          </Text>
        </View>
      )}

      <View style={styles.couponFooter}>
        <Text style={styles.couponDate}>
          Created: {new Date(item.createdAt).toLocaleDateString()}
        </Text>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ticket size={60} color={colors.border} />
      <Text style={styles.emptyText}>
        {isLoading ? 'Loading coupons...' : 'No coupons found'}
      </Text>
      {!isLoading && (
        <Button
          variant="outline"
          onPress={() => setIsCreateModalVisible(true)}
          style={styles.emptyButton}
        >
          Create New Coupon
        </Button>
      )}
    </View>
  );

  if (isAdmin === null) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <Container>
          <Header title="Admin Coupons" showBack />
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        </Container>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <Container>
        <Header title="Admin Coupons" showBack />

        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Search size={20} color={colors.gray} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search coupons..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
            {searchQuery ? (
              <TouchableOpacity onPress={handleClearSearch}>
                <X size={20} color={colors.gray} />
              </TouchableOpacity>
            ) : null}
          </View>

          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setIsCreateModalVisible(true)}
          >
            <Plus size={20} color={colors.white} />
          </TouchableOpacity>
        </View>

        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[
              styles.filterTab,
              filterStatus === 'all' && styles.activeFilterTab,
            ]}
            onPress={() => setFilterStatus('all')}
          >
            <Text
              style={[
                styles.filterText,
                filterStatus === 'all' && styles.activeFilterText,
              ]}
            >
              All
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterTab,
              filterStatus === 'active' && styles.activeFilterTab,
            ]}
            onPress={() => setFilterStatus('active')}
          >
            <Text
              style={[
                styles.filterText,
                filterStatus === 'active' && styles.activeFilterText,
              ]}
            >
              Active
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterTab,
              filterStatus === 'used' && styles.activeFilterTab,
            ]}
            onPress={() => setFilterStatus('used')}
          >
            <Text
              style={[
                styles.filterText,
                filterStatus === 'used' && styles.activeFilterText,
              ]}
            >
              Used
            </Text>
          </TouchableOpacity>
        </View>

        {isError ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>
              {error instanceof Error
                ? error.message
                : 'Failed to load coupons'}
            </Text>
            <Button
              variant="outline"
              onPress={() => refetch()}
              style={styles.retryButton}
            >
              Retry
            </Button>
          </View>
        ) : (
          <FlatList
            data={data?.coupons || []}
            renderItem={renderCouponItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={renderEmptyState}
            refreshing={refreshing}
            onRefresh={handleRefresh}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={
              isFetching && !refreshing ? (
                <View style={styles.footerLoader}>
                  <ActivityIndicator size="small" color={colors.primary} />
                </View>
              ) : null
            }
          />
        )}

        <CouponCreateModal
          isVisible={isCreateModalVisible}
          onClose={() => setIsCreateModalVisible(false)}
        />
      </Container>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'center',
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.lightGray,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginRight: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontFamily: fonts.regular,
    color: colors.text,
  },
  addButton: {
    backgroundColor: colors.primary,
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeFilterTab: {
    borderBottomColor: colors.primary,
  },
  filterText: {
    fontFamily: fonts.medium,
    color: colors.gray,
  },
  activeFilterText: {
    color: colors.primary,
  },
  listContainer: {
    flexGrow: 1,
    paddingBottom: 16,
  },
  couponCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  couponHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  couponIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  couponInfo: {
    flex: 1,
  },
  couponCode: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: colors.text,
  },
  couponAmount: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.primary,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  activeBadge: {
    backgroundColor: colors.success + '20',
  },
  usedBadge: {
    backgroundColor: colors.gray + '20',
  },
  statusText: {
    fontSize: 12,
    fontFamily: fonts.medium,
    color: colors.text,
  },
  couponDetails: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  detailLabel: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.gray,
    marginRight: 8,
    width: 90,
  },
  detailValue: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.text,
  },
  couponFooter: {
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
    paddingTop: 8,
  },
  couponDate: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.gray,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontFamily: fonts.medium,
    fontSize: 16,
    color: colors.gray,
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  emptyButton: {
    minWidth: 200,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontFamily: fonts.medium,
    fontSize: 16,
    color: colors.error,
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    minWidth: 120,
  },
  footerLoader: {
    paddingVertical: 16,
    alignItems: 'center',
  },
});

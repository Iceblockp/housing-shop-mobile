import React, { useCallback, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Container } from '@/components/shared/Container';
import { Header } from '@/components/shared/Header';
import { Button } from '@/components/ui/Button';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';
import { useAuth } from '@/lib/auth/auth-provider';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRequests } from '@/hooks/use-requests';
import RequestItem from '@/components/requests/RequestItem';
import RequestModal from '@/components/ui/RequestCreateModel';
import { PlusIcon, Filter, RefreshCw } from 'lucide-react-native';

export default function RequestScreen() {
  const { isAdmin } = useAuth();
  const [isRequestModelVisible, setIsRequestModelVisible] = useState(false);
  const [filterStatus, setFilterStatus] = useState<
    'all' | 'replied' | 'pending'
  >('all');

  const {
    data: rawRequests,
    isLoading,
    isError,
    error,
    refetch,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useRequests({ limit: 10 });

  const requests = rawRequests?.pages.flatMap((page) => page.requests) || [];

  // Filter requests based on selected filter
  const filteredRequests = requests.filter((request) => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'replied') return request.adminReply !== null;
    if (filterStatus === 'pending') return request.adminReply === null;
    return true;
  });

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

  // Render filter tabs
  const renderFilterTabs = () => (
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
          filterStatus === 'pending' && styles.activeFilterTab,
        ]}
        onPress={() => setFilterStatus('pending')}
      >
        <Text
          style={[
            styles.filterText,
            filterStatus === 'pending' && styles.activeFilterText,
          ]}
        >
          Pending
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.filterTab,
          filterStatus === 'replied' && styles.activeFilterTab,
        ]}
        onPress={() => setFilterStatus('replied')}
      >
        <Text
          style={[
            styles.filterText,
            filterStatus === 'replied' && styles.activeFilterText,
          ]}
        >
          Replied
        </Text>
      </TouchableOpacity>
    </View>
  );

  // Render the content based on loading/error state
  const renderContent = () => {
    if (isLoading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading requests...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Failed to load requests</Text>
          <Button
            variant="outline"
            onPress={() => refetch()}
            style={styles.retryButton}
            leftIcon={<RefreshCw size={18} color={colors.primary} />}
          >
            Retry
          </Button>
        </View>
      );
    }

    if (!filteredRequests || filteredRequests.length === 0) {
      return (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>
            {filterStatus !== 'all'
              ? `No ${filterStatus} requests found`
              : 'No requests found'}
          </Text>
          <Button
            variant="outline"
            onPress={() => setIsRequestModelVisible(true)}
            style={styles.createButton}
            leftIcon={<PlusIcon size={18} color={colors.primary} />}
          >
            Create New Request
          </Button>
        </View>
      );
    }

    return null;
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={styles.container}>
        <Header
          title={isAdmin ? 'All Requests' : 'My Requests'}
          showBack={true}
        />

        <Container scrollable={false} style={styles.contentContainer}>
          <View style={styles.actionBar}>
            {renderFilterTabs()}
            {!isAdmin && (
              <Button
                onPress={() => setIsRequestModelVisible(true)}
                size="sm"
                leftIcon={<PlusIcon size={18} color={colors.card} />}
                style={styles.newRequestButton}
              >
                New Request
              </Button>
            )}
          </View>

          {renderContent() || (
            <FlatList
              data={filteredRequests}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => <RequestItem request={item} />}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.requestsList}
              refreshControl={
                <RefreshControl
                  refreshing={isLoading}
                  onRefresh={refetch}
                  colors={[colors.primary]}
                  tintColor={colors.primary}
                />
              }
              onEndReached={handleLoadMore}
              onEndReachedThreshold={0.5}
              ListFooterComponent={renderFooter}
            />
          )}
        </Container>
      </View>
      <RequestModal
        isVisible={isRequestModelVisible}
        onClose={() => setIsRequestModelVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 0,
  },
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
    marginTop: 16,
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterTab: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  activeFilterTab: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterText: {
    fontSize: 14,
    fontFamily: fonts.medium,
    color: colors.textLight,
  },
  activeFilterText: {
    color: colors.card,
  },
  newRequestButton: {
    minWidth: 120,
  },
  requestsList: {
    paddingHorizontal: 16,
    paddingBottom: 20,
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
    marginTop: 12,
  },
  errorText: {
    fontSize: 16,
    fontFamily: fonts.medium,
    color: colors.error,
    marginBottom: 16,
  },
  retryButton: {
    minWidth: 120,
  },
  createButton: {
    minWidth: 180,
    marginTop: 16,
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

import React, { useCallback, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  ActivityIndicator,
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
import { PlusIcon } from 'lucide-react-native';

export default function RequestScreen() {
  const { isAdmin } = useAuth();
  const [isRequestModelVisible, setIsRequestModelVisible] = useState(false);

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
            <Text style={styles.loadingText}>Loading request...</Text>
          </View>
        </SafeAreaView>
      );
    }

    if (error) {
      return (
        <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
          <View style={styles.centerContainer}>
            <Text style={styles.errorText}>Failed to load requests</Text>
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

    if (!requests || requests.length === 0) {
      return (
        <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
          <View style={styles.centerContainer}>
            <Text style={styles.emptyText}>No requests found</Text>
          </View>
        </SafeAreaView>
      );
    }

    return null;
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <View style={styles.container}>
        <Header
          title={isAdmin ? 'All Requests' : 'My Requests'}
          showBack={false}
        />

        {/* Use Container with scrollable={false} since we're using FlatList */}
        <Container
          scrollable={false}
          onRefresh={refetch}
          refreshing={isLoading}
          style={styles.ordersContainer}
        >
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'flex-end',
            }}
          >
            <Button
              onPress={() => setIsRequestModelVisible(true)}
              style={{ marginBottom: 12 }}
            >
              Send Request
            </Button>
          </View>
          {renderContent() || (
            <FlatList
              data={requests}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => <RequestItem request={item} />}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.ordersList}
              refreshing={isLoading}
              onRefresh={refetch}
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

import React, { useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { productApi } from '@/lib/api';
import { Product } from '@/types';
import { ProductCard } from './ProductCard';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';
import { useProducts } from '@/hooks/use-products';
import { CategoryList } from './CategoryList';

interface ProductListProps {
  title: string;
  categoryId?: string;
  searchQuery?: string;
  header?:
    | React.ComponentType<any>
    | React.ReactElement<unknown, string | React.JSXElementConstructor<any>>
    | null
    | undefined;
}

export function ProductList({
  title,
  categoryId,
  searchQuery,
  header,
}: ProductListProps) {
  const {
    data: rawProducts,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    error,
  } = useProducts({ categoryId: categoryId, q: searchQuery });

  const products = rawProducts?.pages.flatMap((p) => p.products) ?? [];

  // Handle loading more products
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

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={colors.primary} />
        <Text style={styles.loadingText}>Loading products...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load products</Text>
      </View>
    );
  }

  if (!products || products.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No products available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={header}
        numColumns={2}
        renderItem={({ item }) => <ProductCard product={item} />}
        contentContainerStyle={styles.listContent}
        scrollEnabled={true} // Enable scrolling
        onEndReached={handleLoadMore} // Trigger load more when reaching end
        onEndReachedThreshold={0.1} // Start loading when 50% away from the end
        ListFooterComponent={renderFooter}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  title: {
    fontSize: 18,
    fontFamily: fonts.semiBold,
    marginBottom: 12,
    paddingHorizontal: 4,
    color: colors.textDark,
  },
  listContent: {
    paddingHorizontal: 8,
  },
  loadingContainer: {
    padding: 16,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: colors.textLight,
    fontFamily: fonts.regular,
    marginTop: 8,
  },
  errorContainer: {
    padding: 16,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 14,
    color: colors.error,
    fontFamily: fonts.regular,
  },
  emptyContainer: {
    padding: 16,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: colors.textLight,
    fontFamily: fonts.regular,
  },
  footerLoader: {
    padding: 16,
    alignItems: 'center',
  },
});

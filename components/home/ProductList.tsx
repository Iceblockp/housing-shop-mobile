import React from 'react';
import { StyleSheet, Text, View, FlatList, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { productApi } from '@/lib/api';
import { Product } from '@/types';
import { ProductCard } from './ProductCard';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';

interface ProductListProps {
  title: string;
  categoryId?: string;
  searchQuery?: string;
}

export function ProductList({ title, categoryId, searchQuery }: ProductListProps) {
  const { data: products, isLoading, error } = useQuery({
    queryKey: ['products', categoryId, searchQuery],
    queryFn: () => productApi.getAll({ categoryId, q: searchQuery }),
  });

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
        numColumns={2}
        renderItem={({ item }) => <ProductCard product={item} />}
        scrollEnabled={false}
        contentContainerStyle={styles.listContent}
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
});
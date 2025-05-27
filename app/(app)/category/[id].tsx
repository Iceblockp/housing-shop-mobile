import React from 'react';
import { StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Container } from '@/components/shared/Container';
import { Header } from '@/components/shared/Header';
import { ProductList } from '@/components/home/ProductList';
import { categoryApi } from '@/lib/api';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CategoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const {
    data: category,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['category', id],
    queryFn: () => categoryApi.getById(id),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Header title="Category" showBack />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading category...</Text>
        </View>
      </View>
    );
  }

  if (error || !category) {
    return (
      <View style={styles.container}>
        <Header title="Category" showBack />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load category</Text>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={styles.container}>
        <Header title={category.name} showBack />

        <Container>
          {category.description && (
            <View style={styles.descriptionContainer}>
              <Text style={styles.descriptionText}>{category.description}</Text>
            </View>
          )}

          <ProductList
            title={`Products in ${category.name}`}
            categoryId={category.id}
          />
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.textLight,
    fontFamily: fonts.regular,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: colors.error,
    fontFamily: fonts.medium,
  },
  descriptionContainer: {
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  descriptionText: {
    fontSize: 14,
    color: colors.text,
    fontFamily: fonts.regular,
    lineHeight: 20,
  },
});

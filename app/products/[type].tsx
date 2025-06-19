import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Header } from '@/components/shared/Header';
import { Container } from '@/components/shared/Container';
import { ProductList } from '@/components/home/ProductList';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';
import {
  useFeaturedProducts,
  useBestSellingProducts,
  useNewProducts,
} from '@/hooks/use-products';

export default function ProductsScreen() {
  const { type } = useLocalSearchParams<{ type: string }>();

  // Set title based on type
  let title = 'Products';
  if (type === 'featured') title = 'Featured Products';
  if (type === 'best-selling') title = 'Best Selling Products';
  if (type === 'new-arrivals') title = 'New Arrivals';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={styles.container}>
        <Header title={title} showBack />

        <Container scrollable={false}>
          <ProductList
            title={title}
            // The ProductList component will handle loading and displaying products
            // We don't need to pass categoryId or searchQuery as we'll filter by type
            // in a custom hook if needed
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
});

import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { Product } from '@/types';
import { TouchableOpacity } from 'react-native-gesture-handler';
import ProductCard from '../common/ProductCard';

interface FeaturedProductsProps {
  title: string;
  products: Product[];
  showViewAll?: boolean;
  type?: 'featured' | 'best-selling' | 'new-arrivals';
}

const FeaturedProducts: React.FC<FeaturedProductsProps> = ({
  title,
  products,
  showViewAll = true,
  type = 'featured',
}) => {
  const router = useRouter();

  const handleViewAll = () => {
    router.push(`/products/${type}`);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {showViewAll && (
          <TouchableOpacity
            style={styles.viewAllButton}
            onPress={handleViewAll}
            activeOpacity={0.7}
          >
            <Text style={styles.viewAllText}>View All</Text>
            <ChevronRight size={16} color="#1E40AF" />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.productCard}>
            <ProductCard product={item} />
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: '#1E293B',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: '#1E40AF',
    marginRight: 4,
  },
  list: {
    paddingLeft: 16,
    paddingRight: 8,
  },
  productCard: {
    marginRight: 12,
  },
});

export default FeaturedProducts;

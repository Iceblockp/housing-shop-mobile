import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { ShoppingCart, Box } from 'lucide-react-native';
import { Product } from '@/types';
import { useCartStore } from '@/lib/cart/cart-store';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';

interface ProductCardProps {
  product: Product;
}

const windowWidth = Dimensions.get('window').width;
const cardWidth =
  windowWidth < 500 ? (windowWidth - 48) / 2 : (windowWidth - 80) / 3;

export function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);

  const handlePress = () => {
    router.push(`/product/${product.id}`);
  };

  const handleAddToCart = (e: any) => {
    e.stopPropagation();
    addItem(product, 1);
  };

  return (
    <TouchableOpacity
      style={[styles.card, { width: cardWidth }]}
      onPress={handlePress}
    >
      {product.imageUrl ? (
        <Image source={{ uri: product.imageUrl }} style={styles.image} />
      ) : (
        <View style={styles.imagePlaceholder}>
          <Box size={24} color={colors.textLight} />
        </View>
      )}

      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={2}>
          {product.name}
        </Text>
        <Text style={styles.unit}>{product.unit}</Text>

        <View style={styles.footer}>
          <Text style={styles.price}>MMK {product.price.toFixed(0)}</Text>

          {product.inStock ? (
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleAddToCart}
            >
              <ShoppingCart size={16} color={colors.card} />
            </TouchableOpacity>
          ) : (
            <View style={styles.outOfStock}>
              <Text style={styles.outOfStockText}>Out of stock</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
    margin: 8,
  },
  image: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    width: '100%',
    height: 120,
    backgroundColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 12,
  },
  name: {
    fontSize: 14,
    fontFamily: fonts.medium,
    color: colors.text,
    // marginBottom: 8,
    // height: 40,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: colors.primary,
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unit: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#64748B',
    marginBottom: 8,
  },
  outOfStock: {
    backgroundColor: colors.disabled,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  outOfStockText: {
    fontSize: 10,
    fontFamily: fonts.medium,
    color: colors.textLight,
  },
});

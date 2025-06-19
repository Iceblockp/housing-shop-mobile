import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ShoppingCart, Heart, Box } from 'lucide-react-native';
import { Product } from '@/types';
import { useCartStore } from '@/lib/cart/cart-store';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';

interface ProductCardProps {
  product: Product;
  horizontal?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  horizontal = false,
}) => {
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);
  const [isFavorite, setIsFavorite] = React.useState(false);

  const handlePress = () => {
    router.push(`/product/${product.id}`);
  };

  const handleAddToCart = (e: any) => {
    e.stopPropagation();
    addItem(product, 1);
  };

  const toggleFavorite = (e: any) => {
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  const containerStyle = horizontal
    ? styles.horizontalContainer
    : styles.container;
  const imageStyle = horizontal ? styles.horizontalImage : styles.image;
  const contentStyle = horizontal ? styles.horizontalContent : styles.content;

  return (
    <TouchableOpacity
      style={containerStyle}
      onPress={handlePress}
      activeOpacity={0.9}
    >
      {product.inStock ? (
        <View style={styles.organicBadge}>
          <Text style={styles.organicText}>In Stock</Text>
        </View>
      ) : (
        <View style={styles.outStockBadge}>
          <Text style={styles.outStockText}>Out of stock</Text>
        </View>
      )}

      {product.imageUrl ? (
        <Image source={{ uri: product.imageUrl }} style={imageStyle} />
      ) : (
        <View style={[imageStyle, styles.imagePlaceholder]}>
          <Box size={24} color={colors.textLight} />
        </View>
      )}

      {/* <TouchableOpacity style={styles.favoriteButton} onPress={toggleFavorite}>
        <Heart
          size={18}
          color={isFavorite ? colors.error : colors.textLight}
          fill={isFavorite ? colors.error : 'transparent'}
        />
      </TouchableOpacity> */}

      <View style={contentStyle}>
        <Text style={styles.name} numberOfLines={2}>
          {product.name}
        </Text>

        <Text style={styles.unit}>{product.unit}</Text>

        <View style={styles.bottomRow}>
          <Text style={styles.price}>MMK {product.price.toLocaleString()}</Text>

          {product.inStock !== false ? (
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleAddToCart}
              activeOpacity={0.8}
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
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: Dimensions.get('window').width / 2 - 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  horizontalContainer: {
    backgroundColor: colors.card,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flexDirection: 'row',
    width: '100%',
    marginBottom: 16,
    height: 130,
    borderWidth: 1,
    borderColor: colors.border,
  },
  image: {
    width: '100%',
    height: 130,
    resizeMode: 'cover',
  },
  horizontalImage: {
    width: 130,
    height: '100%',
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    backgroundColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 12,
    height: 100,
    justifyContent: 'space-between',
  },
  horizontalContent: {
    padding: 12,
    flex: 1,
    justifyContent: 'space-between',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  price: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: colors.primary,
  },
  originalPrice: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textLight,
    textDecorationLine: 'line-through',
    marginLeft: 4,
  },
  name: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: colors.text,
    marginBottom: 2,
  },
  unit: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textLight,
    marginBottom: 8,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.warning,
  },
  addButton: {
    backgroundColor: colors.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  organicBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: colors.success,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    zIndex: 1,
  },
  organicText: {
    fontFamily: fonts.medium,
    fontSize: 10,
    color: colors.card,
  },
  outStockBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: colors.error,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    zIndex: 1,
  },
  outStockText: {
    fontFamily: fonts.medium,
    fontSize: 10,
    color: colors.card,
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: colors.card,
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
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

export default ProductCard;

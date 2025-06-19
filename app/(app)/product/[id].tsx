import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Platform,
  RefreshControl,
  FlatList,
  Share,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import {
  Minus,
  Plus,
  ShoppingCart,
  Phone,
  Heart,
  Share2,
  ChevronLeft,
  Star,
} from 'lucide-react-native';
import { Header } from '@/components/shared/Header';
import { Button } from '@/components/ui/Button';
import { productApi } from '@/lib/api';
import { useCartStore } from '@/lib/cart/cart-store';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';
import { Linking } from 'react-native';
import { useAuth } from '@/lib/auth/auth-provider';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGetAdmin } from '@/hooks/useAdmin';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { useBestSellingProducts } from '@/hooks/use-products';

const { width } = Dimensions.get('window');

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useSharedValue(0);

  const addItem = useCartStore((state) => state.addItem);

  const {
    data: product,
    isLoading,
    refetch,
    error,
  } = useQuery({
    queryKey: ['product', id],
    queryFn: () => productApi.getById(id),
    enabled: !!id,
  });
  const { data: bestProducts } = useBestSellingProducts();
  const { data: admin } = useGetAdmin();

  // Mock related products - in a real app, you would fetch these
  const mockRelatedProducts = bestProducts?.products || [];

  const handleAddToCart = () => {
    if (product && product.inStock) {
      addItem(product, quantity);
    }
  };

  const handleQuantityChange = (value: number) => {
    const newQuantity = quantity + value;
    if (newQuantity >= 1) {
      setQuantity(newQuantity);
    }
  };

  const handleCallAdmin = () => {
    const phoneNumber = admin?.phone || '+959425743536';

    if (Platform.OS === 'web') {
      alert(`Please call the admin at: ${phoneNumber}`);
    } else {
      Linking.openURL(`tel:${phoneNumber}`);
    }
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  const handleShare = async () => {
    if (product) {
      try {
        await Share.share({
          message: `Check out ${product.name} on HomeShop!`,
          url: `https://homeshop.com/product/${product.id}`,
        });
      } catch (error) {
        console.error('Error sharing product:', error);
      }
    }
  };

  const onImageScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    scrollX.value = offsetX;
    const index = Math.round(offsetX / width);
    if (index !== activeImageIndex) {
      setActiveImageIndex(index);
    }
  };

  // Create an array of images (in a real app, product would have multiple images)
  const productImages = product
    ? [
        { id: '1', uri: product.imageUrl || undefined },
        // Add more images if available in your data model
      ]
    : [];

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={styles.container}>
          <Header title="Product Details" showBack />
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Loading product details...</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !product) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={styles.container}>
          <Header title="Product Details" showBack />
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Failed to load product details</Text>
            <Button
              variant="primary"
              onPress={() => refetch()}
              style={styles.retryButton}
            >
              Retry
            </Button>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={styles.container}>
        {/* Custom header with back button and actions */}
        <View style={styles.customHeader}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <ChevronLeft size={24} color={colors.text} />
          </TouchableOpacity>

          <View style={styles.headerActions}>
            {/* <TouchableOpacity
              onPress={toggleFavorite}
              style={styles.headerActionButton}
            >
              <Heart
                size={22}
                color={isFavorite ? colors.error : colors.text}
                fill={isFavorite ? colors.error : 'transparent'}
              />
            </TouchableOpacity> */}

            <TouchableOpacity
              onPress={handleShare}
              style={styles.headerActionButton}
            >
              <Share2 size={22} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl onRefresh={refetch} refreshing={isLoading} />
          }
        >
          {/* Image carousel */}
          <View style={styles.imageCarouselContainer}>
            <FlatList
              ref={flatListRef}
              data={
                productImages.length > 0
                  ? productImages
                  : [{ id: 'placeholder', uri: undefined }]
              }
              keyExtractor={(item) => item.id}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={onImageScroll}
              scrollEventThrottle={16}
              renderItem={({ item }) => (
                <View style={styles.imageContainer}>
                  {item.uri ? (
                    <Image
                      source={{ uri: item.uri }}
                      style={styles.image}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.imagePlaceholder}>
                      <ShoppingCart size={50} color={colors.textLight} />
                    </View>
                  )}
                </View>
              )}
            />

            {/* Pagination dots */}
            {productImages.length > 1 && (
              <View style={styles.pagination}>
                {productImages.map((_, index) => {
                  const animatedDotStyle = useAnimatedStyle(() => {
                    const inputRange = [
                      (index - 1) * width,
                      index * width,
                      (index + 1) * width,
                    ];

                    const dotWidth = interpolate(
                      scrollX.value,
                      inputRange,
                      [8, 16, 8],
                      Extrapolate.CLAMP
                    );

                    const opacity = interpolate(
                      scrollX.value,
                      inputRange,
                      [0.5, 1, 0.5],
                      Extrapolate.CLAMP
                    );

                    return {
                      width: withTiming(dotWidth, { duration: 200 }),
                      opacity: withTiming(opacity, { duration: 200 }),
                    };
                  });

                  return (
                    <Animated.View
                      key={index}
                      style={[
                        styles.dot,
                        {
                          backgroundColor:
                            index === activeImageIndex
                              ? colors.primary
                              : colors.border,
                        },
                        animatedDotStyle,
                      ]}
                    />
                  );
                })}
              </View>
            )}

            {/* Stock badge */}
            <View
              style={[
                styles.stockBadge,
                product.inStock ? styles.inStockBadge : styles.outOfStockBadge,
              ]}
            >
              <Text
                style={[
                  styles.stockBadgeText,
                  product.inStock ? styles.inStockText : styles.outOfStockText,
                ]}
              >
                {product.inStock ? 'In Stock' : 'Out of Stock'}
              </Text>
            </View>
          </View>

          <View style={styles.content}>
            {/* Category badge */}
            {product.category && (
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{product.category.name}</Text>
              </View>
            )}

            {/* Product info */}
            <View style={styles.productInfoContainer}>
              <Text style={styles.name}>{product.name}</Text>
              <Text style={styles.unit}>{product.unit}</Text>

              {/* Rating (mock) */}
              {/* <View style={styles.ratingContainer}>
                <Star size={16} color={colors.warning} fill={colors.warning} />
                <Text style={styles.ratingText}>4.8</Text>
                <Text style={styles.reviewCount}>(24 reviews)</Text>
              </View> */}

              <Text style={styles.price}>
                MMK {product.price.toLocaleString()}
              </Text>
            </View>

            {/* Description */}
            {product.description && (
              <View style={styles.descriptionContainer}>
                <Text style={styles.sectionTitle}>Description</Text>
                <Text style={styles.descriptionText}>
                  {product.description}
                </Text>
              </View>
            )}

            {/* Quantity selector */}
            {product.inStock && (
              <View style={styles.quantityContainer}>
                <Text style={styles.sectionTitle}>Quantity</Text>
                <View style={styles.quantityControls}>
                  <TouchableOpacity
                    style={[
                      styles.quantityButton,
                      quantity <= 1 && styles.disabledButton,
                    ]}
                    onPress={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                  >
                    <Minus
                      size={18}
                      color={quantity <= 1 ? colors.textLight : colors.text}
                    />
                  </TouchableOpacity>

                  <Text style={styles.quantityValue}>{quantity}</Text>

                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => handleQuantityChange(1)}
                  >
                    <Plus size={18} color={colors.text} />
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Related products section */}
            <View style={styles.relatedProductsContainer}>
              <Text style={styles.sectionTitle}>You might also like</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.relatedProductsList}
              >
                {mockRelatedProducts.map((item, index) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.relatedProductCard}
                    onPress={() => router.push(`/product/${item.id}`)}
                  >
                    {item.imageUrl ? (
                      <Image
                        source={{ uri: item.imageUrl }}
                        style={styles.relatedProductImage}
                      />
                    ) : (
                      <View style={styles.relatedProductImagePlaceholder}>
                        <ShoppingCart size={20} color={colors.textLight} />
                      </View>
                    )}
                    <Text style={styles.relatedProductName} numberOfLines={2}>
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </ScrollView>

        {/* Bottom action bar */}
        <View style={styles.bottomBar}>
          <TouchableOpacity style={styles.callButton} onPress={handleCallAdmin}>
            <Phone size={20} color={colors.secondary} />
          </TouchableOpacity>

          <Button
            fullWidth
            style={styles.addToCartButton}
            leftIcon={<ShoppingCart size={20} color="white" />}
            onPress={handleAddToCart}
            disabled={!product.inStock}
          >
            {product.inStock ? 'Add to Cart' : 'Out of Stock'}
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  customHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'transparent',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerActionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 24,
  },
  imageCarouselContainer: {
    position: 'relative',
    width: '100%',
    height: width * 0.8,
    maxHeight: 400,
  },
  imageContainer: {
    width,
    height: '100%',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
  },
  dot: {
    height: 8,
    width: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  stockBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  inStockBadge: {
    backgroundColor: colors.successLight,
  },
  outOfStockBadge: {
    backgroundColor: colors.errorLight,
  },
  stockBadgeText: {
    fontSize: 12,
    fontFamily: fonts.semiBold,
  },
  inStockText: {
    color: colors.successDark,
  },
  outOfStockText: {
    color: colors.errorDark,
  },
  content: {
    padding: 20,
  },
  categoryBadge: {
    backgroundColor: colors.secondaryLight,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  categoryText: {
    fontSize: 12,
    fontFamily: fonts.medium,
    color: colors.secondaryDark,
  },
  productInfoContainer: {
    marginBottom: 24,
  },
  name: {
    fontSize: 24,
    fontFamily: fonts.bold,
    color: colors.textDark,
    marginBottom: 4,
  },
  unit: {
    fontSize: 16,
    fontFamily: fonts.regular,
    color: colors.textLight,
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  ratingText: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: colors.text,
    marginLeft: 4,
  },
  reviewCount: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.textLight,
    marginLeft: 4,
  },
  price: {
    fontSize: 24,
    fontFamily: fonts.semiBold,
    color: colors.primary,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: fonts.semiBold,
    color: colors.textDark,
    marginBottom: 12,
  },
  descriptionContainer: {
    marginBottom: 24,
  },
  descriptionText: {
    fontSize: 15,
    fontFamily: fonts.regular,
    color: colors.text,
    lineHeight: 22,
  },
  quantityContainer: {
    marginBottom: 24,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  disabledButton: {
    backgroundColor: colors.disabled,
    borderColor: colors.disabled,
  },
  quantityValue: {
    fontSize: 18,
    fontFamily: fonts.semiBold,
    color: colors.text,
    marginHorizontal: 20,
    minWidth: 24,
    textAlign: 'center',
  },
  relatedProductsContainer: {
    marginBottom: 24,
  },
  relatedProductsList: {
    paddingRight: 20,
  },
  relatedProductCard: {
    width: 100,
    marginRight: 12,
  },
  relatedProductImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginBottom: 8,
  },
  relatedProductImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  relatedProductName: {
    fontSize: 12,
    fontFamily: fonts.medium,
    color: colors.text,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.card,
  },
  callButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.secondaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  addToCartButton: {
    flex: 1,
  },
});

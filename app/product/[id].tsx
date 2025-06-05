import React, { useState } from 'react';
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
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Minus, Plus, ShoppingCart, Phone } from 'lucide-react-native';
import { Container } from '@/components/shared/Container';
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

const windowWidth = Dimensions.get('window').width;

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [quantity, setQuantity] = useState(1);

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
  const { data: admin } = useGetAdmin();

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
    // This would normally use the admin's phone number from the app settings
    // For now, use a placeholder number
    const phoneNumber = admin?.phone || '+959425743536';

    if (Platform.OS === 'web') {
      alert(`Please call the admin at: ${phoneNumber}`);
    } else {
      Linking.openURL(`tel:${phoneNumber}`);
    }
  };

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
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={styles.container}>
        <Header title="Product Details" showBack />

        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl onRefresh={refetch} refreshing={isLoading} />
          }
        >
          {product.imageUrl ? (
            <Image
              source={{ uri: product.imageUrl }}
              style={styles.image}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <ShoppingCart size={50} color={colors.textLight} />
            </View>
          )}

          <View style={styles.content}>
            <View style={styles.header}>
              <Text style={styles.name}>{product.name}</Text>
              <Text style={styles.price}>MMK {product.price.toFixed(0)}</Text>
            </View>

            {product.category && (
              <View style={styles.categoryContainer}>
                <Text style={styles.categoryLabel}>Category: </Text>
                <Text style={styles.categoryName}>{product.category.name}</Text>
              </View>
            )}

            {product.description && (
              <View style={styles.descriptionContainer}>
                <Text style={styles.descriptionTitle}>Description</Text>
                <Text style={styles.descriptionText}>
                  {product.description}
                </Text>
              </View>
            )}

            <View style={styles.stockContainer}>
              <Text
                style={[
                  styles.stockText,
                  product.inStock ? styles.inStockText : styles.outOfStockText,
                ]}
              >
                {product.inStock ? 'In Stock' : 'Out of Stock'}
              </Text>
            </View>

            {product.inStock && (
              <View style={styles.quantityContainer}>
                <Text style={styles.quantityLabel}>Quantity:</Text>
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
                      size={16}
                      color={quantity <= 1 ? colors.textLight : colors.text}
                    />
                  </TouchableOpacity>

                  <Text style={styles.quantityValue}>{quantity}</Text>

                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => handleQuantityChange(1)}
                  >
                    <Plus size={16} color={colors.text} />
                  </TouchableOpacity>
                </View>
              </View>
            )}

            <View style={styles.actionsContainer}>
              {product.inStock ? (
                <Button
                  fullWidth
                  leftIcon={<ShoppingCart size={18} color="white" />}
                  onPress={handleAddToCart}
                >
                  Add to Cart
                </Button>
              ) : (
                <Button fullWidth variant="outline" disabled>
                  Out of Stock
                </Button>
              )}

              <Button
                fullWidth
                variant="secondary"
                style={styles.callButton}
                leftIcon={<Phone size={18} color="white" />}
                onPress={handleCallAdmin}
              >
                Call to Order
              </Button>
            </View>
          </View>
        </ScrollView>
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
  image: {
    width: windowWidth,
    height: windowWidth * 0.75,
    maxHeight: 400,
  },
  imagePlaceholder: {
    width: windowWidth,
    height: windowWidth * 0.75,
    maxHeight: 400,
    backgroundColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 20,
  },
  header: {
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontFamily: fonts.bold,
    color: colors.textDark,
    marginBottom: 8,
  },
  price: {
    fontSize: 22,
    fontFamily: fonts.semiBold,
    color: colors.primary,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryLabel: {
    fontSize: 14,
    fontFamily: fonts.medium,
    color: colors.textLight,
  },
  categoryName: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: colors.secondary,
  },
  descriptionContainer: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  descriptionTitle: {
    fontSize: 16,
    fontFamily: fonts.semiBold,
    color: colors.textDark,
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.text,
    lineHeight: 22,
  },
  stockContainer: {
    marginBottom: 20,
  },
  stockText: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  inStockText: {
    backgroundColor: colors.successLight,
    color: colors.successDark,
  },
  outOfStockText: {
    backgroundColor: colors.errorLight,
    color: colors.errorDark,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  quantityLabel: {
    fontSize: 16,
    fontFamily: fonts.medium,
    color: colors.text,
    marginRight: 16,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: colors.disabled,
  },
  quantityValue: {
    fontSize: 16,
    fontFamily: fonts.semiBold,
    color: colors.text,
    marginHorizontal: 16,
    minWidth: 20,
    textAlign: 'center',
  },
  actionsContainer: {
    gap: 12,
  },
  callButton: {
    marginTop: 12,
  },
});

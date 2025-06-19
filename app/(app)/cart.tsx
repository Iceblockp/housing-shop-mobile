import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  Alert,
  Platform,
  TextInput,
} from 'react-native';
import { router } from 'expo-router';
import { Minus, Plus, Trash2, Clock } from 'lucide-react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/Button';
import { CartItem } from '@/types';
import { useCartStore } from '@/lib/cart/cart-store';
import { orderApi } from '@/lib/api';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NotiBell } from '@/components/shared/NotiBell';

export default function CartScreen() {
  const insets = useSafeAreaInsets();
  const [notes, setNotes] = useState('');
  const [confirmDeadline, setConfirmDeadline] = useState('30'); // default 30 minutes
  const [couponCode, setCouponCode] = useState(''); // Add state for coupon code
  const { items, updateQuantity, removeItem, clearCart, getTotalPrice } =
    useCartStore();

  // Add this line to get access to the query client
  const queryClient = useQueryClient();

  const createOrderMutation = useMutation({
    mutationFn: (data: {
      items: { productId: string; quantity: number }[];
      notes?: string;
      confirmationDeadlineMinutes?: number;
      couponCode?: string;
    }) => orderApi.create(data),
    onSuccess: (newOrder) => {
      clearCart();

      queryClient.setQueriesData({ queryKey: ['orders'] }, (oldData: any) => {
        // If we don't have any cached data yet, don't try to update it
        if (!oldData) return oldData;

        // With infiniteQuery, the structure is different
        // We need to update the first page in the pages array
        return {
          pages: oldData.pages.map((page: any, index: number) => {
            // Update only the first page
            if (index === 0) {
              return {
                ...page,
                orders: [newOrder, ...page.orders],
              };
            }
            return page;
          }),
          pageParams: oldData.pageParams,
        };
      });

      queryClient.setQueriesData(
        { queryKey: ['orders', 'PENDING'] },
        (oldData: any) => {
          // If we don't have any cached data yet, don't try to update it
          if (!oldData) return oldData;

          // With infiniteQuery, the structure is different
          // We need to update the first page in the pages array
          return {
            pages: oldData.pages.map((page: any, index: number) => {
              // Update only the first page
              if (index === 0) {
                return {
                  ...page,
                  orders: [newOrder, ...page.orders],
                };
              }
              return page;
            }),
            pageParams: oldData.pageParams,
          };
        }
      );

      // Force a refetch to ensure UI is updated with the latest data
      // This is a fallback in case the cache update doesn't work perfectly
      // setTimeout(() => {
      //   queryClient.invalidateQueries({ queryKey: ['orders'] });
      // }, 300);

      if (Platform.OS === 'web') {
        alert('Order placed successfully!');
      } else {
        Alert.alert('Success', 'Your order has been placed successfully!', [
          { text: 'OK', onPress: () => router.push('/orders') },
        ]);
      }

      router.push('/orders');
    },
    onError: (error) => {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to place order';

      if (Platform.OS === 'web') {
        alert(`Error: ${errorMessage}`);
      } else {
        Alert.alert('Error', `Failed to place order: ${errorMessage}`);
      }
    },
  });

  const handlePlaceOrder = () => {
    if (items.length === 0) {
      if (Platform.OS === 'web') {
        alert('Your cart is empty');
      } else {
        Alert.alert(
          'Empty Cart',
          'Your cart is empty. Add some items before placing an order.'
        );
      }
      return;
    }

    const orderItems = items.map((item) => ({
      productId: item.product.id,
      quantity: item.quantity,
    }));

    const confirmationDeadlineMinutes = confirmDeadline
      ? parseInt(confirmDeadline)
      : undefined;

    createOrderMutation.mutate({
      items: orderItems,
      notes: notes.trim() || undefined,
      confirmationDeadlineMinutes,
      couponCode: couponCode.trim() || undefined, // Add coupon code to the order
    });
  };

  const handleQuantityChange = (item: CartItem, change: number) => {
    const newQuantity = item.quantity + change;
    if (newQuantity <= 0) {
      if (Platform.OS === 'web') {
        if (confirm('Remove this item from cart?')) {
          removeItem(item.product.id);
        }
      } else {
        Alert.alert(
          'Remove Item',
          'Do you want to remove this item from your cart?',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Remove',
              style: 'destructive',
              onPress: () => removeItem(item.product.id),
            },
          ]
        );
      }
    } else {
      updateQuantity(item.product.id, newQuantity);
    }
  };

  const handleRemoveItem = (item: CartItem) => {
    if (Platform.OS === 'web') {
      if (confirm('Remove this item from cart?')) {
        removeItem(item.product.id);
      }
    } else {
      Alert.alert(
        'Remove Item',
        'Do you want to remove this item from your cart?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Remove',
            style: 'destructive',
            onPress: () => removeItem(item.product.id),
          },
        ]
      );
    }
  };

  const renderItem = ({ item }: { item: CartItem }) => (
    <View style={styles.cartItem}>
      <TouchableOpacity
        style={styles.itemDetails}
        onPress={() => router.push(`/product/${item.product.id}`)}
      >
        {item.product.imageUrl ? (
          <Image
            source={{ uri: item.product.imageUrl }}
            style={styles.itemImage}
          />
        ) : (
          <View style={styles.itemImagePlaceholder} />
        )}

        <View style={styles.itemInfo}>
          <Text style={styles.itemName} numberOfLines={2}>
            {item.product.name}
          </Text>
          <Text style={styles.itemPrice}>
            MMK {item.product.price.toFixed(0)}
          </Text>
        </View>
      </TouchableOpacity>

      <View style={styles.itemActions}>
        <View style={styles.quantityControls}>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => handleQuantityChange(item, -1)}
          >
            <Minus size={16} color="#1E293B" />
          </TouchableOpacity>

          <Text style={styles.quantityText}>{item.quantity}</Text>

          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => handleQuantityChange(item, 1)}
          >
            <Plus size={16} color="#1E293B" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => handleRemoveItem(item)}
        >
          <Trash2 size={20} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top > 0 ? 0 : 16 }]}>
        <Text style={styles.title}>Shopping Cart</Text>
        <NotiBell />
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.product.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Your cart is empty</Text>
            <Button
              variant="outline"
              onPress={() => router.push('/')}
              style={styles.shopButton}
            >
              Continue Shopping
            </Button>
          </View>
        }
        ListFooterComponent={
          items.length > 0 ? (
            <View style={styles.footer}>
              <View style={styles.deadlineContainer}>
                <View style={styles.deadlineHeader}>
                  <Clock size={18} color="#3B82F6" />
                  <Text style={styles.deadlineTitle}>
                    Confirmation Deadline
                  </Text>
                </View>
                <Text style={styles.deadlineText}>
                  Set a time limit for order confirmation. If not confirmed
                  within this time, the order will be automatically cancelled.
                </Text>
                <View style={styles.deadlineInputContainer}>
                  <TextInput
                    style={styles.deadlineInput}
                    value={confirmDeadline}
                    onChangeText={setConfirmDeadline}
                    keyboardType="numeric"
                    maxLength={3}
                  />
                  <Text style={styles.deadlineUnit}>minutes</Text>
                </View>
              </View>

              <View style={styles.couponContainer}>
                <Text style={styles.couponTitle}>Coupon Code</Text>
                <TextInput
                  style={styles.couponInput}
                  placeholder="Enter coupon code (optional)"
                  placeholderTextColor="#64748B"
                  value={couponCode}
                  onChangeText={setCouponCode}
                />
              </View>

              <TextInput
                style={styles.notesInput}
                placeholder="Add notes for your order (optional)"
                placeholderTextColor="#64748B"
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={3}
              />

              <View style={styles.totalContainer}>
                <Text style={styles.totalLabel}>Total:</Text>
                <Text style={styles.totalPrice}>
                  MMK {getTotalPrice().toFixed(0)}
                </Text>
              </View>

              <Button
                fullWidth
                onPress={handlePlaceOrder}
                loading={createOrderMutation.isPending}
                disabled={createOrderMutation.isPending}
              >
                Place Order
              </Button>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: '#1E293B',
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  cartItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  itemDetails: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  itemImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  itemName: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#1E293B',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#3B82F6',
  },
  itemActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    marginHorizontal: 12,
    minWidth: 20,
    textAlign: 'center',
  },
  removeButton: {
    padding: 8,
  },
  footer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    marginBottom: 60, // Extra space for tab bar
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  deadlineContainer: {
    marginBottom: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  deadlineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  deadlineTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    marginLeft: 8,
  },
  deadlineText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    marginBottom: 12,
  },
  deadlineInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deadlineInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#1E293B',
    width: 70,
    textAlign: 'center',
  },
  deadlineUnit: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1E293B',
    marginLeft: 8,
  },
  couponContainer: {
    marginBottom: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  couponTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    marginBottom: 8,
  },
  couponInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#1E293B',
  },
  notesInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#1E293B',
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  totalLabel: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
  },
  totalPrice: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#3B82F6',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    marginTop: 40,
  },
  emptyText: {
    fontSize: 18,
    fontFamily: 'Inter-Medium',
    color: '#64748B',
    marginBottom: 20,
  },
  shopButton: {
    width: 200,
  },
});

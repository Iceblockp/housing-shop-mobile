import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  TextInput,
  Platform,
} from 'react-native';
import { router, useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Phone, Clock } from 'lucide-react-native';
import { Container } from '@/components/shared/Container';
import { Header } from '@/components/shared/Header';
import { Button } from '@/components/ui/Button';
import { orderApi } from '@/lib/api';
import { OrderStatus } from '@/types';
import { colors, statusColors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';
import { format, parseISO, isAfter } from 'date-fns';
import { Linking } from 'react-native';
import { useAuth } from '@/lib/auth/auth-provider';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Order } from '@/types/order';
import { getRemainingTime, isDeadlineApproaching } from '@/lib/utils';
import { OrderProgressBar } from '@/components/ui/OrderProgressBar';
import { useGetAdmin } from '@/hooks/useAdmin';

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user, isAdmin } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [deliveryDeadline, setDeliveryDeadline] = useState('30'); // Default 30 minutes
  const [remainingConfirmTime, setRemainingConfirmTime] = useState<
    string | null
  >(null);
  const [remainingDeliveryTime, setRemainingDeliveryTime] = useState<
    string | null
  >(null);

  const {
    data: order,
    isLoading,
    refetch,
    error,
  } = useQuery<Order>({
    queryKey: ['order', id],
    queryFn: () => orderApi.getById(id),
    enabled: !!id,
  });

  const { data: admin } = useGetAdmin();

  const updateOrderMutation = useMutation({
    mutationFn: (data: {
      status: OrderStatus;
      deliveryDeadlineMinutes?: number;
    }) => orderApi.updateStatus(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order', id] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
    onError: (error) => {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to update order';
      if (Platform.OS === 'web') {
        alert(`Error: ${errorMessage}`);
      } else {
        Alert.alert('Error', `Failed to update order: ${errorMessage}`);
      }
    },
  });

  const handleUpdateStatus = (
    status: OrderStatus,
    requireConfirmation = true
  ) => {
    const updateAction = () => {
      const data: { status: OrderStatus; deliveryDeadlineMinutes?: number } = {
        status,
      };

      // Add delivery deadline if confirming order
      if (status === 'CONFIRMED' && deliveryDeadline) {
        data.deliveryDeadlineMinutes = parseInt(deliveryDeadline);
      }

      updateOrderMutation.mutate(data);
    };

    if (requireConfirmation) {
      if (Platform.OS === 'web') {
        if (
          confirm(
            `Are you sure you want to update the order status to ${status}?`
          )
        ) {
          updateAction();
        }
      } else {
        Alert.alert(
          'Update Order Status',
          `Are you sure you want to update the order status to ${status}?`,
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Update', onPress: updateAction },
          ]
        );
      }
    } else {
      updateAction();
    }
  };

  const handleCallUser = () => {
    if (!order?.user.phone) {
      if (Platform.OS === 'web') {
        alert('User has no phone number');
      } else {
        Alert.alert(
          'No Phone Number',
          'This user has not provided a phone number.'
        );
      }
      return;
    }

    if (Platform.OS === 'web') {
      alert(`Please call the user at: ${order.user.phone}`);
    } else {
      Linking.openURL(`tel:${order.user.phone}`);
    }
  };
  const handleCallAdmin = () => {
    if (!admin?.phone) {
      if (Platform.OS === 'web') {
        alert('User has no phone number');
      } else {
        Alert.alert('No Phone Number', 'This Admin is not available now.');
      }
      return;
    }

    if (Platform.OS === 'web') {
      alert(`Please call the user at: ${admin?.phone}`);
    } else {
      Linking.openURL(`tel:${admin?.phone}`);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not set';
    try {
      return format(parseISO(dateString), 'MMM dd, yyyy HH:mm');
    } catch (error) {
      return dateString;
    }
  };

  useEffect(() => {
    if (!order) return;

    const timer = setInterval(() => {
      if (order.confirmDeadline) {
        setRemainingConfirmTime(getRemainingTime(order.confirmDeadline));
      }
      if (order.deliveryDeadline) {
        setRemainingDeliveryTime(getRemainingTime(order.deliveryDeadline));
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [order]);

  const isDeadlinePassed = (deadlineString?: string) => {
    if (!deadlineString) return false;
    try {
      const deadline = parseISO(deadlineString);
      return isAfter(new Date(), deadline);
    } catch (error) {
      return false;
    }
  };

  const renderStatusActionButtons = () => {
    if (!order) return null;

    // User can only cancel pending orders
    if (!isAdmin) {
      return order.status === 'PENDING' ? (
        <Button
          variant="danger"
          onPress={() => handleUpdateStatus('CANCELLED')}
          loading={updateOrderMutation.isPending}
          fullWidth
        >
          Cancel Order
        </Button>
      ) : null;
    }

    // Admin actions based on current status
    switch (order.status) {
      case 'PENDING':
        return (
          <View style={styles.adminActions}>
            <View style={styles.deadlineInputContainer}>
              <Text style={styles.deadlineLabel}>
                Set delivery time (minutes):
              </Text>
              <TextInput
                style={styles.deadlineInput}
                value={deliveryDeadline}
                onChangeText={setDeliveryDeadline}
                keyboardType="numeric"
                maxLength={3}
              />
            </View>

            <View style={styles.buttonRow}>
              <Button
                variant="danger"
                onPress={() => handleUpdateStatus('CANCELLED')}
                loading={updateOrderMutation.isPending}
                style={styles.actionButton}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onPress={() => handleUpdateStatus('CONFIRMED')}
                loading={updateOrderMutation.isPending}
                style={styles.actionButton}
              >
                Confirm
              </Button>
            </View>
          </View>
        );
      case 'CONFIRMED':
        return (
          <View style={styles.buttonRow}>
            <Button
              variant="danger"
              onPress={() => handleUpdateStatus('CANCELLED')}
              loading={updateOrderMutation.isPending}
              style={styles.actionButton}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onPress={() => handleUpdateStatus('PROCESSING')}
              loading={updateOrderMutation.isPending}
              style={styles.actionButton}
            >
              Start Processing
            </Button>
          </View>
        );
      case 'PROCESSING':
        return (
          <Button
            onPress={() => handleUpdateStatus('DELIVERING')}
            loading={updateOrderMutation.isPending}
            fullWidth
          >
            Start Delivery
          </Button>
        );
      case 'DELIVERING':
        return (
          <Button
            onPress={() => handleUpdateStatus('COMPLETED')}
            loading={updateOrderMutation.isPending}
            fullWidth
          >
            Complete Order
          </Button>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={styles.container}>
          <Header title="Order Details" showBack />
          <View style={styles.centerContainer}>
            <Text style={styles.loadingText}>Loading order details...</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !order) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={styles.container}>
          <Header title="Order Details" showBack />
          <View style={styles.centerContainer}>
            <Text style={styles.errorText}>Failed to load order details</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const showConfirmDeadline =
    order.status === 'PENDING' && order.confirmDeadline;
  const showDeliveryDeadline =
    order.status === 'CONFIRMED' && order.deliveryDeadline;

  const statusColor = statusColors[order.status];
  const formattedCreatedAt = formatDate(order.createdAt);
  const isConfirmDeadlinePassed = isDeadlinePassed(order.confirmDeadline);
  const isDeliveryDeadlinePassed = isDeadlinePassed(
    order.deliveryDeadline || undefined
  );
  const handleGoBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={styles.container}>
        <Header title="Order Detailss" showBack onBackPress={handleGoBack} />

        <Container onRefresh={refetch} refreshing={isLoading}>
          <View style={styles.header}>
            <View style={styles.orderIdContainer}>
              <Text style={styles.orderIdLabel}>Order ID:</Text>
              <Text style={styles.orderId}>#{order.id.substring(0, 8)}</Text>
            </View>

            <View
              style={[styles.statusContainer, { backgroundColor: statusColor }]}
            >
              <Text style={styles.statusText}>{order.status}</Text>
            </View>
          </View>

          {/* Add the progress bar here */}
          <View style={styles.progressSection}>
            <OrderProgressBar status={order.status} />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Order Information</Text>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Date:</Text>
              <Text style={styles.infoValue}>{formattedCreatedAt}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Total:</Text>
              <Text style={styles.infoValue}>MMK {order.total.toFixed(0)}</Text>
            </View>

            {showConfirmDeadline && (
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Deadline To Confirm:</Text>
                <Text
                  style={[
                    styles.infoValue,
                    isDeadlineApproaching(order.confirmDeadline) &&
                      styles.passedDeadline,
                  ]}
                >
                  {remainingConfirmTime}
                </Text>
              </View>
            )}

            {showDeliveryDeadline && (
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Delivery will arrive In:</Text>
                <Text
                  style={[
                    styles.infoValue,
                    isDeadlineApproaching(order.deliveryDeadline) &&
                      styles.passedDeadline,
                  ]}
                >
                  {remainingDeliveryTime}
                </Text>
              </View>
            )}

            {order.notes && (
              <View style={styles.notesContainer}>
                <Text style={styles.notesLabel}>Order Notes:</Text>
                <Text style={styles.notesText}>{order.notes}</Text>
              </View>
            )}
          </View>

          {isAdmin && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Customer Information</Text>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Name:</Text>
                <Text style={styles.infoValue}>{order.user.name}</Text>
              </View>

              {order.user.phone && (
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Phone:</Text>
                  <View style={styles.phoneContainer}>
                    <Text style={styles.infoValue}>{order.user.phone}</Text>
                    <TouchableOpacity
                      style={styles.callButton}
                      onPress={handleCallUser}
                    >
                      <Phone size={16} color={colors.card} />
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {order.user.roomNumber && (
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Room:</Text>
                  <Text style={styles.infoValue}>{order.user.roomNumber}</Text>
                </View>
              )}

              {order.user.floor !== null && order.user.floor !== undefined && (
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Floor:</Text>
                  <Text style={styles.infoValue}>{order.user.floor}</Text>
                </View>
              )}
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Order Items</Text>
            {order.items.map((item) => (
              <View key={item.id} style={styles.itemContainer}>
                <View style={styles.itemHeader}>
                  {item.product.imageUrl ? (
                    <Image
                      source={{ uri: item.product.imageUrl }}
                      style={styles.itemImage}
                    />
                  ) : (
                    <View style={styles.itemImagePlaceholder} />
                  )}

                  <View style={styles.itemDetails}>
                    <Text style={styles.itemName}>{item.product.name}</Text>
                    <Text style={styles.itemPrice}>
                      MMK {item.price.toFixed(0)}
                    </Text>
                  </View>
                </View>

                <View style={styles.itemQuantity}>
                  <Text style={styles.quantityText}>
                    Quantity: {item.quantity}
                  </Text>
                  <Text style={styles.subtotalText}>
                    Subtotal: MMK {(item.price * item.quantity).toFixed(0)}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.actionContainer}>
            {renderStatusActionButtons()}

            {order.status !== 'CANCELLED' &&
              order.status !== 'COMPLETED' &&
              !isAdmin && (
                <Button
                  variant="secondary"
                  leftIcon={<Phone size={18} color="white" />}
                  onPress={handleCallAdmin}
                  fullWidth
                  style={styles.callAdminButton}
                >
                  Call Admin
                </Button>
              )}
          </View>
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: fonts.regular,
    color: colors.textLight,
  },
  errorText: {
    fontSize: 16,
    fontFamily: fonts.medium,
    color: colors.error,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  orderIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderIdLabel: {
    fontSize: 16,
    fontFamily: fonts.regular,
    color: colors.textLight,
    marginRight: 8,
  },
  orderId: {
    fontSize: 18,
    fontFamily: fonts.semiBold,
    color: colors.text,
  },
  statusContainer: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 14,
    fontFamily: fonts.medium,
    color: 'white',
  },
  section: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: fonts.semiBold,
    color: colors.text,
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  infoLabel: {
    fontSize: 14,
    fontFamily: fonts.medium,
    color: colors.textLight,
  },
  infoValue: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: colors.text,
  },
  passedDeadline: {
    color: colors.error,
  },
  notesContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: colors.background,
    borderRadius: 8,
  },
  notesLabel: {
    fontSize: 14,
    fontFamily: fonts.medium,
    color: colors.textLight,
    marginBottom: 6,
  },
  notesText: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.text,
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  callButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  itemContainer: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: colors.background,
    borderRadius: 8,
  },
  itemHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 6,
    marginRight: 12,
  },
  itemImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 6,
    backgroundColor: colors.border,
    marginRight: 12,
  },
  itemDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  itemName: {
    fontSize: 16,
    fontFamily: fonts.medium,
    color: colors.text,
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: colors.primary,
  },
  itemQuantity: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
  },
  quantityText: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.text,
  },
  subtotalText: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: colors.text,
  },
  actionContainer: {
    marginBottom: 30,
  },
  adminActions: {
    marginBottom: 16,
  },
  deadlineInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    justifyContent: 'space-between',
  },
  deadlineLabel: {
    fontSize: 14,
    fontFamily: fonts.medium,
    color: colors.text,
  },
  deadlineInput: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    fontFamily: fonts.medium,
    color: colors.text,
    width: 80,
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  callAdminButton: {
    marginTop: 12,
  },
  // Add this new style
  progressSection: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
});

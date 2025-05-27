import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Clock, ChevronRight } from 'lucide-react-native';
import { Order } from '@/types';
import { colors, statusColors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';
import { format, parseISO, isAfter } from 'date-fns';
import { OrderProgressBar } from '@/components/ui/OrderProgressBar';

interface OrderItemProps {
  order: Order;
}

export function OrderItem({ order }: OrderItemProps) {
  const statusColor = statusColors[order.status];

  const handlePress = () => {
    router.push(`/order/${order.id}`);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    try {
      return format(parseISO(dateString), 'MMM dd, yyyy HH:mm');
    } catch (error) {
      return dateString;
    }
  };

  const isDeadlinePassed = (deadlineString?: string) => {
    if (!deadlineString) return false;
    try {
      const deadline = parseISO(deadlineString);
      return isAfter(new Date(), deadline);
    } catch (error) {
      return false;
    }
  };

  const formattedCreatedAt = formatDate(order.createdAt);
  const formattedConfirmDeadline = formatDate(order.confirmDeadline);
  const isConfirmDeadlinePassed = isDeadlinePassed(order.confirmDeadline);

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress}>
      <View style={styles.header}>
        <View style={styles.orderInfo}>
          <Text style={styles.orderId}>Order #{order.id.substring(0, 8)}</Text>
          <Text style={styles.date}>{formattedCreatedAt}</Text>
        </View>

        <View
          style={[styles.statusContainer, { backgroundColor: statusColor }]}
        >
          <Text style={styles.statusText}>{order.status}</Text>
        </View>
      </View>

      {/* Add the progress bar here */}
      <OrderProgressBar status={order.status} compact={true} />

      <View style={styles.itemsContainer}>
        <Text style={styles.itemsText}>
          {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
        </Text>
        <Text style={styles.totalText}>MMK {order.total.toFixed(0)}</Text>
      </View>

      {order.status === 'PENDING' && order.confirmDeadline && (
        <View
          style={[
            styles.deadlineContainer,
            isConfirmDeadlinePassed && styles.deadlinePassed,
          ]}
        >
          <Clock
            size={14}
            color={isConfirmDeadlinePassed ? colors.error : colors.warning}
          />
          <Text
            style={[
              styles.deadlineText,
              isConfirmDeadlinePassed && styles.deadlinePassedText,
            ]}
          >
            {isConfirmDeadlinePassed
              ? 'Confirmation deadline passed'
              : `Confirmation deadline: ${formattedConfirmDeadline}`}
          </Text>
        </View>
      )}

      <View style={styles.footer}>
        <ChevronRight size={20} color={colors.textLight} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderInfo: {
    flex: 1,
  },
  orderId: {
    fontSize: 16,
    fontFamily: fonts.semiBold,
    color: colors.text,
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.textLight,
  },
  statusContainer: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    fontFamily: fonts.medium,
    color: 'white',
  },
  itemsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  itemsText: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.text,
  },
  totalText: {
    fontSize: 16,
    fontFamily: fonts.semiBold,
    color: colors.primary,
  },
  deadlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: colors.warningLight,
    borderRadius: 4,
    marginBottom: 12,
  },
  deadlinePassed: {
    backgroundColor: colors.errorLight,
  },
  deadlineText: {
    fontSize: 12,
    fontFamily: fonts.medium,
    color: colors.warningDark,
    marginLeft: 6,
  },
  deadlinePassedText: {
    color: colors.errorDark,
  },
  footer: {
    alignItems: 'flex-end',
  },
});

import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { colors, statusColors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';
import { OrderStatus } from '@/types';
import {
  Clock,
  CheckCircle,
  Package,
  Truck,
  ShoppingBag,
  XCircle,
} from 'lucide-react-native';

interface OrderProgressBarProps {
  status: OrderStatus;
  compact?: boolean;
}

export function OrderProgressBar({
  status,
  compact = false,
}: OrderProgressBarProps) {
  // Define the order status flow (excluding CANCELLED which is a special case)
  const statusFlow = [
    'PENDING',
    'CONFIRMED',
    'PROCESSING',
    'DELIVERING',
    'COMPLETED',
  ];

  // Define icons for each status
  const statusIcons = {
    PENDING: <Clock size={compact ? 10 : 14} color="white" />,
    CONFIRMED: <CheckCircle size={compact ? 10 : 14} color="white" />,
    PROCESSING: <Package size={compact ? 10 : 14} color="white" />,
    DELIVERING: <Truck size={compact ? 10 : 14} color="white" />,
    COMPLETED: <ShoppingBag size={compact ? 10 : 14} color="white" />,
    CANCELLED: <XCircle size={compact ? 10 : 14} color="white" />,
  };

  // If order is cancelled, show a special cancelled state
  if (status === 'CANCELLED') {
    return (
      <View style={styles.container}>
        <View style={styles.cancelledBar}>
          <XCircle size={16} color="white" style={styles.cancelledIcon} />
          <Text style={styles.cancelledText}>Order Cancelled</Text>
        </View>
      </View>
    );
  }

  // Find the current status index in the flow
  const currentIndex = statusFlow.indexOf(status);

  return (
    <View style={[styles.container, compact && styles.compactContainer]}>
      {/* Progress bar */}
      <View style={styles.barContainer}>
        {statusFlow.map((step, index) => {
          const isActive = index <= currentIndex;
          const isLast = index === statusFlow.length - 1;

          return (
            <React.Fragment key={step}>
              {/* Status circle with icon */}
              <View
                style={[
                  styles.circle,
                  isActive
                    ? { backgroundColor: statusColors[step as OrderStatus] }
                    : styles.inactiveCircle,
                  compact && styles.compactCircle,
                ]}
              >
                {statusIcons[step as OrderStatus]}
              </View>

              {/* Connecting line (except after the last item) */}
              {!isLast && (
                <View
                  style={[
                    styles.line,
                    index < currentIndex
                      ? { backgroundColor: colors.success }
                      : styles.inactiveLine,
                    compact && styles.compactLine,
                  ]}
                />
              )}
            </React.Fragment>
          );
        })}
      </View>

      {/* Status labels (only show in non-compact mode) */}
      {!compact && (
        <View style={styles.labelsContainer}>
          {statusFlow.map((step, index) => {
            const isActive = index <= currentIndex;

            return (
              <View key={step} style={styles.labelWrapper}>
                <Text
                  style={[
                    styles.label,
                    isActive ? styles.activeLabel : styles.inactiveLabel,
                  ]}
                  numberOfLines={1}
                >
                  {step.charAt(0) + step.slice(1).toLowerCase()}
                </Text>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  compactContainer: {
    marginVertical: 8,
  },
  barContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  circle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  compactCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  inactiveCircle: {
    backgroundColor: colors.disabled,
  },
  line: {
    flex: 1,
    height: 3,
    backgroundColor: colors.success,
    marginHorizontal: 4,
  },
  compactLine: {
    height: 2,
    marginHorizontal: 2,
  },
  inactiveLine: {
    backgroundColor: colors.disabled,
  },
  labelsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  labelWrapper: {
    width: 24,
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  label: {
    fontSize: 10,
    fontFamily: fonts.medium,
    textAlign: 'center',
  },
  activeLabel: {
    color: colors.text,
  },
  inactiveLabel: {
    color: colors.textLight,
  },
  cancelledBar: {
    backgroundColor: statusColors.CANCELLED,
    padding: 8,
    borderRadius: 4,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  cancelledText: {
    color: 'white',
    fontFamily: fonts.medium,
    fontSize: 14,
    marginLeft: 6,
  },
  cancelledIcon: {
    marginRight: 4,
  },
});

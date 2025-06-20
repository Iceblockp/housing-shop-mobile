import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '@/components/shared/Header';
import { Container } from '@/components/shared/Container';
import { useUserCoupons, useCombineCoupons } from '@/hooks/use-coupons';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';
import { Ticket, Plus, Check } from 'lucide-react-native';

export default function CouponsScreen() {
  const [activeTab, setActiveTab] = useState<'active' | 'used'>('active');
  const [selectedCoupons, setSelectedCoupons] = useState<string[]>([]);
  const [combineMode, setCombineMode] = useState(false);

  const { data: activeData, isLoading: isLoadingActive } = useUserCoupons({
    isUsed: false,
  });
  const { data: usedData, isLoading: isLoadingUsed } = useUserCoupons({
    isUsed: true,
  });

  const combineCouponsMutation = useCombineCoupons();

  const toggleCouponSelection = (couponId: string) => {
    if (selectedCoupons.includes(couponId)) {
      setSelectedCoupons(selectedCoupons.filter((id) => id !== couponId));
    } else {
      setSelectedCoupons([...selectedCoupons, couponId]);
    }
  };

  const handleCombineCoupons = async () => {
    if (selectedCoupons.length < 2) {
      Alert.alert('Error', 'Please select at least 2 coupons to combine');
      return;
    }

    try {
      await combineCouponsMutation.mutateAsync(selectedCoupons);
      Alert.alert(
        'Success',
        `Successfully combined ${selectedCoupons.length} coupons!`,
        [
          {
            text: 'OK',
            onPress: () => {
              setSelectedCoupons([]);
              setCombineMode(false);
            },
          },
        ]
      );
    } catch (error) {
      console.log('error is', error);
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to combine coupons'
      );
    }
  };

  const renderCouponItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[
        styles.couponCard,
        combineMode &&
          selectedCoupons.includes(item.id) &&
          styles.selectedCoupon,
      ]}
      onPress={() => (combineMode ? toggleCouponSelection(item.id) : null)}
      disabled={!combineMode}
    >
      <View style={styles.couponHeader}>
        <View style={styles.couponIconContainer}>
          <Ticket size={24} color={colors.white} />
        </View>
        <View style={styles.couponInfo}>
          <Text style={styles.couponCode}>{item.code}</Text>
          <Text style={styles.couponAmount}>MMK {item.amount.toFixed(0)}</Text>
        </View>
        {combineMode && (
          <TouchableOpacity
            style={[
              styles.selectButton,
              selectedCoupons.includes(item.id) && styles.selectedButton,
            ]}
            onPress={() => toggleCouponSelection(item.id)}
          >
            {selectedCoupons.includes(item.id) ? (
              <Check size={16} color="white" />
            ) : (
              <Plus size={16} color={colors.primary} />
            )}
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.couponFooter}>
        <Text style={styles.couponDate}>
          Created: {new Date(item.createdAt).toLocaleDateString()}
        </Text>
        {item.isUsed && (
          <View style={styles.usedBadge}>
            <Text style={styles.usedBadgeText}>Used</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ticket size={60} color={colors.border} />
      <Text style={styles.emptyText}>
        {activeTab === 'active'
          ? 'No active coupons found'
          : 'No used coupons found'}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={styles.container}>
        <Header title="My Coupons" showBack />

        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'active' && styles.activeTab]}
            onPress={() => setActiveTab('active')}
            disabled={combineMode}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'active' && styles.activeTabText,
              ]}
            >
              Active
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'used' && styles.activeTab]}
            onPress={() => setActiveTab('used')}
            disabled={combineMode}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'used' && styles.activeTabText,
              ]}
            >
              Used
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'active' && (
          <View style={styles.actionBar}>
            {!combineMode ? (
              <TouchableOpacity
                style={styles.combineButton}
                onPress={() => setCombineMode(true)}
                disabled={!activeData?.coupons?.length}
              >
                <Plus size={16} color="white" />
                <Text style={styles.combineButtonText}>Combine Coupons</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.combineActions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    setCombineMode(false);
                    setSelectedCoupons([]);
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.confirmButton,
                    selectedCoupons.length < 2 && styles.disabledButton,
                  ]}
                  onPress={handleCombineCoupons}
                  disabled={
                    selectedCoupons.length < 2 ||
                    combineCouponsMutation.isPending
                  }
                >
                  {combineCouponsMutation.isPending ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <>
                      <Text style={styles.confirmButtonText}>
                        Combine ({selectedCoupons.length})
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* Replace Container with a simple View to avoid nested scrolling components */}
        <View style={styles.contentContainer}>
          {(activeTab === 'active' && isLoadingActive) ||
          (activeTab === 'used' && isLoadingUsed) ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loadingText}>Loading coupons...</Text>
            </View>
          ) : (
            <FlatList
              data={
                activeTab === 'active'
                  ? activeData?.coupons || []
                  : usedData?.coupons || []
              }
              keyExtractor={(item) => item.id}
              renderItem={renderCouponItem}
              ListEmptyComponent={renderEmptyState}
              contentContainerStyle={styles.listContainer}
            />
          )}
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
  contentContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontFamily: fonts.medium,
    fontSize: 16,
    color: colors.textLight,
  },
  activeTabText: {
    color: colors.primary,
  },
  actionBar: {
    padding: 12,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  combineButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  combineButtonText: {
    color: 'white',
    fontFamily: fonts.medium,
    fontSize: 14,
    marginLeft: 8,
  },
  combineActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 10,
    borderRadius: 8,
    marginRight: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: colors.text,
    fontFamily: fonts.medium,
    fontSize: 14,
  },
  confirmButton: {
    flex: 2,
    backgroundColor: colors.primary,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  confirmButtonText: {
    color: 'white',
    fontFamily: fonts.medium,
    fontSize: 14,
  },
  disabledButton: {
    backgroundColor: colors.border,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  couponCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  selectedCoupon: {
    borderColor: colors.primary,
    borderWidth: 2,
    backgroundColor: colors.primaryLight + '20', // 20% opacity
  },
  couponHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  couponIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  couponInfo: {
    flex: 1,
  },
  couponCode: {
    fontFamily: fonts.semiBold,
    fontSize: 18,
    color: colors.text,
    marginBottom: 4,
  },
  couponAmount: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: colors.primary,
  },
  selectButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  selectedButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  couponFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
  },
  couponDate: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textLight,
  },
  usedBadge: {
    backgroundColor: colors.errorLight,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  usedBadgeText: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.error,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontFamily: fonts.medium,
    fontSize: 16,
    color: colors.textLight,
    marginTop: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontFamily: fonts.medium,
    fontSize: 16,
    color: colors.textLight,
    marginTop: 16,
    textAlign: 'center',
  },
});

import React, { useEffect, useState, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
  Modal,
  Pressable,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '@/components/shared/Header';
import { useAuth } from '@/lib/auth/auth-provider';
import { router } from 'expo-router';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';
import {
  BarChart4,
  ShoppingBag,
  Users,
  Package,
  Calendar,
  DollarSign,
  RefreshCw,
  AlertCircle,
  Filter,
  X,
  ChevronDown,
} from 'lucide-react-native';
import { useAdminAnalytics, AdminAnalytics, AnalyticsFilter } from '@/hooks/use-admin-analytics';
import { useQueryClient } from '@tanstack/react-query';
import { format, subMonths } from 'date-fns';
// Using @react-native-community/datetimepicker
// Note: iOS and Android have different display behaviors
import DateTimePicker from '@react-native-community/datetimepicker';
import { Button } from 'react-native';

const { width } = Dimensions.get('window');
const cardWidth = (width - 48) / 2; // 2 cards per row with margins

export default function AdminAnalyticsScreen() {
  const { isAdmin } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'sales', 'products', 'customers'
  const queryClient = useQueryClient();
  
  // Filter state
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'date' | 'month'>('all');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [monthPickerVisible, setMonthPickerVisible] = useState(false);
  
  // Generate month options for the last 12 months
  const monthOptions = React.useMemo(() => {
    const options = [];
    const currentDate = new Date();
    
    for (let i = 0; i < 12; i++) {
      const monthDate = subMonths(currentDate, i);
      const value = format(monthDate, 'yyyy-MM');
      const label = format(monthDate, 'MMMM yyyy');
      options.push({ value, label });
    }
    
    return options;
  }, []);
  
  // Prepare filter object based on filter type
  const filter: AnalyticsFilter = {
    filterType,
    filterValue: filterType === 'date' ? format(selectedDate, 'yyyy-MM-dd') : 
                filterType === 'month' ? selectedMonth : 
                undefined
  };
  
  // Fetch real analytics data
  const {
    data: analyticsData,
    isLoading,
    error,
  } = useAdminAnalytics(filter);

  // Redirect if not admin
  useEffect(() => {
    if (!isAdmin) {
      router.replace('/');
    }
  }, [isAdmin]);
  
  const handleResetFilter = () => {
    setFilterType('all');
    setSelectedDate(new Date());
    setSelectedMonth(format(new Date(), 'yyyy-MM'));
    setFilterModalVisible(false);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await queryClient.invalidateQueries({ queryKey: ['admin-analytics'] });
    } finally {
      setRefreshing(false);
    }
  };
  
  // Handle date change from DateTimePicker
  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
    // On iOS, we don't automatically hide the picker to allow users to continue changing dates
    if (Platform.OS !== 'ios') {
      setShowDatePicker(false);
    }
  };
  
  const handleMonthSelect = (monthValue: string) => {
    setSelectedMonth(monthValue);
    setMonthPickerVisible(false);
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toLocaleString()}`;
  };

  const renderOverviewTab = () => {
    if (!analyticsData) return null;

    return (
      <View style={styles.tabContent}>
        <View style={styles.cardsContainer}>
          <AnalyticsCard
            title="Total Revenue"
            value={formatCurrency(analyticsData.orders.totalRevenue)}
            icon={<DollarSign size={20} color={colors.primary} />}
          />
          <AnalyticsCard
            title="Total Orders"
            value={analyticsData.orders.totalOrders.toString()}
            icon={<ShoppingBag size={20} color={colors.primary} />}
          />
          <AnalyticsCard
            title="Avg Order Value"
            value={formatCurrency(analyticsData.orders.averageOrderValue)}
            icon={<Calendar size={20} color={colors.primary} />}
          />
          <AnalyticsCard
            title="Products"
            value={analyticsData.products.totalProducts.toString()}
            icon={<Package size={20} color={colors.primary} />}
          />
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Top Selling Products</Text>
          {analyticsData.products.topSellingProducts.map((product, index) => (
            <View key={product.id} style={styles.listItem}>
              <Text style={styles.listItemRank}>{index + 1}</Text>
              <Text style={styles.listItemName}>{product.name}</Text>
              <Text style={styles.listItemValue}>{product.totalSold} sold</Text>
            </View>
          ))}
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Top Categories</Text>
          {analyticsData.products.categoryDistribution.map(
            (category, index) => (
              <View key={category.id} style={styles.listItem}>
                <Text style={styles.listItemRank}>{index + 1}</Text>
                <Text style={styles.listItemName}>{category.name}</Text>
                <Text style={styles.listItemValue}>
                  {category.productCount} products
                </Text>
              </View>
            )
          )}
        </View>
      </View>
    );
  };

  const renderSalesTab = () => {
    if (!analyticsData) return null;

    return (
      <View style={styles.tabContent}>
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Daily Orders</Text>
          <Text style={styles.chartPlaceholderSubtext}>
            {filterType === 'all' && 'Last 30 days order data'}
            {filterType === 'date' && `Orders on ${format(selectedDate, 'MMMM d, yyyy')}`}
            {filterType === 'month' && `Orders in ${monthOptions.find(m => m.value === selectedMonth)?.label || 'selected month'}`}
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginTop: 8 }}
          >
            <View style={{ flexDirection: 'row', paddingVertical: 8 }}>
              {analyticsData.orders.dailyOrders.map((day, index) => (
                <View key={day.date} style={styles.dailyOrderBar}>
                  <View
                    style={[
                      styles.dailyOrderBarFill,
                      { height: Math.max(20, day.orders * 4) },
                    ]}
                  />
                  <Text style={styles.dailyOrderDate}>
                    {new Date(day.date).getDate()}
                  </Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Sales Summary</Text>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Total Revenue</Text>
            <Text style={styles.summaryValue}>
              {formatCurrency(analyticsData.orders.totalRevenue)}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Average Order Value</Text>
            <Text style={styles.summaryValue}>
              {formatCurrency(analyticsData.orders.averageOrderValue)}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Total Orders</Text>
            <Text style={styles.summaryValue}>
              {analyticsData.orders.totalOrders}
            </Text>
          </View>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Order Status Distribution</Text>
          {analyticsData.orders.statusDistribution.map((status) => (
            <View key={status.status} style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>{status.status}</Text>
              <Text style={styles.summaryValue}>{status.count}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderProductsTab = () => {
    if (!analyticsData) return null;

    return (
      <View style={styles.tabContent}>
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Product Summary</Text>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Total Products</Text>
            <Text style={styles.summaryValue}>
              {analyticsData.products.totalProducts}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Out of Stock Products</Text>
            <Text style={styles.summaryValue}>
              {analyticsData.products.outOfStockProducts}
            </Text>
          </View>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Top Selling Products</Text>
          {analyticsData.products.topSellingProducts.map((product, index) => (
            <View key={product.id} style={styles.listItem}>
              <Text style={styles.listItemRank}>{index + 1}</Text>
              <Text style={styles.listItemName}>{product.name}</Text>
              <Text style={styles.listItemValue}>
                {product.totalSold} sold - {formatCurrency(product.price)}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Category Distribution</Text>
          {analyticsData.products.categoryDistribution.map(
            (category, index) => (
              <View key={category.id} style={styles.listItem}>
                <Text style={styles.listItemRank}>{index + 1}</Text>
                <Text style={styles.listItemName}>{category.name}</Text>
                <Text style={styles.listItemValue}>
                  {category.productCount} products
                </Text>
              </View>
            )
          )}
        </View>
      </View>
    );
  };

  const renderCustomersTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.sectionContainer}>
        <View style={styles.comingSoonContainer}>
          <Users size={32} color="#64748B" />
          <Text style={styles.comingSoonText}>
            Customer analytics features are currently in development and will be
            available in a future update.
          </Text>
        </View>
      </View>
    </View>
  );

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'sales':
        return renderSalesTab();
      case 'products':
        return renderProductsTab();
      case 'customers':
        return renderCustomersTab();
      case 'overview':
      default:
        return renderOverviewTab();
    }
  };

  if (!isAdmin) {
    return null;
  }

  // Filter modal component
  const renderFilterModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={filterModalVisible}
      onRequestClose={() => setFilterModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filter Analytics</Text>
            <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
              <X size={20} color="#64748B" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>Filter Type</Text>
            <View style={styles.filterOptions}>
              <TouchableOpacity 
                style={[styles.filterOption, filterType === 'all' && styles.activeFilterOption]}
                onPress={() => setFilterType('all')}
              >
                <Text style={[styles.filterOptionText, filterType === 'all' && styles.activeFilterOptionText]}>All Time</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.filterOption, filterType === 'date' && styles.activeFilterOption]}
                onPress={() => setFilterType('date')}
              >
                <Text style={[styles.filterOptionText, filterType === 'date' && styles.activeFilterOptionText]}>Specific Date</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.filterOption, filterType === 'month' && styles.activeFilterOption]}
                onPress={() => setFilterType('month')}
              >
                <Text style={[styles.filterOptionText, filterType === 'month' && styles.activeFilterOptionText]}>Specific Month</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {filterType === 'date' && (
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Select Date</Text>
              <TouchableOpacity 
                style={styles.datePickerButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Calendar size={16} color={colors.primary} />
                <Text style={styles.datePickerButtonText}>
                  {format(selectedDate, 'MMMM d, yyyy')}
                </Text>
                <ChevronDown size={16} color="#64748B" />
              </TouchableOpacity>
              {showDatePicker && (
                <View style={styles.datePickerContainer}>
                  {Platform.OS === 'ios' ? (
                    <>
                      <DateTimePicker
                        value={selectedDate}
                        mode="date"
                        display="spinner"
                        onChange={(event, date) => {
                          if (date) handleDateChange(date);
                        }}
                        style={{ width: '100%', height: 200 }}
                      />
                      <View style={styles.datePickerActions}>
                        <Button 
                          title="Cancel" 
                          onPress={() => setShowDatePicker(false)} 
                          color="#64748B"
                        />
                        <Button 
                          title="Select Today" 
                          onPress={() => {
                            setSelectedDate(new Date());
                            setShowDatePicker(false);
                          }} 
                          color={colors.primary}
                        />
                      </View>
                    </>
                  ) : (
                    <>
                      <DateTimePicker
                        value={selectedDate}
                        mode="date"
                        display="default"
                        onChange={(event, date) => {
                          if (date) handleDateChange(date);
                        }}
                      />
                      <View style={styles.datePickerActions}>
                        <Button 
                          title="Cancel" 
                          onPress={() => setShowDatePicker(false)} 
                          color="#64748B"
                        />
                        <Button 
                          title="Select Today" 
                          onPress={() => {
                            setSelectedDate(new Date());
                            setShowDatePicker(false);
                          }} 
                          color={colors.primary}
                        />
                      </View>
                    </>
                  )}
                </View>
              )}
            </View>
          )}
          
          {filterType === 'month' && (
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Select Month</Text>
              <TouchableOpacity 
                style={styles.datePickerButton}
                onPress={() => setMonthPickerVisible(!monthPickerVisible)}
              >
                <Calendar size={16} color={colors.primary} />
                <Text style={styles.datePickerButtonText}>
                  {monthOptions.find(m => m.value === selectedMonth)?.label || 'Select month'}
                </Text>
                <ChevronDown size={16} color="#64748B" />
              </TouchableOpacity>
              
              {monthPickerVisible && (
                <View style={styles.monthPickerContainer}>
                  <ScrollView style={styles.monthPickerScroll}>
                    {monthOptions.map((month) => (
                      <TouchableOpacity
                        key={month.value}
                        style={[styles.monthOption, selectedMonth === month.value && styles.activeMonthOption]}
                        onPress={() => handleMonthSelect(month.value)}
                      >
                        <Text style={[styles.monthOptionText, selectedMonth === month.value && styles.activeMonthOptionText]}>
                          {month.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>
          )}
          
          <View style={styles.modalActions}>
            <TouchableOpacity 
              style={styles.resetButton}
              onPress={handleResetFilter}
            >
              <X size={16} color="#64748B" />
              <Text style={styles.resetButtonText}>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.applyButton}
              onPress={() => setFilterModalVisible(false)}
            >
              <Text style={styles.applyButtonText}>Apply Filter</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Analytics" showBack={true} />

      <View style={styles.filterBar}>
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setFilterModalVisible(true)}
        >
          <Filter size={16} color={colors.primary} />
          <Text style={styles.filterButtonText}>
            {filterType === 'all' && 'All Time'}
            {filterType === 'date' && format(selectedDate, 'MMM d, yyyy')}
            {filterType === 'month' && monthOptions.find(m => m.value === selectedMonth)?.label}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={handleRefresh}
        >
          <RefreshCw size={16} color={colors.primary} />
        </TouchableOpacity>
      </View>
      
      {renderFilterModal()}

      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'overview' && styles.activeTabButton,
          ]}
          onPress={() => setActiveTab('overview')}
        >
          <Text
            style={[
              styles.tabButtonText,
              activeTab === 'overview' && styles.activeTabButtonText,
            ]}
          >
            Overview
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'sales' && styles.activeTabButton,
          ]}
          onPress={() => setActiveTab('sales')}
        >
          <Text
            style={[
              styles.tabButtonText,
              activeTab === 'sales' && styles.activeTabButtonText,
            ]}
          >
            Sales
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'products' && styles.activeTabButton,
          ]}
          onPress={() => setActiveTab('products')}
        >
          <Text
            style={[
              styles.tabButtonText,
              activeTab === 'products' && styles.activeTabButtonText,
            ]}
          >
            Products
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'customers' && styles.activeTabButton,
          ]}
          onPress={() => setActiveTab('customers')}
        >
          <Text
            style={[
              styles.tabButtonText,
              activeTab === 'customers' && styles.activeTabButtonText,
            ]}
          >
            Customers
          </Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loaderText}>Loading analytics data...</Text>
        </View>
      ) : error ? (
        <View style={styles.tabContent}>
          <View style={styles.errorContainer}>
            <AlertCircle size={24} color="#EF4444" />
            <Text style={styles.errorText}>
              {error instanceof Error
                ? error.message
                : 'Failed to load analytics data. Please try again.'}
            </Text>
          </View>
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 12,
              backgroundColor: colors.primary,
              borderRadius: 8,
              marginBottom: 16,
            }}
            onPress={handleRefresh}
          >
            <RefreshCw size={16} color="#FFFFFF" />
            <Text
              style={{ color: '#FFFFFF', marginLeft: 8, fontWeight: '500' }}
            >
              Retry
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
          {renderActiveTab()}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const AnalyticsCard = ({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
}) => (
  <View style={styles.card}>
    <View style={styles.cardHeader}>
      <Text style={styles.cardTitle}>{title}</Text>
      {icon}
    </View>
    <Text style={styles.cardValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  filterBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.card,
    marginBottom: 16,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    flex: 1,
    marginRight: 12,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginLeft: 8,
  },
  refreshButton: {
    backgroundColor: colors.background,
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  filterSection: {
    marginBottom: 16,
  },
  filterSectionTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textLight,
    marginBottom: 8,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.card,
    marginRight: 8,
    marginBottom: 8,
  },
  activeFilterOption: {
    backgroundColor: colors.primary,
  },
  filterOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  activeFilterOptionText: {
    color: colors.white,
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    justifyContent: 'space-between',
  },
  datePickerButtonText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginLeft: 8,
  },
  datePickerContainer: {
    backgroundColor: colors.card,
    borderRadius: 8,
    marginTop: 8,
    padding: 12,
    ...(Platform.OS === 'ios' && {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 16,
    }),
  },
  datePickerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  monthPickerContainer: {
    backgroundColor: colors.card,
    borderRadius: 8,
    marginTop: 8,
    maxHeight: 200,
  },
  monthPickerScroll: {
    padding: 8,
  },
  monthOption: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 4,
  },
  activeMonthOption: {
    backgroundColor: colors.primaryLight,
  },
  monthOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  activeMonthOptionText: {
    color: colors.primary,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: colors.card,
  },
  resetButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginLeft: 8,
  },
  applyButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: colors.primary,
  },
  applyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  tabButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    marginRight: 8,
  },
  activeTabButton: {
    backgroundColor: colors.primaryLight,
  },
  tabButtonText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: '#64748B',
  },
  activeTabButtonText: {
    color: colors.primary,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  tabContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  cardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  card: {
    width: cardWidth,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: '#64748B',
  },
  cardValue: {
    fontFamily: fonts.bold,
    fontSize: 20,
    color: '#1E293B',
    marginBottom: 8,
  },
  sectionContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: '#1E293B',
    marginBottom: 12,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  listItemRank: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: colors.primary,
    width: 24,
  },
  listItemName: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: '#1E293B',
    flex: 1,
  },
  listItemValue: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: '#64748B',
  },
  chartPlaceholderSubtext: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  summaryLabel: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: '#64748B',
  },
  summaryValue: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: '#1E293B',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: '#64748B',
    marginTop: 12,
  },
  comingSoonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
  },
  comingSoonText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  errorContainer: {
    padding: 16,
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  errorText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: '#EF4444',
  },
  dailyOrderBar: {
    width: 20,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  dailyOrderBarFill: {
    width: 8,
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  dailyOrderDate: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 4,
  },
});

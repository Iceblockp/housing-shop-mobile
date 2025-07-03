import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

interface OrderStatusDistribution {
  status: string;
  count: number;
}

interface DailyOrderData {
  date: string;
  orders: number;
}

interface TopSellingProduct {
  id: string;
  name: string;
  imageUrl: string | null;
  price: number;
  totalSold: number;
}

interface CategoryDistribution {
  id: string;
  name: string;
  productCount: number;
}

interface OrdersAnalytics {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  statusDistribution: OrderStatusDistribution[];
  dailyOrders: DailyOrderData[];
}

interface ProductsAnalytics {
  totalProducts: number;
  outOfStockProducts: number;
  topSellingProducts: TopSellingProduct[];
  categoryDistribution: CategoryDistribution[];
}

export interface AdminAnalytics {
  orders: OrdersAnalytics;
  products: ProductsAnalytics;
}

export interface AnalyticsFilter {
  filterType: 'all' | 'date' | 'month';
  filterValue?: string; // YYYY-MM-DD for date, YYYY-MM for month
}

// Add analytics endpoint to the API
export const adminApi = {
  getAnalytics: async (filter?: AnalyticsFilter): Promise<AdminAnalytics> => {
    const params: Record<string, string> = {};
    
    if (filter) {
      params.filterType = filter.filterType;
      if (filter.filterValue) {
        params.filterValue = filter.filterValue;
      }
    }
    
    const response = await api.get('/admin/analytics', { params });
    return response.data;
  },
};

export const useAdminAnalytics = (filter?: AnalyticsFilter) => {
  return useQuery<AdminAnalytics>({
    queryKey: ['admin-analytics', filter?.filterType, filter?.filterValue],
    queryFn: () => adminApi.getAnalytics(filter),
  });
};

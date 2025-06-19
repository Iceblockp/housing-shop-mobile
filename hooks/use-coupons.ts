import { couponApi } from '@/lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Define the Coupon type based on your Prisma model
interface Coupon {
  id: string;
  code: string;
  secretCode: string;
  amount: number;
  isUsed: boolean;
  userId: string | null;
  createdAt: string;
  updatedAt: string;
}

interface CouponsQueryParams {
  isUsed?: boolean;
  page?: number;
  limit?: number;
}

// Fetch user coupons with optional filtering and pagination
export const useUserCoupons = (params: CouponsQueryParams = {}) => {
  type ResponseType = {
    coupons: Coupon[];
    pagination: {
      totalCount: number;
      totalPages: number;
      currentPage: number;
      pageSize: number;
    };
  };

  return useQuery<ResponseType>({
    queryKey: ['coupons', 'user', params],
    queryFn: async () => {
      const response = await couponApi.getUserCoupons(params);
      return response;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });
};

// Add a new function to combine multiple coupons
export const useCombineCoupons = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (couponIds: string[]) => {
      // Add the combineCoupons function to the couponApi in api.ts if not already there
      const response = await fetch('/api/coupons/combine', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // The Authorization header will be added by the axios interceptor
        },
        body: JSON.stringify({ couponIds }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to combine coupons');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Invalidate the coupons query to refetch the updated list
      queryClient.invalidateQueries({ queryKey: ['coupons', 'user'] });
    },
  });
};
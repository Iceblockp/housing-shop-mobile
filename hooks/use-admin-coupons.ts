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
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

interface AdminCouponsQueryParams {
  isUsed?: boolean;
  userId?: string;
  q?: string;
  page?: number;
  limit?: number;
}

// Fetch all coupons with optional filtering and pagination (admin only)
export const useAdminCoupons = (params: AdminCouponsQueryParams = {}) => {
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
    queryKey: ['coupons', 'admin', params],
    queryFn: async () => {
      const response = await couponApi.getAllCoupons(params);
      return response;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });
};

// Create a new coupon (admin only)
export const useCreateCoupon = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      code: string;
      secretCode: string;
      amount: number;
      isUsed?: boolean;
      userId?: string;
    }) => {
      return await couponApi.createCoupon(data);
    },
    onSuccess: () => {
      // Invalidate the coupons query to refetch the updated list
      queryClient.invalidateQueries({ queryKey: ['coupons', 'admin'] });
    },
  });
};

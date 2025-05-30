import api, { orderApi } from '@/lib/api';
import { Order } from '@/types';
import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from '@tanstack/react-query';

interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  product: {
    id: string;
    name: string;
    imageUrl: string | null;
  };
}

interface OrderUser {
  name: string;
  email: string;
  phone: string | null;
  roomNumber: string | null;
  floor: number | null;
}

// interface Order {
//   id: string;
//   userId: string;
//   status:
//     | 'PENDING'
//     | 'CONFIRMED'
//     | 'PROCESSING'
//     | 'DELIVERING'
//     | 'COMPLETED'
//     | 'CANCELLED';
//   total: number;
//   notes: string | null;
//   confirmDeadline: string | null;
//   deliveryDeadline: string | null;
//   // processingMinutes: number | null;
//   createdAt: string;
//   updatedAt: string;
//   items: OrderItem[];
//   user: OrderUser;
// }

interface CreateOrderItem {
  productId: string;
  quantity: number;
}

interface CreateOrderData {
  items: CreateOrderItem[];
  notes?: string;
  confirmationDeadlineMinutes?: number;
  processingMinutes?: number;
}

interface UpdateOrderData {
  status?:
    | 'PENDING'
    | 'CONFIRMED'
    | 'PROCESSING'
    | 'DELIVERING'
    | 'COMPLETED'
    | 'CANCELLED';
  deliveryDeadlineMinutes?: number;
}

interface OrderParams {
  status?: string;
  limit?: number;
  page?: number;
}
// Fetch orders with optional status filter
export const useOrders = (params: OrderParams) => {
  const queryParams = new URLSearchParams();

  if (params?.status) {
    queryParams.append('status', params.status);
  }
  if (params?.limit) {
    queryParams.append('limit', params.limit.toString());
  }

  const queryString = queryParams.toString();
  const url = `/orders${queryString ? `?${queryString}` : ''}`;

  type ResponseType = {
    orders: Order[];
    pagination: {
      totalOrders: number;
      totalPages: number;
      currentPage: number;
    };
  };

  return useInfiniteQuery<ResponseType>({
    queryKey: ['orders', params],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await orderApi.getAll({
        status: params.status,
        page: pageParam as number,
      });

      return response;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const currentPage = lastPage.pagination.currentPage;
      const totalPages = lastPage.pagination.totalPages;

      // If there are more pages, return the next page number
      if (currentPage < totalPages) {
        return currentPage + 1;
      }
      return undefined; // No more pages
    },
  });

  // return useQuery<Order[]>({
  //   queryKey: ["orders", { status }],
  //   queryFn: async () => {
  //     const response = await fetch(url);
  //     if (!response.ok) {
  //       throw new Error("Failed to fetch orders");
  //     }
  //     return response.json();
  //   },
  // });
};

// Fetch a single order by ID
export const useOrder = (id: string) => {
  return useQuery<Order>({
    queryKey: ['order', id],
    queryFn: async () => {
      const response = await api.get(`/orders/${id}`).then((res) => res.data);

      return response;
    },
    enabled: !!id,
  });
};

// Create a new order
export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateOrderData) => {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to create order');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};

// Update order status
export const useUpdateOrder = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateOrderData) => {
      const response = await fetch(`/api/orders/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to update order');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', id] });
    },
  });
};

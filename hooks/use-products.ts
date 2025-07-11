import api, { productApi } from '@/lib/api';
import { Product } from '@/types';
import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from '@tanstack/react-query';

// interface Product {
//   id: string;
//   name: string;
//   description: string | null;
//   price: number;
//   imageUrl: string | null;
//   inStock: boolean;
//   categoryId: string;
//   createdAt: string;
//   updatedAt: string;
//   category: {
//     id: string;
//     name: string;
//   };
// }

interface ProductsQueryParams {
  categoryId?: string;
  q?: string;
  limit?: number;
  page?: number;
}

// Fetch all products with optional filtering
export const useProducts = (params: ProductsQueryParams = {}) => {
  const queryParams = new URLSearchParams();

  if (params.categoryId) {
    queryParams.append('categoryId', params.categoryId);
  }

  if (params.q) {
    queryParams.append('q', params.q);
  }
  if (params.limit) {
    queryParams.append('limit', params.limit.toString());
  }

  const queryString = queryParams.toString();
  const url = `/products${queryString ? `?${queryString}` : ''}`;

  type ResponseType = {
    products: Product[];
    pagination: {
      totalProducts: number;
      totalPages: number;
      currentPage: number;
    };
  };

  return useInfiniteQuery<ResponseType>({
    queryKey: ['products', params],
    queryFn: async ({ pageParam = 1 }) => {
      const pageUrl = `${url}${queryString ? '&' : '?'}page=${pageParam}`;
      const response = await productApi.getAll({
        categoryId: params.categoryId,
        q: params.q,
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
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });

  // return useQuery<Product[]>({
  //   queryKey: ["products", params],
  //   queryFn: async () => {
  //     const response = await fetch(url);
  //     if (!response.ok) {
  //       throw new Error("Failed to fetch products");
  //     }
  //     return response.json();
  //   },
  //   staleTime: 1000 * 60 * 5, // 5 minutes
  //   gcTime: 1000 * 60 * 30, // 30 minutes
  // });
};

// Fetch a single product by ID
export const useProduct = (id: string) => {
  return useQuery<Product>({
    queryKey: ['product', id],
    queryFn: async () => {
      const response = await productApi.getById(id);

      return response;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });
};

// Fetch best-selling products
export const useBestSellingProducts = () => {
  type ResponseType = {
    products: (Product & { orderCount: number })[];
    count: number;
  };

  return useQuery<ResponseType>({
    queryKey: ['products', 'best-selling'],
    queryFn: async () => {
      const response = await productApi.getBestSelling();
      return response;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });
};

// Fetch featured products
export const useFeaturedProducts = () => {
  type ResponseType = {
    products: Product[];
    count: number;
  };

  return useQuery<ResponseType>({
    queryKey: ['products', 'featured'],
    queryFn: async () => {
      const response = await productApi.getFeatured();
      return response;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });
};

// Fetch new products
export const useNewProducts = () => {
  type ResponseType = {
    products: Product[];
    count: number;
  };

  return useQuery<ResponseType>({
    queryKey: ['products', 'new'],
    queryFn: async () => {
      const response = await productApi.getNew();
      return response;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });
};

// Create a new product (admin only)
export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      name: string;
      description?: string;
      price: number;
      categoryId: string;
      imageUrl?: string;
      inStock?: boolean;
    }) => {
      const response = await productApi.create(data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

// Update an existing product (admin only)
export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: {
        name: string;
        description?: string;
        price: number;
        categoryId: string;
        imageUrl?: string;
        inStock?: boolean;
      };
    }) => {
      const response = await productApi.update(id, data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

// Delete a product (admin only)
export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await productApi.delete(id);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

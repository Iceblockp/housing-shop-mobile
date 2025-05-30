import api, { requestApi } from '@/lib/api';
import { Request } from '@/types/request';
import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from '@tanstack/react-query';

interface RequestUser {
  name: string;
  email: string;
}

// interface Request {
//   id: string;
//   userId: string;
//   title: string;
//   description: string;
//   adminReply: string | null;
//   createdAt: string;
//   updatedAt: string;
//   user: RequestUser;
// }

interface CreateRequestData {
  title: string;
  description: string;
}

interface UpdateRequestData {
  title?: string;
  description?: string;
  adminReply?: string;
}

interface RequestParams {
  limit?: number;
  page?: number;
}

// Fetch requests with optional pagination
export const useRequests = (params: RequestParams) => {
  const queryParams = new URLSearchParams();

  if (params?.limit) {
    queryParams.append('limit', params.limit.toString());
  }

  const queryString = queryParams.toString();
  // const url = `/api/requests${queryString ? `?${queryString}` : ""}`;

  type ResponseType = {
    requests: Request[];
    pagination: {
      totalRequests: number;
      totalPages: number;
      currentPage: number;
    };
  };

  return useInfiniteQuery<ResponseType>({
    queryKey: ['requests', params],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await requestApi.getAll({
        page: pageParam as number,
        limit: params.limit,
      });

      return response;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const currentPage = lastPage.pagination.currentPage;
      const totalPages = lastPage.pagination.totalPages;

      if (currentPage < totalPages) {
        return currentPage + 1;
      }
      return undefined; // No more pages
    },
  });
};

// Fetch a single request by ID
export const useRequest = (id: string) => {
  return useQuery<Request>({
    queryKey: ['request', id],
    queryFn: async () => {
      const response = await requestApi.getById(id);

      return response;
    },
    enabled: !!id,
  });
};

// Create a new request
export const useCreateRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateRequestData) => {
      const response = await requestApi.create({
        title: data.title,
        description: data.description,
      });

      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requests'] });
    },
  });
};

// Update a request
export const useUpdateRequest = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateRequestData) => {
      const response = await requestApi.update(id, {
        adminReply: data.adminReply,
      });

      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requests'] });
      queryClient.invalidateQueries({ queryKey: ['request', id] });
    },
  });
};

// Delete a request
export const useDeleteRequest = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await requestApi.delete(id);

      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requests'] });
    },
  });
};

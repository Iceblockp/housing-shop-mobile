import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from '@tanstack/react-query';
import { notificationApi } from '@/lib/api';
import { Notification } from '@/types';

export function useNotifications(options?: {
  unreadOnly?: boolean;
  limit?: number;
}) {
  const queryClient = useQueryClient();

  // const {
  //   data: notifications,
  //   isLoading,
  //   error,
  //   refetch,
  // } = useQuery<Notification[]>({
  //   queryKey: ['notifications', options?.unreadOnly, options?.limit],
  //   queryFn: () =>
  //     notificationApi.getAll({
  //       unreadOnly: options?.unreadOnly,
  //       limit: options?.limit,
  //     }),
  // });

  type ResponseType = {
    notifications: Notification[];
    pagination: {
      totalNotifications: number;
      totalPages: number;
      currentPage: number;
    };
  };

  const {
    data: rawNotifications,
    isLoading,
    error,
    refetch,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery<ResponseType>({
    queryKey: ['notifications', options],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await notificationApi.getAll({
        unreadOnly: options?.unreadOnly,
        limit: options?.limit,
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

  const notifications =
    rawNotifications?.pages.flatMap((n) => n.notifications) || [];

  const unreadCount = notifications?.filter((n) => !n.isRead).length || 0;

  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => notificationApi.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () => notificationApi.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  return {
    notifications,
    isLoading,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    unreadCount,
    markAsRead: markAsReadMutation.mutate,
    markAllAsRead: markAllAsReadMutation.mutate,
    isMarkingAsRead: markAsReadMutation.isPending,
    isMarkingAllAsRead: markAllAsReadMutation.isPending,
  };
}

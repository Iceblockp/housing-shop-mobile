import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationApi } from '@/lib/api';
import { Notification } from '@/types';

export function useNotifications(options?: { unreadOnly?: boolean; limit?: number }) {
  const queryClient = useQueryClient();
  
  const { data: notifications, isLoading, error, refetch } = useQuery<Notification[]>({
    queryKey: ['notifications', options?.unreadOnly, options?.limit],
    queryFn: () => notificationApi.getAll({
      unreadOnly: options?.unreadOnly,
      limit: options?.limit
    }),
  });

  const unreadCount = notifications?.filter(n => !n.isRead).length || 0;

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
    unreadCount,
    markAsRead: markAsReadMutation.mutate,
    markAllAsRead: markAllAsReadMutation.mutate,
    isMarkingAsRead: markAsReadMutation.isPending,
    isMarkingAllAsRead: markAllAsReadMutation.isPending,
  };
}
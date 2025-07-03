import { eventApi } from '@/lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Define the Event type based on your Prisma model
export interface Event {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Fetch active events
export const useActiveEvents = (limit?: number) => {
  type ResponseType = {
    events: Event[];
    count: number;
  };

  return useQuery<ResponseType>({
    queryKey: ['events', 'active', limit],
    queryFn: async () => {
      const response = await eventApi.getActive(limit);
      return response;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });
};

// Fetch all events (for admin)
export const useEvents = () => {
  type ResponseType = {
    events: Event[];
    count: number;
  };

  return useQuery<ResponseType>({
    queryKey: ['events'],
    queryFn: async () => {
      const response = await eventApi.getAll();
      return response;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });
};

// Create a new event (admin only)
export const useCreateEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      title: string;
      description?: string;
      imageUrl?: string;
      isActive: boolean;
    }) => {
      return await eventApi.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
};

// Update an existing event (admin only)
export const useUpdateEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: {
        title?: string;
        description?: string;
        imageUrl?: string;
        isActive?: boolean;
      };
    }) => {
      return await eventApi.update(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
};

// Delete an event (admin only)
export const useDeleteEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return await eventApi.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
};

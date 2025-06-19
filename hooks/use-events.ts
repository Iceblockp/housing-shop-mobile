import { eventApi } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';

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

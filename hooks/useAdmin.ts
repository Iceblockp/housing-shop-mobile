import api from '@/lib/api';
import { useQuery } from '@tanstack/react-query';

type Admin = {
  name: string;
  email: string;
  phone: string;
};

export const useGetAdmin = () => {
  return useQuery<Admin>({
    queryKey: ['admin'],
    queryFn: async () => {
      return await api.get('/admin/contact').then((res) => res.data);
    },
    staleTime: 1000 * 60 * 60 * 24,
    refetchOnWindowFocus: false,
  });
};

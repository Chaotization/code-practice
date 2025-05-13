import { useQuery } from '@tanstack/react-query';
import Products from '../data/products';

export const useCategories = () => {
  const categoriesQuery = useQuery({
    queryKey: ['categories'],
    queryFn: () => Products.getCategories(),
  });

  return {
    categories: categoriesQuery.data || [],
    isLoading: categoriesQuery.isLoading,
    isError: categoriesQuery.isError,
    error: categoriesQuery.error,
  };
};
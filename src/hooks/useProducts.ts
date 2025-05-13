import { useQuery } from '@tanstack/react-query';
import Products from '../data/products';

export const useProducts = () => {
  const productsQuery = useQuery({
    queryKey: ['products'],
    queryFn: () => Products.getProducts(),
  });

  return {
    products: productsQuery.data || [],
    isLoading: productsQuery.isLoading,
    isError: productsQuery.isError,
    error: productsQuery.error,
  };
};

export const useProduct = (id?: string) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => id ? Products.getProductById(id) : Promise.reject('No product ID'),
    enabled: !!id,
  });
};

export default useProducts;
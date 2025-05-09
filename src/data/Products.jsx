import React, { useState, useEffect, useCallback } from 'react';
import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { debounce } from 'lodash';

const API_URL = 'http://localhost:3000/api/v1';

const fetchProducts = async ({ offset = 0, limit = 20, searchQuery = '', categoryId = null }) => {
  let url = `${API_URL}/products?offset=${offset}&limit=${limit}`;
  
  if (searchQuery) {
    url += `&title=${encodeURIComponent(searchQuery)}`;
  }
  
  if (categoryId) {
    url += `&categoryId=${categoryId}`;
  }
  
  const { data } = await axios.get(url);
  return data;
};

const fetchCategories = async () => {
  const { data } = await axios.get(`${API_URL}/categories`);
  return data;
};

const fetchProfile = async () => {
  const { data } = await axios.get(`${API_URL}/auth/profile`);
  return data;
};

const fetchProductDetails = async (productId) => {
  const { data } = await axios.get(`${API_URL}/products/${productId}`);
  return data;
};

const fetchCart = async (userId) => {
  const { data } = await axios.get(`${API_URL}/carts?userId=${userId}`);
  return data;
};

const addToCart = async ({ userId, productId, quantity }) => {
  const { data } = await axios.post(`${API_URL}/carts/add`, {
    userId,
    products: [{ id: productId, quantity }]
  });
  return data;
};

const updateCart = async ({ cartId, productId, quantity }) => {
  const { data } = await axios.put(`${API_URL}/carts/${cartId}`, {
    products: [{ id: productId, quantity }]
  });
  return data;
};

const removeFromCart = async ({ cartId, productId }) => {
  const { data } = await axios.delete(`${API_URL}/carts/${cartId}`, {
    data: { productId }
  });
  return data;
};

// Main Product List Component
const ProductList = () => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [userId, setUserId] = useState('user123');
  
  // Get user profile on component mount
  useEffect(() => {
    queryClient.fetchQuery({
      queryKey: ['profile'],
      queryFn: fetchProfile,
    }).then(data => {
      if (data?.id) {
        setUserId(data.id);
      }
    });
  }, [queryClient]);

  const debouncedSetSearch = useCallback(
    debounce((value) => {
      setDebouncedSearch(value);
    }, 500),
    []
  );

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    debouncedSetSearch(value);
  };

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
    staleTime: 1000 * 60 * 60 * 24,
  });

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: fetchProfile,
  });

  const {
    data: paginatedProducts,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: productsLoading,
    isFetching
  } = useInfiniteQuery({
    queryKey: ['products', 'infinite', debouncedSearch, selectedCategory],
    queryFn: ({ pageParam = 0 }) => fetchProducts({
      offset: pageParam,
      limit: 20,
      searchQuery: debouncedSearch,
      categoryId: selectedCategory
    }),
    getNextPageParam: (lastPage) => {
      if (lastPage && Array.isArray(lastPage) && lastPage.length === 20) {
        return pageParam + 20;
      }
      return undefined;
    },
    initialPageParam: 0
  });

  // Cart query
  const { data: cart } = useQuery({
    queryKey: ['cart', userId],
    queryFn: () => fetchCart(userId),
    enabled: !!userId,
  });

  const addToCartMutation = useMutation({
    mutationFn: addToCart,
    onMutate: async (newItem) => {
      await queryClient.cancelQueries({ queryKey: ['cart', userId] });

      const previousCart = queryClient.getQueryData(['cart', userId]);
      
      queryClient.setQueryData(['cart', userId], old => {
        const updatedCart = { ...old };
        if (!updatedCart.products) {
          updatedCart.products = [];
        }
        
        const existingProduct = updatedCart.products.find(p => p.id === newItem.productId);
        if (existingProduct) {
          existingProduct.quantity += newItem.quantity;
        } else {
          updatedCart.products.push({
            id: newItem.productId,
            quantity: newItem.quantity
          });
        }
        
        return updatedCart;
      });
      
      return { previousCart };
    },
    onError: (err, newItem, context) => {
      queryClient.setQueryData(['cart', userId], context.previousCart);
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['cart', userId] });
    },
  });

  const updateCartMutation = useMutation({
    mutationFn: updateCart,
    onMutate: async (updatedItem) => {
      await queryClient.cancelQueries({ queryKey: ['cart', userId] });
      const previousCart = queryClient.getQueryData(['cart', userId]);
      
      queryClient.setQueryData(['cart', userId], old => {
        const updatedCart = { ...old };
        const productIndex = updatedCart.products.findIndex(p => p.id === updatedItem.productId);
        
        if (productIndex !== -1) {
          updatedCart.products[productIndex].quantity = updatedItem.quantity;
        }
        
        return updatedCart;
      });
      
      return { previousCart };
    },
    onError: (err, updatedItem, context) => {
      queryClient.setQueryData(['cart', userId], context.previousCart);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['cart', userId] });
    },
  });

  const removeFromCartMutation = useMutation({
    mutationFn: removeFromCart,
    onMutate: async (removedItem) => {
      await queryClient.cancelQueries({ queryKey: ['cart', userId] });
      const previousCart = queryClient.getQueryData(['cart', userId]);
      
      queryClient.setQueryData(['cart', userId], old => {
        const updatedCart = { ...old };
        updatedCart.products = updatedCart.products.filter(p => p.id !== removedItem.productId);
        return updatedCart;
      });
      
      return { previousCart };
    },
    onError: (err, removedItem, context) => {
      queryClient.setQueryData(['cart', userId], context.previousCart);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['cart', userId] });
    },
  });

  const prefetchProductDetails = (productId) => {
    queryClient.prefetchQuery({
      queryKey: ['product', productId],
      queryFn: () => fetchProductDetails(productId),
      staleTime: 1000 * 60 * 5, // 5 minutes
    });
  };

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId === selectedCategory ? null : categoryId);
  };

  const handleAddToCart = (productId) => {
    addToCartMutation.mutate({
      userId,
      productId,
      quantity: 1
    });
  };

  return (
    <div className="product-list-page">
      {isFetching && !isFetchingNextPage && (
        <div className="global-loader">Loading...</div>
      )}
      
      <div className="user-profile">
        <h2>👤 Profile</h2>
        {profile ? (
          <div>
            <p>Welcome, {profile.name}</p>
            <p>Email: {profile.email}</p>
          </div>
        ) : (
          <p>Loading profile...</p>
        )}
      </div>

      <div className="search-and-filter">
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Search products..."
          className="search-input"
        />
        
        <div className="category-filter">
          <h3>Categories</h3>
          {categories ? (
            <ul>
              {categories.map(cat => (
                <li 
                  key={cat.id}
                  className={selectedCategory === cat.id ? 'selected' : ''}
                  onClick={() => handleCategoryChange(cat.id)}
                >
                  {cat.name}
                </li>
              ))}
            </ul>
          ) : (
            <p>Loading categories...</p>
          )}
        </div>
      </div>

      <h1>🛒 Product List</h1>

      <div className="products-container">
        {productsLoading ? (
          <p>Loading products...</p>
        ) : (
          <>
            <div className="product-grid">
              {paginatedProducts?.pages.flatMap((page, pageIndex) => {
                const products = Array.isArray(page) ? page : 
                                 (Array.isArray(page?.data) ? page.data : []);
                
                return products.map(prod => (
                  <div 
                    key={`${pageIndex}-${prod.id}`} 
                    className="product-card"
                    onMouseEnter={() => prefetchProductDetails(prod.id)}
                  >
                    <h3>{prod.title}</h3>
                    <p>${prod.price}</p>
                    <button onClick={() => handleAddToCart(prod.id)}>
                      Add to Cart
                    </button>
                  </div>
                ));
              })}
            </div>
            
            <div className="load-more">
              <button 
                onClick={() => fetchNextPage()} 
                disabled={isFetchingNextPage || !hasNextPage}
              >
                {isFetchingNextPage 
                  ? 'Loading more...' 
                  : hasNextPage 
                    ? 'Load More' 
                    : 'No more products'}
              </button>
            </div>
          </>
        )}
      </div>

      <div className="cart-section">
        <h2>🛒 Cart</h2>
        {cart?.products?.length > 0 ? (
          <>
            <ul>
              {cart.products.map(item => (
                <li key={item.id} className="cart-item">
                  <span>{item.title}</span>
                  <span>Qty: {item.quantity}</span>
                  <div className="cart-actions">
                    <button 
                      onClick={() => updateCartMutation.mutate({
                        cartId: cart.id,
                        productId: item.id,
                        quantity: item.quantity + 1
                      })}
                    >
                      +
                    </button>
                    <button 
                      onClick={() => {
                        if (item.quantity > 1) {
                          updateCartMutation.mutate({
                            cartId: cart.id,
                            productId: item.id,
                            quantity: item.quantity - 1
                          });
                        } else {
                          removeFromCartMutation.mutate({
                            cartId: cart.id,
                            productId: item.id
                          });
                        }
                      }}
                    >
                      -
                    </button>
                    <button 
                      onClick={() => removeFromCartMutation.mutate({
                        cartId: cart.id,
                        productId: item.id
                      })}
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            <div className="cart-total">
              Total: ${cart.products.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}
            </div>
          </>
        ) : (
          <p>Your cart is empty</p>
        )}
      </div>
    </div>
  );
};

export default ProductList;
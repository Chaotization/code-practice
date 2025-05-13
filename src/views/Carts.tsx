// src/pages/CartPage/CartPage.tsx
import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Products from '../data/products';

const CartPage: React.FC = () => {
  const token = localStorage.getItem('token')!;
  const qc = useQueryClient();
  const userId = qc.getQueryData<any>(['auth'])?.user?.id;

  const { data: cart, isLoading, isError } = useQuery({
    queryKey: ['cart', userId],
    queryFn: () => Products.getCart(userId!, token),
     enabled: !!userId 
  });

  const updateMutation = useMutation(
    ({ cartId, items }: { cartId: number; items: any[] }) =>
      Products.updateCart(cartId, items, token),
    {
      onMutate: async ({ cartId, items }) => {
        await qc.cancelQueries(['cart', userId]);
        const previous = qc.getQueryData(['cart', userId]);
        qc.setQueryData(['cart', userId], (old: any) => ({
          ...old,
          products: items
        }));
        return { previous };
      },
      onError: (_err, _vars, context: any) => {
        qc.setQueryData(['cart', userId], context.previous);
      },
      onSettled: () => {
        qc.invalidateQueries(['cart', userId]);
      }
    }
  );

  if (isLoading) return <p>Loading cart…</p>;
  if (isError) return <p>Error loading cart.</p>;

  const handleQuantityChange = (cartId: number, items: any[]) => {
    updateMutation.mutate({ cartId, items });
  };

  return (
    <div className="cart-page">
      <h1>Your Cart</h1>
      {cart.products.length === 0
        ? <p>Your cart is empty.</p>
        : (
          <ul>
            {cart.products.map(item => (
              <li key={item.id}>
                <span>{item.product.title}</span>
                <input
                  type="number"
                  min={1}
                  value={item.quantity}
                  onChange={e =>
                    handleQuantityChange(cart.id, 
                      cart.products.map(p =>
                        p.id === item.id 
                          ? { ...p, quantity: +e.target.value }
                          : p
                      )
                    )
                  }
                />
              </li>
            ))}
          </ul>
        )
      }
    </div>
  );
};

export default CartPage;

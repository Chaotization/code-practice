import React, { useEffect, useState } from 'react';
import {useInfiniteQuery} from '@tanstack/react-query';
import Apis, { type Product } from '../../APIs/productAPIs';
import { Link } from 'react-router-dom';
import './ProductList.scss';

const LIMIT = 20;

const ProductList: React.FC = () => {
    const [input, setInput] = useState('');
    const [searchResults, setSearchResults] = useState<Product[] | null>(null);
    const {
        data,
        isLoading,
        isError,
        error,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useInfiniteQuery({
        queryKey: ['products'],
        queryFn: ({ pageParam = 0 }) => Apis.getProducts(pageParam, LIMIT),
        getNextPageParam: (lastPage, allPages) => {
            return lastPage.length < LIMIT ? undefined : allPages.length * LIMIT;
        },
        initialPageParam: 0,
    });

    const pagedProducts = data?.pages.flat() || [];

    useEffect(() => {
        const active = searchResults ?? pagedProducts;
        if (active.length) console.log('Products changed:', active);
    }, [searchResults, pagedProducts]);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;
        try {
        const results = await Apis.searchProducts(input);
        setSearchResults(results);
        } catch (error: any) {
        console.error('Error searching products:', error);
        } finally {
        setInput('');
        }
    };
    const productsToShow = searchResults ?? pagedProducts;

    if (isLoading && searchResults === null) {
        return <p>Loading...</p>
    }

    if (isError && searchResults === null){
        return <div className="alert">{error?.message}</div>;
    }

    if (!productsToShow.length) {
        return <div className="empty">No products found</div>;
    }

  return (
    <div className="product-list-container">
      <form className="search-bar" onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Search products..."
          className="search-input"
          value={input}
          onChange={e => setInput(e.target.value)}
        />
        <button type="submit" className="search-btn">
          Search
        </button>
      </form>

      <div className="product-grid">
        {productsToShow.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {searchResults === null && hasNextPage && (
        <div className="load-more-container">
          <button
            className="load-more-btn"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage ? 'Loading more...' : 'Load More'}
          </button>
        </div>
      )}

      {isFetchingNextPage && <div className="spinner" />}
    </div>
    );
};

type ProductCardProps = { product: Product };
const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
    const [selected, setSelected] = useState(0);
    const thumbs = product.images ?? [];
    const main = thumbs[selected] ?? '';

    return (
        <div className="product-card">
            {main ? (
                <img
                    src={main}
                    alt={product.title}
                    className="product-main-image"
                />
            ) : (
                <div className="image-placeholder" />
            )}

            {thumbs.length > 1 && (
                <div className="thumbnail-scroll">
                    {thumbs.map((src, i) => (
                        <img
                            key={i}
                            src={src}
                            alt={`${product.title} thumb ${i + 1}`}
                            className={`thumbnail-image${i === selected ? ' active' : ''}`}
                            onClick={() => setSelected(i)}
                        />
                    ))}
                </div>
            )}

            <div className="product-info">
                <h3 className="product-title">
                    <Link to={`/products/${product.id}`} className="product-link">
                        {product.title}
                    </Link>
                </h3>
                <p className="product-price">${product.price.toFixed(2)}</p>
            </div>

            <div className="product-actions">
                <button
                    className="add-to-cart-btn"
                    onClick={() => console.log('Add to cart', product.id)}
                >
                    Add to Cart
                </button>
            </div>
        </div>
    );
};

export default ProductList;

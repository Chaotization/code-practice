import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useCategories } from '../hooks/useCategories';
import { useProducts } from '../hooks/useProducts';
import './ProductListPage.css';

const ProductListPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [priceRange, setPriceRange] = useState('');

  const {
    categories,
    isLoading: categoriesLoading,
    isError: categoriesError,
    error: categoriesErrorMessage,
  } = useCategories();

  const {
    products = [],
    isLoading: productsLoading,
    isError: productsError,
    error: productsErrorMessage,
  } = useProducts();

  const filterByPrice = (productPrice: number): boolean => {
    switch (priceRange) {
      case '0-50': return productPrice <= 50;
      case '50-100': return productPrice > 50 && productPrice <= 100;
      case '100-200': return productPrice > 100 && productPrice <= 200;
      case '200+': return productPrice > 200;
      default: return true;
    }
  };

  const filteredProducts = useMemo(() => {
    return products
      .filter(p => filterByPrice(p.price))
      .filter(p =>
        selectedCategory
          ? p.category.name.toLowerCase() === selectedCategory.toLowerCase()
          : true
      );
  }, [products, priceRange, selectedCategory]);

  const uniqueCategories = useMemo(() => {
    return Array.from(new Set(products.map(p => p.category.name)));
  }, [products]);

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) =>
    setSelectedCategory(e.target.value);

  const handlePriceRangeChange = (e: React.ChangeEvent<HTMLSelectElement>) =>
    setPriceRange(e.target.value);

  const renderFilters = () => (
    <div className="filters-section">
      <h3>Filter Products</h3>
      <div className="filter-controls">
        <div className="filter-group">
          <label>Category:</label>
          <select value={selectedCategory} onChange={handleCategoryChange}>
            <option value="">All Categories</option>
            {uniqueCategories.map((cat, i) => (
              <option key={i} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label>Price Range:</label>
          <select value={priceRange} onChange={handlePriceRangeChange}>
            <option value="">Any Price</option>
            <option value="0-50">$0 - $50</option>
            <option value="50-100">$50 - $100</option>
            <option value="100-200">$100 - $200</option>
            <option value="200+">$200+</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderProducts = () => {
    if (filteredProducts.length === 0) {
      return (
        <div className="no-products">
          <p>No products found matching your criteria.</p>
        </div>
      );
    }

    return (
      <div className="products-grid">
        {filteredProducts.map(product => (
          <div key={product.id} className="product-card">
            <img
              src={product.images[0] ?? "https://via.placeholder.com/200"}
              alt={product.title}
            />
            <div className="product-card-content">
              <h3>{product.title}</h3>
              <div className="price">${product.price}</div>
              <div className="category">{product.category.name}</div>
              <div className="product-card-actions">
                <Link to={`/products/${product.id}`} className="view-btn">
                  View Details
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (productsLoading || categoriesLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner" />
        <p>Loading products...</p>
      </div>
    );
  }

  if (productsError || categoriesError) {
    const message =
      (productsErrorMessage as Error)?.message ||
      (categoriesErrorMessage as Error)?.message ||
      'Failed to load data. Please try again later.';

    return (
      <div className="error-container">
        <h2>Error loading products</h2>
        <p>{message}</p>
      </div>
    );
  }

  return (
    <div className="products-page">
      <h1>All Products</h1>
      {renderFilters()}
      {renderProducts()}
    </div>
  );
};

export default ProductListPage;

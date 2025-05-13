import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Products from '../data/products';
import './ProductDetailPage.css';

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const {
    data: product,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['product', id],
    queryFn: () => id ? Products.getProductById(id) : Promise.reject('No product ID'),
    enabled: !!id,
  });

  const handleThumbnailClick = (index: number) => {
    setSelectedImageIndex(index);
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner" />
        <p>Loading product...</p>
      </div>
    );
  }

  if (error || !product) {
    const errorMessage = error instanceof Error ? error.message : 'Product not found';
    return (
      <div className="error-container">
        <h2>Error loading product</h2>
        <p>{errorMessage}</p>
      </div>
    );
  }

  const { title, price, description, category, images = [] } = product;
  const mainImage = images[selectedImageIndex] || "https://via.placeholder.com/400";

  return (
    <div className="product-detail-page">
      <div className="product-container">
        <div className="product-image-section">
          <div className="main-image-container">
            <img
              src={mainImage}
              alt={title}
              className="main-product-image"
            />
          </div>

          {images.length > 1 && (
            <div className="product-thumbnails">
              {images.map((img, idx) => (
                <div
                  key={idx}
                  className={`thumbnail-container ${idx === selectedImageIndex ? 'active' : ''}`}
                  onClick={() => handleThumbnailClick(idx)}
                >
                  <img
                    src={img || "https://via.placeholder.com/100"}
                    alt={`${title} - view ${idx + 1}`}
                    className="thumbnail-image"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="product-info-section">
          <h1>{title}</h1>
          <div className="product-price">${price}</div>
          <div className="product-category">Category: {category?.name ?? 'Uncategorized'}</div>

          <div className="product-description">
            <h3>Description</h3>
            <p>{description}</p>
          </div>

          <button className="add-to-cart-btn">Add to Cart</button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;

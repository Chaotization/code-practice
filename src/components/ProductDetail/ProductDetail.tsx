import React from 'react';
import { useParams } from 'react-router-dom';
import useProduct from '../../hooks/useProduct';
import './ProductDetail.scss';

type AnyObject = Record<string, any>;

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, isError, error } = useProduct(id!);

  if (isLoading) return <p>Loading…</p>;
  if (isError) return <div>{error?.message}</div>;
  if (!data) return <div>No product found</div>;

    const handleGoBack = () => {
        window.history.back();
    }
  const renderValue = (
    key: string,
    value: any,
    nested: boolean = false
  ): React.ReactNode => {
    if (key === 'id') return null;
    if (value == null) return <span className="text-muted">None</span>;

    if (key === 'category' && typeof value === 'object' && 'name' in value) {
      return <span className="text-value">{(value as any).name}</span>;
    }

    if (['string', 'number', 'boolean'].includes(typeof value)) {
      if (key === 'image' && typeof value === 'string') {
        return <img src={value} alt={key} className="main-image" />;
      }
      return <span className="text-value">{value.toString()}</span>;
    }

    if (Array.isArray(value)) {
      if (!value.length) return <span className="text-muted">Empty</span>;
      if (key === 'images') {
        return (
          <div className="thumbnail-list">
            {value.map((src: string, i: number) => (
              <img
                key={i}
                src={src}
                alt={`${key}-${i}`}
                className="thumbnail"
              />
            ))}
          </div>
        );
      }
      return (
        <ul className={nested ? 'array-list nested' : 'array-list'}>
          {value.map((item, i) =>
            typeof item === 'object' ? (
              <li key={i}>{renderValue('', item, true)}</li>
            ) : (
              <li key={i}>{item.toString()}</li>
            )
          )}
        </ul>
      );
    }

    if (typeof value === 'object') {
      return (
        <div className={`nested-object ${nested ? 'nested' : ''}`}>
          {Object.entries(value as AnyObject)
            .filter(
              ([k]) =>
                !(nested && (k === 'creationAt' || k === 'updatedAt'))
            )
            .map(([k, v]) => (
              <div key={k} className="field-pair">
                <strong>{k}:</strong> {renderValue(k, v, true)}
              </div>
            ))}
        </div>
      );
    }

    return <span>{String(value)}</span>;
  };

  return (
    <div className="product-detail-container">
        <div className='product-header'>
            <button
            className="btn btn-secondary"
            onClick={handleGoBack}
            >Go Back</button>
        </div>
      <div className="product-card">
        <div className="image-section">
          {data.image && (
            <img src={data.image} alt="product" className="main-image" />
          )}
          {data.images && data.images.length > 0 && (
            <div className="thumbnail-list">
              {data.images.map((src: string, i: number) => (
                <img
                  key={i}
                  src={src}
                  alt={`thumb-${i}`}
                  className="thumbnail"
                />
              ))}
            </div>
          )}
        </div>

        <div className="info-section">
          <h2 className="product-title">{data.title || 'Untitled'}</h2>
          {data.description && (
            <p className="product-description">{data.description}</p>
          )}

          <div className="details-grid">
            {Object.entries(data)
              .filter(
                ([key]) =>
                  ![
                    'id',
                    'image',
                    'images',
                    'title',
                    'description',
                  ].includes(key)
              )
              .map(([key, val]) => (
                <div key={key} className="field-pair">
                  <strong>{key}:</strong>{' '}
                  {renderValue(key, val)}
                </div>
              ))}
          </div>

          <div className="actions">
            <button className="btn btn-primary">Add to Cart</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;

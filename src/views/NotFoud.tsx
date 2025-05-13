import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

const NotFound: React.FC = () => {
  const [redirect, setRedirect] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setRedirect(true), 3000);
    return () => clearTimeout(timeout);
  }, []);

  if (redirect) {
    return <Navigate to="/products" replace />;
  }

  return (
    <section className="not-found-page">
      <div className="not-found-content">
        <h1 className="not-found-title">404</h1>
        <p className="not-found-message">
          Page not found. Redirecting to products...
        </p>
      </div>
    </section>
  );
};

export default NotFound;

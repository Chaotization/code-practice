import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

const LoginPage = lazy(() => import('../views/Login'));
const ProductListPage = lazy(() => import('../views/ProductList.tsx'));
const ProductDetailPage = lazy(() => import('../views/ProductDetail.tsx'));
const CartPage = lazy(() => import('../views/Carts.tsx'));
const ProfilePage = lazy(() => import('../views/Profile.tsx'));
const NotFoundPage = lazy(() => import('../views/NotFoud.tsx'));

const LoadingFallback: React.FC = () => (
    <div className="loading-container">
        <div className="loading-spinner" />
        <p>Loading...</p>
    </div>
);

const AppRoutes: React.FC = () => (
    <Suspense fallback={<LoadingFallback />}>
        <Routes>
            <Route path="/" element={<Navigate to="/products" replace />} />

            <Route path="/login" element={<LoginPage />} />
            <Route path="/products" element={<ProductListPage />} />
            <Route path="/products/:id" element={<ProductDetailPage />} />

            <Route path="/cart" element={<CartPage />} />
            <Route path="/profile" element={<ProfilePage />} />

            <Route path="*" element={<NotFoundPage />} />
        </Routes>
    </Suspense>
);

export default AppRoutes;

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProductList from '../components/ProductList/ProductList';
import ProductDetail from '../components/ProductDetail/ProductDetail';

const AppRoutes: React.FC = () => (
    <Routes>
        <Route path="/products" element={<ProductList />} />
        <Route path="/products/:id" element={<ProductDetail />} />
    </Routes>
);

export default AppRoutes;

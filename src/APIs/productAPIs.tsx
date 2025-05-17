import axios from 'axios';

export interface Category {
    id: number;
    name: string;
    slug: string;
    image: string;
    creationAt: string;
    updatedAt: string;
}

export interface Product {
    id: number;
    title: string;
    slug: string;
    price: number;
    description: string;
    category: Category;
    images: string[];
}

export interface CartItem {
    id: number;
    name: string;
    price: number;
    quantity: number;
}

export interface Cart {
    id: number;
    userId: number;
    products: CartItem[];
    createdAt: string;
    updatedAt: string;
}

export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
}

export interface UserProfile {
    id: number;
    email: string;
    name: string;
}

const URL = import.meta.env.VITE_API_URL

const api = {
    getProducts: async (offset = 0, limit = 20) => {
        try {
            const response = await axios.get(`${URL}/products?offset=${offset}&limit=${limit}`);

            if(response.status !== 200)  throw new Error(`API error: ${response.status} ${response.statusText}`);

            return response.data;
        } catch (error: any) {
            const msg =
                error.response?.data?.message ||
                error.response?.statusText ||
                error.message;
            throw msg
        }
    },

    searchProducts: async (title: string, offset = 0, limit = 20) => {
        try {
            const response = await axios.get(`${URL}/products`, {
                params: { title, offset, limit }
            });
            return response.data;
        } catch (error: any) {
            const msg =
                error.response?.data?.message ||
                error.response?.statusText ||
                error.message;
            throw new Error(`API error [${error.response?.status}]: ${msg}`);
        }
    },

    getProductById: async (id: string) => {
        try {
            const response = await axios.get(`${URL}/products/${id}`);
            return response.data;
        } catch (error: any) {
            const msg =
                error.response?.data?.message ||
                error.response?.statusText ||
                error.message;
            throw new Error(`API error [${error.response?.status}]: ${msg}`);
        }
    },

    getCategories: async () => {
        try {
            const response = await axios.get(`${URL}/categories`);
            return response.data;
        } catch (error: any) {
            const msg =
                error.response?.data?.message ||
                error.response?.statusText ||
                error.message;
            throw new Error(`API error [${error.response?.status}]: ${msg}`);
        }
    },

    login: async (email: string, password: string) => {
        try {
            const response = await axios.post(`${URL}/auth/login`, { email, password });
            return response.data;
        } catch (error: any) {
            const msg =
                error.response?.data?.message ||
                error.response?.statusText ||
                error.message;
            throw new Error(`API error [${error.response?.status}]: ${msg}`);
        }
    },

    refreshToken: async (refreshToken: string) => {
        try {
            const response = await axios.post(`${URL}/auth/refresh-token`, { refreshToken });
            return response.data;
        } catch (error: any) {
            const msg =
                error.response?.data?.message ||
                error.response?.statusText ||
                error.message;
            throw new Error(`API error [${error.response?.status}]: ${msg}`);
        }
    },

    getProfile: async (token: string) => {
        try {
            const response = await axios.get(`${URL}/auth/profile`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        } catch (error: any) {
            const msg =
                error.response?.data?.message ||
                error.response?.statusText ||
                error.message;
            throw new Error(`API error [${error.response?.status}]: ${msg}`);
        }
    },

    addToCart: async (userId: number, products: { id: number; quantity: number }[]) => {
        try {
            const response = await axios.post(`${URL}/carts/add`, { userId, products });
            return response.data;
        } catch (error: any) {
            const msg =
                error.response?.data?.message ||
                error.response?.statusText ||
                error.message;
            throw new Error(`API error [${error.response?.status}]: ${msg}`);
        }
    },

    updateCart: async (cartId: number, products: { id: number; quantity: number }[]) => {
        try {
            const response = await axios.put(`${URL}/carts/${cartId}`, { products });
            return response.data;
        } catch (error: any) {
            const msg =
                error.response?.data?.message ||
                error.response?.statusText ||
                error.message;
            throw new Error(`API error [${error.response?.status}]: ${msg}`);
        }
    },

    deleteCart: async (cartId: number) => {
        try {
            const response = await axios.delete(`${URL}/carts/${cartId}`);
            return response.data;
        } catch (error: any) {
            const msg =
                error.response?.data?.message ||
                error.response?.statusText ||
                error.message;
            throw new Error(`API error [${error.response?.status}]: ${msg}`);
        }
    },
};

export default api;
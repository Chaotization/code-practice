import axios from "axios";

const URL = "http://localhost:3000/api/v1";

interface Product {
  id: number;
  title: string;
  price: number;
  description: string;
  category: Category;
  images: string[];
}

interface Category {
  id: number;
  name: string;
  image: string;
  creationAt: string;
  updateAt: string;
}

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

export const exportedMethods = {
  getProducts: async (): Promise<Product[]> => {
    try {
      const response = await axios.get(`${URL}/products?offset=0&limit=20`);
      return response.data as Product[];
    } catch (error) {
      console.error(`Failed to fetch products:`, error);
      return [];
    }
  },

  getProductById: async (id: string): Promise<Product | null> => {
    try {
      const response = await axios.get(`${URL}/products/${id}`);
      return response.data as Product;
    } catch (error) {
      console.error(`Failed to fetch product with id ${id}:`, error);
      return null;
    }
  },

  login: async (email: string, password: string): Promise<any> => {
    try {
      const response = await axios.post(`${URL}/auth/login`, {
        email,
        password,
      });
      return response.data;
    } catch (error) {
      console.error(`Login failed:`, error);
      return null;
    }
  },

  getCategories: async (): Promise<Category[]> => {
    try {
      const response = await axios.get(`${URL}/categories`);
      return response.data as Category[];
    } catch (error) {
      console.error(`Failed to fetch categories:`, error);
      return [];
    }
  },

  getProfile: async (token: string): Promise<any> => {
    try {
      const response = await axios.get(`${URL}/auth/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch profile:`, error);
      return null;
    }
  },
};

export default exportedMethods;

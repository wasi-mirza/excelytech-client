import apiService from "../../services";
import {
  Product,
  AddProductInput,
  ProductsResponse,
  UpdateProductInput,
} from "../types/product.types";

export const getProducts = async (
  page: number,
  limit: number,
  search?: string
) => {
  const response = await apiService.get<ProductsResponse>(
    "/product/getProducts",
    {
      params: {
        page,
        limit,
        search,
      },
    }
  );

  return response.data;
};

export const getProductById = async (id: string | undefined) => {
  const response = await apiService.get<Product>(`/product/${id}`);
  return response;
};

export const uploadProductImage = async (image: FormData) => {
  const response = await apiService.post("/upload/productImage", image, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response;
};

export const addProduct = async (product: AddProductInput) => {
  const response = await apiService.post("/product/newProduct", product);
  return response;
};

export const updateProduct = async (product: UpdateProductInput) => {
  const response = await apiService.patch(`/product/${product?._id}`, product);
  return response;
};

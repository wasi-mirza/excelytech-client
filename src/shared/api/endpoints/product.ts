import apiService from "../../services";
import { ProductsResponse } from "../types/product.types";

export const getProducts = async (
    page: number,
    limit: number,
    search?: string
  ) => {
    const response = await apiService.get<ProductsResponse>('/product/getProducts', {
      params: {
        page,
        limit,
        search,
      },
    });
  
    return response.data;
  };
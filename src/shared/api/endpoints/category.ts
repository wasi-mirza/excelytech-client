
import { CategoryInput, GetCategoriesResponse, UpdateCategoryInput } from '../types/category.types';
import apiService from '../../services';
export const getAllCategories = async (
  page: number,
  limit: number,
  search?: string
) => {
  const response = await apiService.get<GetCategoriesResponse>('/category/allCategory', {
    params: {
      page,
      limit,
      search,
    },
  });

  return response.data;
};

export const addCategory = async (category: CategoryInput) => {
  const response = await apiService.post('/category/new', category);
  return response.data;
};

export const updateCategory = async (category: UpdateCategoryInput) => {
  const response = await apiService.patch(`/category/${category.categoryId}`, category);
  return response.data;
};

export const deleteCategory = async (categoryId: string) => {
  const response = await apiService.delete(`/category/${categoryId}`);
  return response.data;
};


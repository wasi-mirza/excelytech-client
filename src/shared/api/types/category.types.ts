export interface CategoryResponse {
    _id: string;
    name: string;
    createdAt: string;
    __v: number;
  }
  
  export interface GetCategoriesResponse {
    categories: CategoryResponse[];
    total: number;
    page: number;
    limit: number;
  }

  export interface CategoryInput {
    name: string;
  }

  export interface UpdateCategoryInput {
    categoryId: string;
    name: string;
  }
  
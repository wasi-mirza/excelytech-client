export interface Product {
    _id: string;
    name: string;
    description: string;
    quantityVariants: QuantityVariant[];
    productManager: ProductManager;
    category: string;
    imageUrl: string;
    tags: string[];
    createdAt: string;
    updatedAt: string;
}

export interface QuantityVariant {
    sku: string;
    name: string;
    cost: number;
    tax: number;
    costToExcelyTechWithTax: number;
    purchaseType: string;
    duration: number;
    currency: string;
}

export interface ProductManager {
    _id: string;
    name: string;
    phone: string;
    userType: string;
    username: string;
    email: string;
    password: string;
    role: string;   
}

export interface ProductsResponse {
    total: number;
    page: number;
    totalPages: number;
    products: Product[];
}
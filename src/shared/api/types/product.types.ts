export interface ProductManager {
  _id: string;
  name: string;
  phone: string;
  userType: string;
  username: string;
  email: string;
  password: string;
  role: string;
  businessDetails: {
    clientName: string;
    companyType: string;
    taxId: "123-45-6789";
    employeeSize: "50";
    ownerPhone: "0987654321";
    ownerEmail: "admin@excelytech.com";
    companyName: "excelytech";
  };
  timeZone: string;
  preferredContactMethod: string;
  notes: string[];
  paymentStatus: string;
  allowLogin: boolean;
  activeAccount: boolean;
  bannedAccount: boolean;
  accountManagers: null;
  address: {
    street1: string;
    street2: string;
    zipCode: string;
    city: string;
    state: string;
    country: string;
  };
  isFirstTimeLogin: boolean;
  isfirstPasswordResetDone: boolean;
  agreementAccepted: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}
export interface Product {
  _id: string;
  sku: string;
  name: string;
  description: string;
  cost: number;
  tax: number;
  totalCost: number;
  productManager: ProductManager;
  status: string;
  activeSubscriptions: number;
  revenueGenerated: number;
  category: string;
  imageUrl: string;
  purchaseType: string;
  duration?: number;
  currency: string;
  tags: string[];
  keywords: string[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface ProductsResponse {
  total: number;
  page: number;
  totalPages: number;
  products: Product[];
}

export interface AddProductInput {
  sku: string;
  name: string;
  description: string;
  cost: number;
  tax: number;
  totalCost: number;
  productManager: string;
  category: string;
  purchaseType: string;
  currency: string;
  status: string;
  tags: string[];
  keywords: string[];
  activeSubscriptions: number;
  revenueGenerated: number;
  duration?: number;
  imageUrl: string;
}

export interface UpdateProductInput {
  _id: string;
  sku?: string;
  name?: string;
  description?: string;
  cost?: number;
  tax?: number;
  totalCost?: number;
  productManager?: string;
  category?: string;
  purchaseType?: string;
  currency?: string;
  status?: string;
  tags?: string[];
  keywords?: string[];
  activeSubscriptions?: number;
  revenueGenerated?: number;
  duration?: number;
  imageUrl?: string;
}
// Generic API response structure
export interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data: T;
}

// ----------------------------------------------------------------------
// 1. Admin Authentication Types
// ----------------------------------------------------------------------

export type AdminRole =
    | "super_admin"
    | "store_manager"
    | "order_manager"
    | "product_manager"
    | string;

export interface AdminUser {
    adminId: string;
    firstName: string;
    lastName: string;
    email: string;
    role: AdminRole;
    status: "active" | "inactive" | string;
    lastLoginAt?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface LoginPayload {
    email: string;
    password: string;
}

export interface LoginResponseData {
    admin: AdminUser;
    token: string;
}

export type LoginResponse = ApiResponse<LoginResponseData>;
export type AdminMeResponse = ApiResponse<{ admin: AdminUser }>;

// ----------------------------------------------------------------------
// 2. Categories Types
// ----------------------------------------------------------------------

export interface Category {
    categoryId: string;
    name: string;
    slug: string;
    description?: string;
    status: "active" | "inactive" | string;
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateCategoryPayload {
    name: string;
    description?: string;
    status?: "active" | "inactive" | string;
}

export interface UpdateCategoryPayload {
    name?: string;
    description?: string;
    status?: "active" | "inactive" | string;
}

export type CategoryResponse = ApiResponse<{ category: Category }>;
export type CategoryListResponse = ApiResponse<{ categories: Category[] }>;

// ----------------------------------------------------------------------
// 3. Brands Types
// ----------------------------------------------------------------------

export interface Brand {
    brandId: string;
    name: string;
    slug: string;
    description?: string;
    status: "active" | "inactive" | string;
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateBrandPayload {
    name: string;
    description?: string;
    status?: "active" | "inactive" | string;
}

export interface UpdateBrandPayload {
    name?: string;
    description?: string;
    status?: "active" | "inactive" | string;
}

export type BrandResponse = ApiResponse<{ brand: Brand }>;
export type BrandListResponse = ApiResponse<{ brands: Brand[] }>;

// ----------------------------------------------------------------------
// 4. Products Types
// ----------------------------------------------------------------------

export interface SellingUnit {
    sellingUnitId?: string; // Included for existing units, omitted for new units
    name: string;
    sku?: string;
    price: number;
    stock: number;
    status?: string;
}

export interface ProductImage {
    productImageId?: string; // Included for existing images, omitted for new images
    imageUrl: string;
    altText?: string;
    isPrimary?: boolean;
    sortOrder?: number;
}

export interface ProductItem {
    productId?: string;
    id?: string;
    name: string;
    slug: string;
    description?: string;
    categoryId?: string;
    brandId?: string;
    category?: Category;
    brand?: Brand;
    status: "active" | "inactive" | string;
    featured?: boolean;
    sellingUnits?: SellingUnit[];
    images?: ProductImage[];
    createdAt?: string;
    updatedAt?: string;
}

export interface GetProductsParams {
    page?: number;
    limit?: number;
    search?: string;
    categoryId?: string;
    brandId?: string;
    status?: "active" | "inactive" | string;
    featured?: boolean;
    sort?: "newest" | "name_asc" | "name_desc" | string;
}

export interface CreateProductPayload {
    name: string;
    description?: string;
    categoryId: string;
    brandId?: string;
    status?: "active" | "inactive" | string;
    featured?: boolean;
    sellingUnits?: SellingUnit[];
    images?: ProductImage[];
}

export interface AdminUpdateProductPayload {
    name?: string;
    description?: string;
    categoryId?: string;
    brandId?: string;
    status?: "active" | "inactive" | string;
    featured?: boolean;
    sellingUnits?: SellingUnit[];
    images?: ProductImage[];
}

export type PublicProductsResponse = ApiResponse<{
    products: ProductItem[];
    pagination?: {
        total?: number;
        page?: number;
        limit?: number;
        totalPages?: number;
    };
}>;

export type PublicSingleProductResponse = ApiResponse<{ product: ProductItem }>;
export type AdminProductListResponse = ApiResponse<{
    products: ProductItem[];
    pagination?: {
        total?: number;
        page?: number;
        limit?: number;
        totalPages?: number;
    };
}>;
export type AdminProductResponse = ApiResponse<{ product: ProductItem }>;
export type AdminUpdateProductResponse = ApiResponse<{ product: ProductItem }>;

// ----------------------------------------------------------------------
// 5. Customers Types
// ----------------------------------------------------------------------

export type CustomerVerificationStatus =
    | "verified"
    | "pending_verification"
    | string;

export interface CustomerItem {
    customerId: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
    email: string;
    status: CustomerVerificationStatus;
    createdAt: string;
    updatedAt: string;
    orderCount?: number;
    totalSpent?: string | number;
}

export interface CustomerAddress {
    addressId: string;
    label?: string | null;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
    addressLine1: string;
    addressLine2?: string | null;
    city: string;
    state: string;
    postalCode?: string | null;
    country: string;
    isDefault?: boolean;
}

export interface CustomerOrderItem {
    orderItemId: string;
    productName: string;
    sellingUnitName?: string;
    sku?: string;
    unitPrice: string | number;
    quantity: number;
    lineTotal: string | number;
}

export interface CustomerOrder {
    orderId: string;
    orderNumber: string;
    currency?: string;
    subtotal: string | number;
    deliveryFee: string | number;
    total: string | number;
    status:
        | "processing"
        | "shipped"
        | "delivered"
        | "cancelled"
        | "pending"
        | string;
    createdAt: string;
    paidAt?: string | null;
    items?: CustomerOrderItem[];
}

export interface CustomerSummary {
    totalOrders: number;
    activeOrders: number;
    totalSpent: string | number;
}

export interface CustomerStatistics {
    totalCustomers: number;
    verifiedCustomers: number;
    pendingCustomers: number;
}

export interface GetCustomersParams {
    page?: number;
    limit?: number;
    search?: string;
    status?: "verified" | "pending_verification" | string;
}

export type AdminCustomerListResponse = ApiResponse<{
    customers: CustomerItem[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}>;

export type AdminCustomerDetailResponse = ApiResponse<{
    customer: CustomerItem;
    addresses: CustomerAddress[];
    orders: CustomerOrder[];
    summary: CustomerSummary;
}>;

export type AdminCustomerStatisticsResponse = ApiResponse<{
    statistics: CustomerStatistics;
}>;

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
    featured?: boolean;
    sort?: "newest" | "name_asc" | "name_desc" | string;
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
export type AdminUpdateProductResponse = ApiResponse<{ product: ProductItem }>;

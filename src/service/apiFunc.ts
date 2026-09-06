import { axiosInstance } from "@/config/apiClient";
import type {
    LoginPayload,
    LoginResponse,
    AdminMeResponse,
    CategoryListResponse,
    CategoryResponse,
    CreateCategoryPayload,
    UpdateCategoryPayload,
    BrandListResponse,
    BrandResponse,
    CreateBrandPayload,
    UpdateBrandPayload,
    GetProductsParams,
    PublicProductsResponse,
    PublicSingleProductResponse,
    AdminUpdateProductPayload,
    AdminUpdateProductResponse,
    ApiResponse,
} from "./types";

// ============================================================================
// 1. Admin Authentication Endpoints
// ============================================================================

/**
 * Admin Login
 * POST /admin/auth/login
 */
export const loginFunc = async (
    payload: LoginPayload,
): Promise<LoginResponse> => {
    const response = await axiosInstance.post<LoginResponse>(
        "/admin/auth/login",
        payload,
    );
    return response.data;
};

/**
 * Get Logged-In Admin Profile
 * GET /admin/auth/me
 */
export const getAdminMeFunc = async (): Promise<AdminMeResponse> => {
    const response = await axiosInstance.get<AdminMeResponse>("/admin/auth/me");
    return response.data;
};

/**
 * Alias for getAdminMeFunc matching user reference
 */
export const getUserInfoFunc = getAdminMeFunc;

// ============================================================================
// 2. Categories Endpoints (Admin)
// ============================================================================

/**
 * List all categories (Admin)
 * GET /admin/categories
 */
export const getAdminCategoriesFunc =
    async (): Promise<CategoryListResponse> => {
        const response =
            await axiosInstance.get<CategoryListResponse>("/admin/categories");
        return response.data;
    };

/**
 * Get one category by ID (Admin)
 * GET /admin/categories/:categoryId
 */
export const getAdminCategoryByIdFunc = async (
    categoryId: string,
): Promise<CategoryResponse> => {
    const response = await axiosInstance.get<CategoryResponse>(
        `/admin/categories/${categoryId}`,
    );
    return response.data;
};

/**
 * Create a new category (Admin)
 * POST /admin/categories
 */
export const createCategoryFunc = async (
    payload: CreateCategoryPayload,
): Promise<CategoryResponse> => {
    const response = await axiosInstance.post<CategoryResponse>(
        "/admin/categories",
        payload,
    );
    return response.data;
};

/**
 * Update a category (Admin)
 * PATCH /admin/categories/:categoryId
 */
export const updateCategoryFunc = async (
    categoryId: string,
    payload: UpdateCategoryPayload,
): Promise<CategoryResponse> => {
    const response = await axiosInstance.patch<CategoryResponse>(
        `/admin/categories/${categoryId}`,
        payload,
    );
    return response.data;
};

/**
 * Delete a category (Admin)
 * DELETE /admin/categories/:categoryId
 */
export const deleteCategoryFunc = async (
    categoryId: string,
): Promise<ApiResponse<null>> => {
    const response = await axiosInstance.delete<ApiResponse<null>>(
        `/admin/categories/${categoryId}`,
    );
    return response.data;
};

// ============================================================================
// 3. Brands Endpoints (Admin)
// ============================================================================

/**
 * List all brands (Admin)
 * GET /admin/brands
 */
export const getAdminBrandsFunc = async (): Promise<BrandListResponse> => {
    const response =
        await axiosInstance.get<BrandListResponse>("/admin/brands");
    return response.data;
};

/**
 * Get one brand by ID (Admin)
 * GET /admin/brands/:brandId
 */
export const getAdminBrandByIdFunc = async (
    brandId: string,
): Promise<BrandResponse> => {
    const response = await axiosInstance.get<BrandResponse>(
        `/admin/brands/${brandId}`,
    );
    return response.data;
};

/**
 * Create a new brand (Admin)
 * POST /admin/brands
 */
export const createBrandFunc = async (
    payload: CreateBrandPayload,
): Promise<BrandResponse> => {
    const response = await axiosInstance.post<BrandResponse>(
        "/admin/brands",
        payload,
    );
    return response.data;
};

/**
 * Update a brand (Admin)
 * PATCH /admin/brands/:brandId
 */
export const updateBrandFunc = async (
    brandId: string,
    payload: UpdateBrandPayload,
): Promise<BrandResponse> => {
    const response = await axiosInstance.patch<BrandResponse>(
        `/admin/brands/${brandId}`,
        payload,
    );
    return response.data;
};

/**
 * Delete a brand (Admin)
 * DELETE /admin/brands/:brandId
 */
export const deleteBrandFunc = async (
    brandId: string,
): Promise<ApiResponse<null>> => {
    const response = await axiosInstance.delete<ApiResponse<null>>(
        `/admin/brands/${brandId}`,
    );
    return response.data;
};

// ============================================================================
// 4. Public Catalogue Endpoints
// ============================================================================

/**
 * Get Categories (Public)
 * GET /categories
 */
export const getPublicCategoriesFunc = async () => {
    const response = await axiosInstance.get("/categories");
    return response.data;
};

/**
 * Get Brands (Public)
 * GET /brands
 */
export const getPublicBrandsFunc = async (): Promise<BrandListResponse> => {
    const response = await axiosInstance.get<BrandListResponse>("/brands");
    return response.data;
};

/**
 * Get Products List (Public with query filters)
 * GET /products
 */
export const getPublicProductsFunc = async (
    params?: GetProductsParams,
): Promise<PublicProductsResponse> => {
    const response = await axiosInstance.get<PublicProductsResponse>(
        "/products",
        {
            params,
        },
    );
    return response.data;
};

/**
 * Get Single Product by Slug (Public)
 * GET /products/:slug
 */
export const getPublicProductBySlugFunc = async (
    slug: string,
): Promise<PublicSingleProductResponse> => {
    const response = await axiosInstance.get<PublicSingleProductResponse>(
        `/products/${slug}`,
    );
    return response.data;
};

// ============================================================================
// 5. Admin Product Update Endpoint
// ============================================================================

/**
 * Admin Product Full Update (Single request update)
 * PATCH /admin/products/:productId
 */
export const updateAdminProductFunc = async (
    productId: string,
    payload: AdminUpdateProductPayload,
): Promise<AdminUpdateProductResponse> => {
    const response = await axiosInstance.patch<AdminUpdateProductResponse>(
        `/admin/products/${productId}`,
        payload,
    );
    return response.data;
};

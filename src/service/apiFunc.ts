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
    CreateProductPayload,
    AdminProductListResponse,
    AdminProductResponse,
    ApiResponse,
    GetCustomersParams,
    AdminCustomerListResponse,
    AdminCustomerDetailResponse,
    AdminCustomerStatisticsResponse,
    GetOrdersParams,
    AdminOrderListResponse,
    AdminOrderDetailResponse,
    UpdateOrderStatusPayload,
    UpdateOrderStatusResponse,
    AdminOrderProgressResponse,
    GetDeliveryAreasParams,
    CreateDeliveryAreaPayload,
    UpdateDeliveryAreaPayload,
    AdminDeliveryAreaListResponse,
    AdminDeliveryAreaResponse,
    UpdateDeliverySettingPayload,
    AdminDeliverySettingsResponse,
    PublicDeliveryAreasResponse,
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
// 5. Admin Products Endpoints
// ============================================================================

/**
 * List all products (Admin with query filters)
 * GET /admin/products
 */
export const getAdminProductsFunc = async (
    params?: GetProductsParams,
): Promise<AdminProductListResponse> => {
    const response = await axiosInstance.get<AdminProductListResponse>(
        "/admin/products",
        {
            params,
        },
    );
    return response.data;
};

/**
 * Get one product by ID (Admin)
 * GET /admin/products/:productId
 */
export const getAdminProductByIdFunc = async (
    productId: string,
): Promise<AdminProductResponse> => {
    const response = await axiosInstance.get<AdminProductResponse>(
        `/admin/products/${productId}`,
    );
    return response.data;
};

/**
 * Create a new product (Admin)
 * POST /admin/products
 */
export const createAdminProductFunc = async (
    payload: CreateProductPayload,
): Promise<AdminProductResponse> => {
    const response = await axiosInstance.post<AdminProductResponse>(
        "/admin/products",
        payload,
    );
    return response.data;
};

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

/**
 * Delete a product (Admin)
 * DELETE /admin/products/:productId
 */
export const deleteAdminProductFunc = async (
    productId: string,
): Promise<ApiResponse<null>> => {
    const response = await axiosInstance.delete<ApiResponse<null>>(
        `/admin/products/${productId}`,
    );
    return response.data;
};

// ============================================================================
// 6. Customers Endpoints (Admin)
// ============================================================================

/**
 * List registered customers with pagination, search, and status filter
 * GET /admin/customers
 */
export const getAdminCustomersFunc = async (
    params?: GetCustomersParams,
): Promise<AdminCustomerListResponse> => {
    const response = await axiosInstance.get<AdminCustomerListResponse>(
        "/admin/customers",
        { params },
    );
    return response.data;
};

/**
 * Get customer details (profile, addresses, order history, summary)
 * GET /admin/customers/:customerId
 */
export const getAdminCustomerByIdFunc = async (
    customerId: string,
): Promise<AdminCustomerDetailResponse> => {
    const response = await axiosInstance.get<AdminCustomerDetailResponse>(
        `/admin/customers/${customerId}`,
    );
    return response.data;
};

/**
 * Get overall customer statistics for admin dashboard
 * GET /admin/customers/statistics
 */
export const getAdminCustomerStatisticsFunc =
    async (): Promise<AdminCustomerStatisticsResponse> => {
        const response =
            await axiosInstance.get<AdminCustomerStatisticsResponse>(
                "/admin/customers/statistics",
            );
        return response.data;
    };

// ============================================================================
// 7. Orders Endpoints (Admin)
// ============================================================================

/**
 * List orders (Admin) with pagination, search, status
 * GET /admin/orders
 */
export const getAdminOrdersFunc = async (
    params?: GetOrdersParams,
): Promise<AdminOrderListResponse> => {
    const response = await axiosInstance.get<AdminOrderListResponse>(
        "/admin/orders",
        { params },
    );
    return response.data;
};

/**
 * Get one order by ID (Admin)
 * GET /admin/orders/:orderId
 */
export const getAdminOrderByIdFunc = async (
    orderId: string,
): Promise<AdminOrderDetailResponse> => {
    const response = await axiosInstance.get<AdminOrderDetailResponse>(
        `/admin/orders/${orderId}`,
    );
    return response.data;
};

/**
 * Get order progress steps & timeline (Admin)
 * GET /admin/orders/:orderId/progress
 */
export const getAdminOrderProgressFunc = async (
    orderId: string,
): Promise<AdminOrderProgressResponse> => {
    const response = await axiosInstance.get<AdminOrderProgressResponse>(
        `/admin/orders/${orderId}/progress`,
    );
    return response.data;
};

/**
 * Update order status (Admin)
 * PATCH /admin/orders/:orderId/status
 */
export const updateAdminOrderStatusFunc = async (
    orderId: string,
    payload: UpdateOrderStatusPayload,
): Promise<UpdateOrderStatusResponse> => {
    const response = await axiosInstance.patch<UpdateOrderStatusResponse>(
        `/admin/orders/${orderId}/status`,
        payload,
    );
    return response.data;
};

// ============================================================================
// 8. Delivery Management Endpoints
// ============================================================================

/**
 * List delivery areas (Admin) with pagination, search, and status
 * GET /admin/delivery-areas
 */
export const getAdminDeliveryAreasFunc = async (
    params?: GetDeliveryAreasParams,
): Promise<AdminDeliveryAreaListResponse> => {
    const response = await axiosInstance.get<AdminDeliveryAreaListResponse>(
        "/admin/delivery-areas",
        { params },
    );
    return response.data;
};

/**
 * Create a new delivery area (Admin)
 * POST /admin/delivery-areas
 */
export const createAdminDeliveryAreaFunc = async (
    payload: CreateDeliveryAreaPayload,
): Promise<AdminDeliveryAreaResponse> => {
    const response = await axiosInstance.post<AdminDeliveryAreaResponse>(
        "/admin/delivery-areas",
        payload,
    );
    return response.data;
};

/**
 * Get one delivery area by ID (Admin)
 * GET /admin/delivery-areas/:deliveryAreaId
 */
export const getAdminDeliveryAreaByIdFunc = async (
    deliveryAreaId: string,
): Promise<AdminDeliveryAreaResponse> => {
    const response = await axiosInstance.get<AdminDeliveryAreaResponse>(
        `/admin/delivery-areas/${deliveryAreaId}`,
    );
    return response.data;
};

/**
 * Update delivery area (Admin)
 * PATCH /admin/delivery-areas/:deliveryAreaId
 */
export const updateAdminDeliveryAreaFunc = async (
    deliveryAreaId: string,
    payload: UpdateDeliveryAreaPayload,
): Promise<AdminDeliveryAreaResponse> => {
    const response = await axiosInstance.patch<AdminDeliveryAreaResponse>(
        `/admin/delivery-areas/${deliveryAreaId}`,
        payload,
    );
    return response.data;
};

/**
 * Delete delivery area (Admin)
 * DELETE /admin/delivery-areas/:deliveryAreaId
 */
export const deleteAdminDeliveryAreaFunc = async (
    deliveryAreaId: string,
): Promise<ApiResponse<null>> => {
    const response = await axiosInstance.delete<ApiResponse<null>>(
        `/admin/delivery-areas/${deliveryAreaId}`,
    );
    return response.data;
};

/**
 * Get delivery settings (Admin)
 * GET /admin/delivery-settings
 */
export const getAdminDeliverySettingsFunc =
    async (): Promise<AdminDeliverySettingsResponse> => {
        const response =
            await axiosInstance.get<AdminDeliverySettingsResponse>(
                "/admin/delivery-settings",
            );
        return response.data;
    };

/**
 * Update delivery settings (Admin)
 * PATCH /admin/delivery-settings
 */
export const updateAdminDeliverySettingsFunc = async (
    payload: UpdateDeliverySettingPayload,
): Promise<AdminDeliverySettingsResponse> => {
    const response =
        await axiosInstance.patch<AdminDeliverySettingsResponse>(
            "/admin/delivery-settings",
            payload,
        );
    return response.data;
};

/**
 * Get public active delivery areas & free delivery settings
 * GET /delivery-areas
 */
export const getPublicDeliveryAreasFunc =
    async (): Promise<PublicDeliveryAreasResponse> => {
        const response =
            await axiosInstance.get<PublicDeliveryAreasResponse>(
                "/delivery-areas",
            );
        return response.data;
    };




import { useQuery } from "@tanstack/react-query";
import {
    getUserInfoFunc,
    getAdminMeFunc,
    getAdminCategoriesFunc,
    getAdminCategoryByIdFunc,
    getAdminBrandsFunc,
    getAdminBrandByIdFunc,
    getAdminProductsFunc,
    getAdminProductByIdFunc,
    getPublicCategoriesFunc,
    getPublicBrandsFunc,
    getPublicProductsFunc,
    getPublicProductBySlugFunc,
    getAdminCustomersFunc,
    getAdminCustomerByIdFunc,
    getAdminCustomerStatisticsFunc,
    getAdminOrdersFunc,
    getAdminOrderByIdFunc,
    getAdminOrderProgressFunc,
    getAdminDeliveryAreasFunc,
    getAdminDeliveryAreaByIdFunc,
    getAdminDeliverySettingsFunc,
    getPublicDeliveryAreasFunc,
} from "./apiFunc";
import type {
    GetProductsParams,
    GetCustomersParams,
    GetOrdersParams,
    GetDeliveryAreasParams,
} from "./types";

// ============================================================================
// Query Keys
// ============================================================================
export const queryKeys = {
    userInfo: ["userInfo"] as const,
    adminMe: ["admin", "me"] as const,
    adminCategories: ["admin", "categories"] as const,
    adminCategory: (categoryId: string) =>
        ["admin", "categories", categoryId] as const,
    adminBrands: ["admin", "brands"] as const,
    adminBrand: (brandId: string) => ["admin", "brands", brandId] as const,
    adminProducts: (params?: GetProductsParams) =>
        ["admin", "products", params] as const,
    adminProduct: (productId: string) =>
        ["admin", "products", productId] as const,
    publicCategories: ["categories"] as const,
    publicBrands: ["brands"] as const,
    publicProducts: (params?: GetProductsParams) =>
        ["products", params] as const,
    publicProduct: (slug: string) => ["products", slug] as const,
    adminCustomers: (params?: GetCustomersParams) =>
        ["admin", "customers", params] as const,
    adminCustomer: (customerId: string) =>
        ["admin", "customers", customerId] as const,
    adminCustomerStatistics: ["admin", "customers", "statistics"] as const,
    adminOrders: (params?: GetOrdersParams) =>
        ["admin", "orders", params] as const,
    adminOrder: (orderId: string) => ["admin", "orders", orderId] as const,
    adminOrderProgress: (orderId: string) =>
        ["admin", "orders", orderId, "progress"] as const,
    adminDeliveryAreas: (params?: GetDeliveryAreasParams) =>
        ["admin", "delivery-areas", params] as const,
    adminDeliveryArea: (deliveryAreaId: string) =>
        ["admin", "delivery-areas", deliveryAreaId] as const,
    adminDeliverySettings: ["admin", "delivery-settings"] as const,
    publicDeliveryAreas: ["delivery-areas"] as const,
};

// ============================================================================
// 1. Admin Authentication Queries
// ============================================================================

/**
 * Hook to get logged-in admin user information
 */
export const useGetUserInfo = () => {
    return useQuery({
        queryKey: queryKeys.userInfo,
        queryFn: () => getUserInfoFunc(),
        retry: false,
    });
};

export const useGetAdminMe = () => {
    return useQuery({
        queryKey: queryKeys.adminMe,
        queryFn: () => getAdminMeFunc(),
        retry: false,
    });
};

// ============================================================================
// 2. Categories Queries (Admin)
// ============================================================================

/**
 * Hook to fetch all categories in the admin dashboard
 */
export const useGetAdminCategories = () => {
    return useQuery({
        queryKey: queryKeys.adminCategories,
        queryFn: () => getAdminCategoriesFunc(),
    });
};

/**
 * Hook to fetch a single category by categoryId (Admin)
 */
export const useGetAdminCategory = (categoryId: string) => {
    return useQuery({
        queryKey: queryKeys.adminCategory(categoryId),
        queryFn: () => getAdminCategoryByIdFunc(categoryId),
        enabled: Boolean(categoryId),
    });
};

// ============================================================================
// 3. Brands Queries (Admin)
// ============================================================================

/**
 * Hook to fetch all brands in the admin dashboard
 */
export const useGetAdminBrands = () => {
    return useQuery({
        queryKey: queryKeys.adminBrands,
        queryFn: () => getAdminBrandsFunc(),
    });
};

/**
 * Hook to fetch a single brand by brandId (Admin)
 */
export const useGetAdminBrand = (brandId: string) => {
    return useQuery({
        queryKey: queryKeys.adminBrand(brandId),
        queryFn: () => getAdminBrandByIdFunc(brandId),
        enabled: Boolean(brandId),
    });
};

// ============================================================================
// 4. Public Catalogue Queries
// ============================================================================

/**
 * Hook to fetch public categories
 */
export const useGetPublicCategories = () => {
    return useQuery({
        queryKey: queryKeys.publicCategories,
        queryFn: () => getPublicCategoriesFunc(),
    });
};

/**
 * Hook to fetch public brands
 */
export const useGetPublicBrands = () => {
    return useQuery({
        queryKey: queryKeys.publicBrands,
        queryFn: () => getPublicBrandsFunc(),
    });
};

/**
 * Hook to fetch public products list with optional filters
 */
export const useGetPublicProducts = (params?: GetProductsParams) => {
    return useQuery({
        queryKey: queryKeys.publicProducts(params),
        queryFn: () => getPublicProductsFunc(params),
    });
};

/**
 * Hook to fetch a single public product by slug
 */
export const useGetPublicProduct = (slug: string) => {
    return useQuery({
        queryKey: queryKeys.publicProduct(slug),
        queryFn: () => getPublicProductBySlugFunc(slug),
        enabled: Boolean(slug),
    });
};

// ============================================================================
// 5. Admin Products Queries
// ============================================================================

/**
 * Hook to fetch products list in admin portal with optional query params
 */
export const useGetAdminProducts = (params?: GetProductsParams) => {
    return useQuery({
        queryKey: queryKeys.adminProducts(params),
        queryFn: () => getAdminProductsFunc(params),
    });
};

/**
 * Hook to fetch a single admin product by ID
 */
export const useGetAdminProduct = (productId: string) => {
    return useQuery({
        queryKey: queryKeys.adminProduct(productId),
        queryFn: () => getAdminProductByIdFunc(productId),
        enabled: Boolean(productId),
    });
};

// ============================================================================
// 6. Admin Customers Queries
// ============================================================================

/**
 * Hook to fetch customers list in admin portal with optional query params (page, limit, search, status)
 */
export const useGetAdminCustomers = (params?: GetCustomersParams) => {
    return useQuery({
        queryKey: queryKeys.adminCustomers(params),
        queryFn: () => getAdminCustomersFunc(params),
    });
};

/**
 * Hook to fetch customer details by ID (profile, addresses, order history, summary)
 */
export const useGetAdminCustomer = (customerId: string) => {
    return useQuery({
        queryKey: queryKeys.adminCustomer(customerId),
        queryFn: () => getAdminCustomerByIdFunc(customerId),
        enabled: Boolean(customerId),
    });
};

/**
 * Hook to fetch customer statistics for admin dashboard
 */
export const useGetAdminCustomerStatistics = () => {
    return useQuery({
        queryKey: queryKeys.adminCustomerStatistics,
        queryFn: () => getAdminCustomerStatisticsFunc(),
    });
};

// ============================================================================
// 7. Admin Orders Queries
// ============================================================================

/**
 * Hook to fetch orders list in admin portal with pagination, search, status
 */
export const useGetAdminOrders = (params?: GetOrdersParams) => {
    return useQuery({
        queryKey: queryKeys.adminOrders(params),
        queryFn: () => getAdminOrdersFunc(params),
    });
};

/**
 * Hook to fetch order details by orderId (Admin)
 */
export const useGetAdminOrder = (orderId: string) => {
    return useQuery({
        queryKey: queryKeys.adminOrder(orderId),
        queryFn: () => getAdminOrderByIdFunc(orderId),
        enabled: Boolean(orderId),
    });
};

/**
 * Hook to fetch order progress steps & timeline (Admin)
 */
export const useGetAdminOrderProgress = (orderId: string) => {
    return useQuery({
        queryKey: queryKeys.adminOrderProgress(orderId),
        queryFn: () => getAdminOrderProgressFunc(orderId),
        enabled: Boolean(orderId),
    });
};

// ============================================================================
// 8. Delivery Management Queries
// ============================================================================

/**
 * Hook to fetch delivery areas list (Admin)
 */
export const useGetAdminDeliveryAreas = (params?: GetDeliveryAreasParams) => {
    return useQuery({
        queryKey: queryKeys.adminDeliveryAreas(params),
        queryFn: () => getAdminDeliveryAreasFunc(params),
    });
};

/**
 * Hook to fetch single delivery area by ID (Admin)
 */
export const useGetAdminDeliveryArea = (deliveryAreaId: string) => {
    return useQuery({
        queryKey: queryKeys.adminDeliveryArea(deliveryAreaId),
        queryFn: () => getAdminDeliveryAreaByIdFunc(deliveryAreaId),
        enabled: Boolean(deliveryAreaId),
    });
};

/**
 * Hook to fetch delivery settings (Admin)
 */
export const useGetAdminDeliverySettings = () => {
    return useQuery({
        queryKey: queryKeys.adminDeliverySettings,
        queryFn: () => getAdminDeliverySettingsFunc(),
    });
};

/**
 * Hook to fetch public delivery areas and free delivery settings
 */
export const useGetPublicDeliveryAreas = () => {
    return useQuery({
        queryKey: queryKeys.publicDeliveryAreas,
        queryFn: () => getPublicDeliveryAreasFunc(),
    });
};





import { useQuery } from "@tanstack/react-query";
import {
    getUserInfoFunc,
    getAdminMeFunc,
    getAdminCategoriesFunc,
    getAdminCategoryByIdFunc,
    getAdminBrandsFunc,
    getAdminBrandByIdFunc,
    getPublicCategoriesFunc,
    getPublicBrandsFunc,
    getPublicProductsFunc,
    getPublicProductBySlugFunc,
} from "./apiFunc";
import type { GetProductsParams } from "./types";

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
    publicCategories: ["categories"] as const,
    publicBrands: ["brands"] as const,
    publicProducts: (params?: GetProductsParams) =>
        ["products", params] as const,
    publicProduct: (slug: string) => ["products", slug] as const,
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

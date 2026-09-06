import { useMutation, useQueryClient } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { toast } from "@/components/ui/sonner";
import {
    loginFunc,
    createCategoryFunc,
    updateCategoryFunc,
    deleteCategoryFunc,
    createBrandFunc,
    updateBrandFunc,
    deleteBrandFunc,
    createAdminProductFunc,
    updateAdminProductFunc,
    deleteAdminProductFunc,
} from "./apiFunc";
import { queryKeys } from "./queries";
import type {
    LoginPayload,
    CreateCategoryPayload,
    UpdateCategoryPayload,
    CreateBrandPayload,
    UpdateBrandPayload,
    CreateProductPayload,
    AdminUpdateProductPayload,
} from "./types";

// ============================================================================
// 1. Admin Authentication Mutations
// ============================================================================

/**
 * Hook for Admin Login
 */
export const useLogin = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: LoginPayload) => loginFunc(payload),
        onSuccess: (data) => {
            const token = data?.data?.token;
            if (token) {
                Cookies.set("token", token, { expires: 7, path: "/" });
                Cookies.set("accessToken", token, { expires: 7, path: "/" });
                localStorage.setItem("accessToken", token);
                localStorage.setItem("token", token);
            }

            const admin = data?.data?.admin;
            if (admin) {
                Cookies.set("userData", JSON.stringify(admin), {
                    expires: 7,
                    path: "/",
                });
                localStorage.setItem("userData", JSON.stringify(admin));
            }

            queryClient.invalidateQueries({ queryKey: queryKeys.userInfo });
            queryClient.invalidateQueries({ queryKey: queryKeys.adminMe });

            toast.success(data?.message || "Admin login successful");
        },
        onError: (err: any) => {
            toast.error(
                err?.response?.data?.message ||
                    err?.message ||
                    "Invalid email or password",
            );
        },
    });
};

// ============================================================================
// 2. Categories Mutations (Admin)
// ============================================================================

/**
 * Hook to create a category
 */
export const useCreateCategory = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: CreateCategoryPayload) =>
            createCategoryFunc(payload),
        onSuccess: (data) => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.adminCategories,
            });
            queryClient.invalidateQueries({
                queryKey: queryKeys.publicCategories,
            });
            toast.success(data?.message || "Category created successfully");
        },
        onError: (err: any) => {
            toast.error(
                err?.response?.data?.message ||
                    err?.message ||
                    "Failed to create category",
            );
        },
    });
};

/**
 * Hook to update a category
 */
export const useUpdateCategory = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            categoryId,
            payload,
        }: {
            categoryId: string;
            payload: UpdateCategoryPayload;
        }) => updateCategoryFunc(categoryId, payload),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.adminCategories,
            });
            queryClient.invalidateQueries({
                queryKey: queryKeys.adminCategory(variables.categoryId),
            });
            queryClient.invalidateQueries({
                queryKey: queryKeys.publicCategories,
            });
            toast.success(data?.message || "Category updated successfully");
        },
        onError: (err: any) => {
            toast.error(
                err?.response?.data?.message ||
                    err?.message ||
                    "Failed to update category",
            );
        },
    });
};

/**
 * Hook to delete a category
 */
export const useDeleteCategory = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (categoryId: string) => deleteCategoryFunc(categoryId),
        onSuccess: (data) => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.adminCategories,
            });
            queryClient.invalidateQueries({
                queryKey: queryKeys.publicCategories,
            });
            toast.success(data?.message || "Category deleted successfully");
        },
        onError: (err: any) => {
            toast.error(
                err?.response?.data?.message ||
                    err?.message ||
                    "Failed to delete category",
            );
        },
    });
};

// ============================================================================
// 3. Brands Mutations (Admin)
// ============================================================================

/**
 * Hook to create a brand
 */
export const useCreateBrand = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: CreateBrandPayload) => createBrandFunc(payload),
        onSuccess: (data) => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.adminBrands,
            });
            queryClient.invalidateQueries({
                queryKey: queryKeys.publicBrands,
            });
            toast.success(data?.message || "Brand created successfully");
        },
        onError: (err: any) => {
            toast.error(
                err?.response?.data?.message ||
                    err?.message ||
                    "Failed to create brand",
            );
        },
    });
};

/**
 * Hook to update a brand
 */
export const useUpdateBrand = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            brandId,
            payload,
        }: {
            brandId: string;
            payload: UpdateBrandPayload;
        }) => updateBrandFunc(brandId, payload),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.adminBrands,
            });
            queryClient.invalidateQueries({
                queryKey: queryKeys.adminBrand(variables.brandId),
            });
            queryClient.invalidateQueries({
                queryKey: queryKeys.publicBrands,
            });
            toast.success(data?.message || "Brand updated successfully");
        },
        onError: (err: any) => {
            toast.error(
                err?.response?.data?.message ||
                    err?.message ||
                    "Failed to update brand",
            );
        },
    });
};

/**
 * Hook to delete a brand
 */
export const useDeleteBrand = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (brandId: string) => deleteBrandFunc(brandId),
        onSuccess: (data) => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.adminBrands,
            });
            queryClient.invalidateQueries({
                queryKey: queryKeys.publicBrands,
            });
            toast.success(data?.message || "Brand deleted successfully");
        },
        onError: (err: any) => {
            toast.error(
                err?.response?.data?.message ||
                    err?.message ||
                    "Failed to delete brand",
            );
        },
    });
};

// ============================================================================
// 4. Products Mutations (Admin)
// ============================================================================

/**
 * Hook to create a product (Admin)
 */
export const useCreateAdminProduct = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: CreateProductPayload) =>
            createAdminProductFunc(payload),
        onSuccess: (data) => {
            queryClient.invalidateQueries({
                queryKey: ["admin", "products"],
            });
            queryClient.invalidateQueries({
                queryKey: ["products"],
            });
            toast.success(data?.message || "Product created successfully");
        },
        onError: (err: any) => {
            toast.error(
                err?.response?.data?.message ||
                    err?.message ||
                    "Failed to create product",
            );
        },
    });
};

/**
 * Hook to update product in a single request (Admin Edit Product)
 */
export const useUpdateAdminProduct = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            productId,
            payload,
        }: {
            productId: string;
            payload: AdminUpdateProductPayload;
        }) => updateAdminProductFunc(productId, payload),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({
                queryKey: ["admin", "products"],
            });
            queryClient.invalidateQueries({
                queryKey: queryKeys.adminProduct(variables.productId),
            });
            queryClient.invalidateQueries({
                queryKey: ["products"],
            });
            toast.success(data?.message || "Product updated successfully");
        },
        onError: (err: any) => {
            toast.error(
                err?.response?.data?.message ||
                    err?.message ||
                    "Failed to update product",
            );
        },
    });
};

/**
 * Hook to delete a product (Admin)
 */
export const useDeleteAdminProduct = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (productId: string) => deleteAdminProductFunc(productId),
        onSuccess: (data) => {
            queryClient.invalidateQueries({
                queryKey: ["admin", "products"],
            });
            queryClient.invalidateQueries({
                queryKey: ["products"],
            });
            toast.success(data?.message || "Product deleted successfully");
        },
        onError: (err: any) => {
            toast.error(
                err?.response?.data?.message ||
                    err?.message ||
                    "Failed to delete product",
            );
        },
    });
};

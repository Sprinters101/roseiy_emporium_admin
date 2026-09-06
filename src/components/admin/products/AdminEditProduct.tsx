import React, { useState, useRef, useEffect, useMemo } from "react";
import { ArrowLeft, CloudUpload, X, Info, Loader2 } from "lucide-react";
import { useNavigate, useParams } from "react-router";
import { products } from "@/lib/site_data";
import type { Product } from "@/config/types";
import { CustomDropdown } from "@/components/common/CustomDropdown";
import { CustomInput } from "@/components/common/CustomInput";
import { CustomPriceInput } from "@/components/common/CustomPriceInput";
import { toast } from "@/components/ui/sonner";
import {
    useGetAdminBrands,
    useGetAdminCategories,
    useGetAdminProduct,
} from "@/service/queries";
import { useUpdateAdminProduct } from "@/service/mutations";
import { uploadImageToCloudinary } from "@/lib/cloudinary";
import type { SellingUnit, ProductImage } from "@/service/types";

const CATEGORY_OPTIONS = [
    { label: "Whiskey", value: "Whiskey" },
    { label: "Cognac", value: "Cognac" },
    { label: "Tequila", value: "Tequila" },
    { label: "Champagne", value: "Champagne" },
    { label: "Bottled Water", value: "Bottled Water" },
    { label: "Gin", value: "Gin" },
    { label: "Sweetwine", value: "Sweetwine" },
    { label: "Rum", value: "Rum" },
    { label: "Beer", value: "Beer" },
];

const BRAND_OPTIONS = [
    { label: "Don Julio", value: "Don Julio" },
    { label: "Bacardi", value: "Bacardi" },
    { label: "Moet & Chandon", value: "Moet & Chandon" },
    { label: "Hennessy", value: "Hennessy" },
    { label: "Azul", value: "Azul" },
    { label: "Glenfiddich", value: "Glenfiddich" },
    { label: "Voss", value: "Voss" },
    { label: "Bombay", value: "Bombay" },
    { label: "Four Cousins", value: "Four Cousins" },
];

interface ImageItem {
    id: string;
    url: string;
    name: string;
    isUploading?: boolean;
}

export const AdminEditProduct: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { data: categoriesResponse } = useGetAdminCategories();
    const categoryOptions = useMemo(() => {
        const apiCategories = categoriesResponse?.data?.categories || [];
        if (apiCategories.length > 0) {
            return apiCategories.map((c) => ({
                label: c.name,
                value: c.name,
            }));
        }
        return CATEGORY_OPTIONS;
    }, [categoriesResponse]);

    const { data: brandsResponse } = useGetAdminBrands();
    const brandOptions = useMemo(() => {
        const apiBrands = brandsResponse?.data?.brands || [];
        if (apiBrands.length > 0) {
            return apiBrands.map((b) => ({
                label: b.name,
                value: b.name,
            }));
        }
        return BRAND_OPTIONS;
    }, [brandsResponse]);

    const { data: productDetailResponse } = useGetAdminProduct(id || "");
    const { mutate: updateProduct, isPending: isUpdating } =
        useUpdateAdminProduct();

    const [currentProduct, setCurrentProduct] = useState<Product | null>(null);

    // Form state
    const [name, setName] = useState("");
    const [size, setSize] = useState("");
    const [category, setCategory] = useState("");
    const [brand, setBrand] = useState("");
    const [images, setImages] = useState<ImageItem[]>([]);
    const [priceInPieces, setPriceInPieces] = useState("");
    const [priceInCases, setPriceInCases] = useState("");
    const [piecesLeft, setPiecesLeft] = useState("");
    const [casesLeft, setCasesLeft] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isUploadingAny = useMemo(
        () => images.some((img) => img.isUploading),
        [images],
    );

    // Load initial product data
    useEffect(() => {
        const apiItem = productDetailResponse?.data?.product;
        if (apiItem) {
            setName(apiItem.name || "");
            setSize(apiItem.description?.replace("Volume: ", "") || "750ml");
            setCategory(apiItem.category?.name || "Whiskey");
            setBrand(apiItem.brand?.name || "Glenfiddich");

            const pieceUnit =
                apiItem.sellingUnits?.find(
                    (u: SellingUnit) =>
                        u.name?.toLowerCase() === "piece" ||
                        u.name?.toLowerCase() === "pieces" ||
                        u.name?.toLowerCase() === "bottle" ||
                        u.name?.toLowerCase() === "bottles",
                ) || apiItem.sellingUnits?.[0];

            const caseUnit = apiItem.sellingUnits?.find(
                (u: SellingUnit) =>
                    u.name?.toLowerCase() === "case" ||
                    u.name?.toLowerCase() === "cases" ||
                    u.name?.toLowerCase() === "carton" ||
                    u.name?.toLowerCase() === "cartons",
            );

            setPriceInPieces(pieceUnit?.price ? String(pieceUnit.price) : "");
            setPriceInCases(caseUnit?.price ? String(caseUnit.price) : "");
            setPiecesLeft(
                pieceUnit?.stock !== undefined ? String(pieceUnit.stock) : "",
            );
            setCasesLeft(
                caseUnit?.stock !== undefined ? String(caseUnit.stock) : "",
            );

            if (apiItem.images && apiItem.images.length > 0) {
                setImages(
                    apiItem.images.map((img: ProductImage, idx: number) => ({
                        id: img.productImageId || `img-${idx}`,
                        url: img.imageUrl,
                        name: `Image ${idx + 1}.png`,
                    })),
                );
            }
            return;
        }

        const found = products.find((p) => p.id === id);
        if (found) {
            setCurrentProduct(found);
            setName(found.name || "");
            setSize(found.volume || "");
            setCategory(found.category || "Whiskey");
            setBrand(found.brand || "Glenfiddich");
            setPriceInPieces(found.price ? String(found.price) : "");
            setPriceInCases(
                found.casePrice
                    ? String(found.casePrice)
                    : found.priceInCases
                    ? String(found.priceInCases)
                    : "",
            );
            setPiecesLeft(
                found.piecesLeft !== undefined ? String(found.piecesLeft) : "",
            );
            setCasesLeft(
                found.casesLeft !== undefined ? String(found.casesLeft) : "",
            );

            const initialImgs: ImageItem[] = [];
            if (found.image) {
                initialImgs.push({
                    id: "cover-img",
                    url: found.image,
                    name: "Image 1.png",
                });
            }
            if (found.gallery) {
                found.gallery.forEach((url, idx) => {
                    if (url !== found.image) {
                        initialImgs.push({
                            id: `gallery-img-${idx}`,
                            url,
                            name: `Image ${initialImgs.length + 1}.png`,
                        });
                    }
                });
            }
            setImages(initialImgs);
        } else {
            // Default demo fallback if ID not in standard array
            setName("Glenfiddich Single Scotch");
            setSize("75cl");
            setCategory("Whiskey");
            setBrand("Glenfiddich");
            setPriceInPieces("75000");
            setPriceInCases("450000");
            setPiecesLeft("37");
            setCasesLeft("0");
            setImages([
                {
                    id: "demo-img",
                    url: "https://res.cloudinary.com/dzk1a6bjt/image/upload/v1784813212/p_5_ohp3t7.png",
                    name: "Image 1.png",
                },
            ]);
        }
    }, [id, productDetailResponse]);

    const handleBack = () => {
        navigate("/products");
    };

    // Handle Image upload to Cloudinary
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const filesToUpload = Array.from(e.target.files);
            // Reset the file input so selecting the same file again triggers change
            e.target.value = "";

            for (const file of filesToUpload) {
                const tempId = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
                const localPreview = URL.createObjectURL(file);

                // Add placeholder with local preview while uploading to Cloudinary
                setImages((prev) => [
                    ...prev,
                    {
                        id: tempId,
                        url: localPreview,
                        name: file.name,
                        isUploading: true,
                    },
                ]);

                try {
                    const cloudinaryUrl = await uploadImageToCloudinary(file);
                    setImages((prev) =>
                        prev.map((img) =>
                            img.id === tempId
                                ? { ...img, url: cloudinaryUrl, isUploading: false }
                                : img,
                        ),
                    );
                    URL.revokeObjectURL(localPreview);
                } catch (err: any) {
                    toast.error(
                        `Failed to upload ${file.name}: ${err?.message || "Cloudinary error"}`,
                    );
                    setImages((prev) => prev.filter((img) => img.id !== tempId));
                    URL.revokeObjectURL(localPreview);
                }
            }
        }
    };

    const handleRemoveImage = (imgId: string) => {
        setImages((prev) => prev.filter((img) => img.id !== imgId));
    };

    // Save changes handler
    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();

        if (isUploadingAny) {
            toast.error(
                "Please wait for all images to finish uploading before saving changes",
            );
            return;
        }

        if (!name.trim()) {
            toast.error("Please enter a product name");
            return;
        }

        const piecesPriceNum = Number(priceInPieces.replace(/,/g, ""));
        if (!priceInPieces || piecesPriceNum <= 0) {
            toast.error("Please enter a valid selling price in pieces");
            return;
        }

        setIsSubmitting(true);

        const apiCategories = categoriesResponse?.data?.categories || [];
        const matchedCategory = apiCategories.find(
            (c) =>
                c.name.toLowerCase() === category.toLowerCase() ||
                c.categoryId === category,
        );
        const categoryId =
            matchedCategory?.categoryId || apiCategories[0]?.categoryId;

        const apiBrands = brandsResponse?.data?.brands || [];
        const matchedBrand = apiBrands.find(
            (b) =>
                b.name.toLowerCase() === brand.toLowerCase() ||
                b.brandId === brand,
        );
        const brandId = matchedBrand?.brandId || apiBrands[0]?.brandId;

        const updatedPieces = piecesLeft ? Number(piecesLeft.replace(/,/g, "")) : 0;
        const updatedCases = casesLeft ? Number(casesLeft.replace(/,/g, "")) : 0;
        const casePriceNum = priceInCases ? Number(priceInCases.replace(/,/g, "")) : 0;
        const updatedStatus =
            updatedPieces > 0 || updatedCases > 0 ? "Available" : "Out of Stock";

        const apiItem = productDetailResponse?.data?.product;
        const existingPieceUnit = apiItem?.sellingUnits?.find(
            (u: SellingUnit) =>
                u.name?.toLowerCase() === "piece" ||
                u.name?.toLowerCase() === "pieces" ||
                u.name?.toLowerCase() === "bottle" ||
                u.name?.toLowerCase() === "bottles",
        ) || apiItem?.sellingUnits?.[0];

        const existingCaseUnit = apiItem?.sellingUnits?.find(
            (u: SellingUnit) =>
                u.name?.toLowerCase() === "case" ||
                u.name?.toLowerCase() === "cases" ||
                u.name?.toLowerCase() === "carton" ||
                u.name?.toLowerCase() === "cartons",
        );

        const sellingUnits = [
            {
                sellingUnitId: existingPieceUnit?.sellingUnitId,
                name: "Piece",
                price: piecesPriceNum,
                stock: updatedPieces,
                status: "active",
            },
        ];

        if (casePriceNum > 0) {
            sellingUnits.push({
                sellingUnitId: existingCaseUnit?.sellingUnitId,
                name: "Carton",
                price: casePriceNum,
                stock: updatedCases,
                status: "active",
            });
        }

        const fallbackImage =
            "https://res.cloudinary.com/dzk1a6bjt/image/upload/v1784813212/p_5_ohp3t7.png";
        const productImages =
            images.length > 0
                ? images.map((img, idx) => ({
                      imageUrl: img.url,
                      altText: name.trim(),
                      isPrimary: idx === 0,
                      sortOrder: idx,
                  }))
                : [
                      {
                          imageUrl: fallbackImage,
                          altText: name.trim(),
                          isPrimary: true,
                          sortOrder: 0,
                      },
                  ];

        const updatedProduct: Product = {
            id: id || String(Date.now()),
            name: name.trim(),
            category: category || "Whiskey",
            brand: brand || "Roseiy Collection",
            volume: size || "750ml",
            price: piecesPriceNum,
            casePrice: casePriceNum > 0 ? casePriceNum : undefined,
            priceInCases: casePriceNum > 0 ? casePriceNum : undefined,
            piecesLeft: updatedPieces,
            casesLeft: updatedCases,
            status: updatedStatus,
            image:
                images.length > 0
                    ? images[0].url
                    : currentProduct?.image || fallbackImage,
            gallery: images.map((img) => img.url),
            isFeatured: currentProduct?.isFeatured || false,
        };

        if (!id) {
            setIsSubmitting(false);
            toast.error("Product ID is missing");
            return;
        }

        if (!categoryId) {
            setIsSubmitting(false);
            toast.error("Please select a valid category");
            return;
        }

        updateProduct(
            {
                productId: id,
                payload: {
                    name: name.trim(),
                    description: size ? `Volume: ${size}` : undefined,
                    categoryId,
                    brandId: brandId || undefined,
                    status:
                        updatedPieces > 0 || updatedCases > 0
                            ? "active"
                            : "inactive",
                    sellingUnits,
                    images: productImages,
                },
            },
            {
                onSuccess: () => {
                    // Update in global catalog array if applicable
                    const idx = products.findIndex((p) => p.id === id);
                    if (idx !== -1) {
                        products[idx] = updatedProduct;
                    }
                    setIsSubmitting(false);
                    toast.success("Product updated successfully!");
                    handleBack();
                },
                onError: (err: any) => {
                    setIsSubmitting(false);
                    const errMsg =
                        err?.response?.data?.message ||
                        err?.message ||
                        "Failed to update product. Please check the details and try again.";
                    toast.error(errMsg);
                    // Remain on the edit product page so user can fix and retry
                },
            },
        );
    };

    // Numeric formatting for preview price
    const formattedPrice = priceInPieces
        ? Number(priceInPieces.replace(/,/g, "")).toLocaleString("en-NG")
        : "0";

    // Subtitle detail for preview card
    const previewDetails = [
        size ? size : "Size",
        piecesLeft ? `${piecesLeft} Pieces Left` : "Quantity In Pieces",
        casesLeft ? `${casesLeft} Cases Left` : "Quantity In Cases",
    ].join(" • ");

    return (
        <div className="space-y-6 animate-fadeIn pb-12">
            {/* Header with Back Button */}
            <div>
                <button
                    type="button"
                    onClick={handleBack}
                    className="p-1 rounded-md text-[#171717] hover:bg-[#EAEAEA] transition-colors cursor-pointer mb-2 inline-flex items-center"
                    aria-label="Go back"
                >
                    <ArrowLeft className="size-5" />
                </button>
                <h1 className="text-2xl sm:text-3xl font-bold font-playfair text-[#171717]">
                    Edit Product
                </h1>
                <p className="text-xs sm:text-sm text-[#737373] font-hanken mt-1">
                    Update the details below to edit this product in your catalogue
                </p>
            </div>

            {/* 2-Column Responsive Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left Column: Form Cards */}
                <form onSubmit={handleSave} className="lg:col-span-8 space-y-6">
                    {/* 1. Basic Information */}
                    <div className="bg-white border border-[#EAEAEA] rounded-2xl p-6 sm:p-7 shadow-xs">
                        <div className="flex items-center gap-3">
                            <span className="size-6 rounded-full bg-[#B8860B] text-white flex items-center justify-center text-xs font-bold shrink-0">
                                1
                            </span>
                            <h2 className="text-base sm:text-lg font-bold text-[#171717]">
                                Basic Information
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-5">
                            <CustomInput
                                name="name"
                                label="Product Name"
                                placeholder="e.g Clase Azul"
                                variant="light"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />

                            <CustomInput
                                name="size"
                                label="Size"
                                placeholder="e.g 50cl"
                                variant="light"
                                value={size}
                                onChange={(e) => setSize(e.target.value)}
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-5">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs sm:text-sm font-semibold text-[#171717]">
                                    Category
                                </label>
                                <CustomDropdown
                                    variant="light"
                                    placeholder="Select Category"
                                    options={categoryOptions}
                                    value={category}
                                    onChange={setCategory}
                                />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs sm:text-sm font-semibold text-[#171717]">
                                    Brand
                                </label>
                                <CustomDropdown
                                    variant="light"
                                    placeholder="Select Brand"
                                    options={brandOptions}
                                    value={brand}
                                    onChange={setBrand}
                                />
                            </div>
                        </div>
                    </div>

                    {/* 2. Product Images */}
                    <div className="bg-white border border-[#EAEAEA] rounded-2xl p-6 sm:p-7 shadow-xs">
                        <div className="flex items-center gap-3">
                            <span className="size-6 rounded-full bg-[#B8860B] text-white flex items-center justify-center text-xs font-bold shrink-0">
                                2
                            </span>
                            <div>
                                <h2 className="text-base sm:text-lg font-bold text-[#171717]">
                                    Product Images
                                </h2>
                                <p className="text-xs text-[#888888] mt-0.5">
                                    The first image will be used as the cover
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 mt-5">
                            {/* Upload Area */}
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="border-2 border-dashed border-[#E5C158] bg-[#FDFBF7] hover:bg-[#FAF6EC] rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors w-60 h-36 text-center select-none"
                            >
                                <CloudUpload className="size-7 text-[#D4AF37]" />
                                <span className="text-xs sm:text-sm font-bold text-[#171717] mt-2">
                                    Upload Images
                                </span>
                                <span className="text-[11px] text-[#888888] mt-1">
                                    Drag & drop images here or click to browse
                                </span>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                            </div>

                            {/* Uploaded Images List */}
                            {images.map((img) => (
                                <div
                                    key={img.id}
                                    className="flex flex-col items-center group relative"
                                >
                                    <div className="size-36 rounded-2xl bg-[#F9F7F2] border border-[#EEEEEE] p-3 flex items-center justify-center relative overflow-hidden">
                                        <img
                                            src={img.url}
                                            alt={img.name}
                                            className="max-h-full max-w-full object-contain"
                                        />
                                        {img.isUploading ? (
                                            <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px] flex flex-col items-center justify-center text-white z-10">
                                                <Loader2 className="size-5 animate-spin text-[#D4AF37]" />
                                                <span className="text-[10px] font-medium mt-1">
                                                    Uploading...
                                                </span>
                                            </div>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleRemoveImage(img.id)
                                                }
                                                className="size-5 rounded-full bg-white text-red-500 shadow-sm flex items-center justify-center hover:bg-red-50 cursor-pointer absolute top-2 right-2 transition-transform z-10"
                                                title="Remove image"
                                            >
                                                <X className="size-3.5" />
                                            </button>
                                        )}
                                    </div>
                                    <span className="text-[11px] text-[#737373] mt-1.5 truncate max-w-[120px] text-center">
                                        {img.name}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 3. Pricing with CustomPriceInput */}
                    <div className="bg-white border border-[#EAEAEA] rounded-2xl p-6 sm:p-7 shadow-xs">
                        <div className="flex items-center gap-3">
                            <span className="size-6 rounded-full bg-[#B8860B] text-white flex items-center justify-center text-xs font-bold shrink-0">
                                3
                            </span>
                            <h2 className="text-base sm:text-lg font-bold text-[#171717]">
                                Pricing
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-5">
                            <CustomPriceInput
                                label="Selling Price in Pieces"
                                placeholder="80,000"
                                value={priceInPieces}
                                onChange={(formatted) => setPriceInPieces(formatted)}
                            />

                            <CustomPriceInput
                                label="Selling Price in Cases"
                                placeholder="80,000"
                                value={priceInCases}
                                onChange={(formatted) => setPriceInCases(formatted)}
                            />
                        </div>
                    </div>

                    {/* 4. Inventory */}
                    <div className="bg-white border border-[#EAEAEA] rounded-2xl p-6 sm:p-7 shadow-xs">
                        <div className="flex items-center gap-3">
                            <span className="size-6 rounded-full bg-[#B8860B] text-white flex items-center justify-center text-xs font-bold shrink-0">
                                4
                            </span>
                            <h2 className="text-base sm:text-lg font-bold text-[#171717]">
                                Inventory
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-5">
                            <CustomInput
                                name="piecesLeft"
                                type="number"
                                label="Quantity In Pieces"
                                placeholder="Enter Quantity In Pieces"
                                variant="light"
                                value={piecesLeft}
                                onChange={(e) => setPiecesLeft(e.target.value)}
                            />

                            <CustomInput
                                name="casesLeft"
                                type="number"
                                label="Quantity In Cases"
                                placeholder="Enter Quantity In Cases"
                                variant="light"
                                value={casesLeft}
                                onChange={(e) => setCasesLeft(e.target.value)}
                            />
                        </div>
                    </div>
                </form>

                {/* Right Column: Product Preview Card */}
                <div className="lg:col-span-4 sticky top-6 self-start space-y-4">
                    <div className="bg-white border border-[#EAEAEA] rounded-2xl p-6 shadow-xs">
                        <h3 className="text-base font-bold text-[#171717]">
                            Product Preview
                        </h3>
                        <p className="text-xs text-[#737373] mt-0.5">
                            Your product will appear here as you complete the form.
                        </p>

                        {/* Image Preview Box */}
                        <div className="bg-[#FAF8F5] rounded-2xl flex items-center justify-center p-6 my-5 aspect-square relative overflow-hidden">
                            {images.length > 0 ? (
                                <div className="relative w-full h-full flex items-center justify-center">
                                    <img
                                        src={images[0].url}
                                        alt={name || "Product Preview"}
                                        className="max-h-full max-w-full object-contain animate-fadeIn"
                                    />
                                    {images[0].isUploading && (
                                        <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] rounded-2xl flex flex-col items-center justify-center text-white z-10">
                                            <Loader2 className="size-6 animate-spin text-[#D4AF37]" />
                                            <span className="text-xs font-medium mt-1">
                                                Uploading to Cloudinary...
                                            </span>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                /* Line-art image placeholder */
                                <svg
                                    viewBox="0 0 160 160"
                                    className="size-36 stroke-[#E5C158] fill-none"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <rect
                                        x="20"
                                        y="20"
                                        width="120"
                                        height="120"
                                        rx="28"
                                        ry="28"
                                    />
                                    <circle cx="110" cy="55" r="10" />
                                    <path d="M20 105 C55 105, 75 125, 105 138" />
                                    <path d="M55 138 C80 120, 105 110, 140 125" />
                                </svg>
                            )}
                        </div>

                        {/* Information Preview */}
                        <div>
                            <span className="text-[11px] font-bold tracking-wider text-[#D4AF37] uppercase block">
                                {category ? category : "CATEGORY"}
                            </span>

                            <h4 className="text-xl font-bold font-playfair text-[#171717] mt-1 truncate">
                                {name ? name : "Product Name"}
                            </h4>

                            <p className="text-xs text-[#737373] mt-1 truncate">
                                {previewDetails}
                            </p>

                            <div className="text-2xl font-bold font-playfair text-[#D4AF37] mt-3">
                                ₦{formattedPrice}
                            </div>
                        </div>

                        {/* Save Changes Button */}
                        <button
                            type="button"
                            disabled={isSubmitting || isUpdating || isUploadingAny}
                            onClick={handleSave}
                            className="w-full bg-[#D4AF37] hover:bg-[#C5A265] text-white font-semibold py-3.5 rounded-xl transition-all shadow-xs cursor-pointer text-sm mt-6 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isSubmitting || isUpdating ? (
                                <>
                                    <Loader2 className="size-4 animate-spin" />
                                    <span>Saving Changes...</span>
                                </>
                            ) : isUploadingAny ? (
                                <>
                                    <Loader2 className="size-4 animate-spin" />
                                    <span>Uploading Images...</span>
                                </>
                            ) : (
                                <span>Save Changes</span>
                            )}
                        </button>

                        <div className="text-[11px] text-[#737373] flex items-center justify-center gap-1.5 mt-3 text-center">
                            <Info className="size-3.5 text-[#D4AF37] shrink-0" />
                            <span>
                                Changes will be immediately reflected in your catalogue
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminEditProduct;

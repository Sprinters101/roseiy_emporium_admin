import React, { useEffect } from "react";
import { Trash2, AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CustomConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    description?: React.ReactNode;
    itemName?: string;
    confirmText?: string;
    cancelText?: string;
    disclaimer?: string;
    variant?: "danger" | "warning" | "info" | "success";
    isLoading?: boolean;
    icon?: React.ReactNode;
    className?: string;
}

export const CustomConfirmModal: React.FC<CustomConfirmModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    itemName,
    confirmText = "Delete",
    cancelText = "Cancel",
    disclaimer = "Deleted products won't be shown to customers",
    variant = "danger",
    isLoading = false,
    icon,
    className,
}) => {
    // Handle Escape key to close
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isOpen && !isLoading) {
                onClose();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, isLoading, onClose]);

    if (!isOpen) return null;

    // Default icon based on variant
    const renderIcon = () => {
        if (icon) return icon;

        switch (variant) {
            case "danger":
                return (
                    <div className="size-[4.375rem] rounded-full bg-[#FDF2F2] flex items-center justify-center mx-auto mb-4">
                        <Trash2
                            className="size-10 text-[#DC2626]"
                            strokeWidth={2}
                        />
                    </div>
                );
            case "warning":
                return (
                    <div className="size-[4.375rem] rounded-full bg-[#FEF9EE] flex items-center justify-center mx-auto mb-4">
                        <AlertTriangle
                            className="size-10 text-[#D4AF37]"
                            strokeWidth={2}
                        />
                    </div>
                );
            case "success":
                return (
                    <div className="size-[4.375rem] rounded-full bg-[#EBF7EE] flex items-center justify-center mx-auto mb-4">
                        <CheckCircle2
                            className="size-10 text-[#10B981]"
                            strokeWidth={2}
                        />
                    </div>
                );
            default:
                return (
                    <div className="size-[4.375rem] rounded-full bg-[#F5F5F5] flex items-center justify-center mx-auto mb-4">
                        <Info
                            className="size-10 text-[#171717]"
                            strokeWidth={2}
                        />
                    </div>
                );
        }
    };

    // Default title
    const resolvedTitle =
        title ||
        (variant === "danger"
            ? `Delete ${itemName || "Product"}?`
            : "Confirm Action?");

    // Default description
    const resolvedDescription =
        description ||
        (variant === "danger" ? (
            <>
                You're about to permanently delete{" "}
                <span className="font-semibold text-[#171717]">
                    {itemName || "this item"}
                </span>
                . This action cannot be undone.
            </>
        ) : (
            "Are you sure you want to proceed with this action?"
        ));

    // Confirm button styles based on variant
    const getConfirmBtnClass = () => {
        switch (variant) {
            case "danger":
                return "bg-[#B91C1C] hover:bg-[#991B1B] text-white";
            case "warning":
                return "bg-[#D4AF37] hover:bg-[#C5A265] text-white";
            case "success":
                return "bg-[#10B981] hover:bg-[#059669] text-white";
            default:
                return "bg-[#171717] hover:bg-[#262626] text-white";
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
            {/* Modal Body Card */}
            <div
                className={cn(
                    "bg-white rounded-lg p-8 max-w-sm sm:max-w-[25rem] w-full text-center shadow-2xl animate-scaleUp relative border border-[#EAEAEA]",
                    className,
                )}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header Icon */}
                {renderIcon()}

                {/* Title */}
                <h3 className="text-lg sm:text-xl font-bold text-[#171717] tracking-tight">
                    {resolvedTitle}
                </h3>

                {/* Subtitle / Description */}
                <p className="text-xs sm:text-sm text-[#737373] mt-2.5 max-w-xs mx-auto leading-relaxed">
                    {resolvedDescription}
                </p>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3.5 mt-6">
                    <button
                        type="button"
                        disabled={isLoading}
                        onClick={onClose}
                        className="w-full border border-[#D5D5D5] bg-white hover:bg-[#FAF7F2] text-[#171717] font-semibold py-2.5 px-4 rounded-md text-xs sm:text-sm transition-colors cursor-pointer disabled:opacity-50"
                    >
                        {cancelText}
                    </button>

                    <button
                        type="button"
                        disabled={isLoading}
                        onClick={onConfirm}
                        className={cn(
                            "w-full font-semibold py-2.5 px-4 rounded-md text-xs sm:text-sm transition-all cursor-pointer shadow-xs disabled:opacity-50",
                            getConfirmBtnClass(),
                        )}
                    >
                        {isLoading ? "Deleting..." : confirmText}
                    </button>
                </div>

                {/* Bottom Disclaimer */}
                {disclaimer && (
                    <div className="text-[11px] text-[#888888] flex items-center justify-center gap-1.5 mt-4">
                        <Info className="size-3.5 text-[#D4AF37] shrink-0" />
                        <span>{disclaimer}</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export const CustomDeleteModal = CustomConfirmModal;
export default CustomConfirmModal;

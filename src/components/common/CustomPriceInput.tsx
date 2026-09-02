import React, { useRef } from "react";
import { cn } from "@/lib/utils";

export interface CustomPriceInputProps {
    label?: string;
    value: string | number;
    onChange: (formattedValue: string, rawNumericValue: number) => void;
    placeholder?: string;
    currencySymbol?: string;
    error?: string;
    disabled?: boolean;
    required?: boolean;
    name?: string;
    className?: string;
    containerClassName?: string;
    allowDecimals?: boolean;
    autoFocus?: boolean;
}

export const formatPriceNumber = (val: string | number): string => {
    if (val === undefined || val === null || val === "") return "";
    const clean = String(val).replace(/[^0-9]/g, "");
    if (!clean) return "";
    return Number(clean).toLocaleString("en-US");
};

export const CustomPriceInput: React.FC<CustomPriceInputProps> = ({
    label,
    value,
    onChange,
    placeholder = "80,000",
    currencySymbol = "₦",
    error,
    disabled = false,
    required = false,
    name,
    className,
    containerClassName,
    allowDecimals = false,
    autoFocus = false,
}) => {
    const inputRef = useRef<HTMLInputElement>(null);

    const displayValue = React.useMemo(() => {
        if (value === undefined || value === null || value === "") return "";
        return formatPriceNumber(value);
    }, [value]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const input = e.target;
        const rawVal = input.value;
        const oldCursorPos = input.selectionStart || 0;
        const prevLen = rawVal.length;

        // Clean digits
        const numericString = rawVal.replace(/[^0-9]/g, "");
        const rawNumeric = numericString ? Number(numericString) : 0;
        const formatted = numericString ? Number(numericString).toLocaleString("en-US") : "";

        onChange(formatted, rawNumeric);

        // Adjust cursor position so cursor doesn't jump to the end
        requestAnimationFrame(() => {
            if (inputRef.current) {
                const newLen = formatted.length;
                const diff = newLen - prevLen;
                const newPos = Math.max(0, oldCursorPos + diff);
                inputRef.current.setSelectionRange(newPos, newPos);
            }
        });
    };

    return (
        <div className={cn("flex flex-col gap-1.5", containerClassName)}>
            {label && (
                <label className="text-xs sm:text-sm font-semibold text-[#171717] block">
                    {label}
                    {required && <span className="text-red-500 ml-0.5">*</span>}
                </label>
            )}

            <div
                className={cn(
                    "flex items-center border rounded-xl px-3.5 py-2.5 sm:py-3 bg-white transition-all",
                    disabled
                        ? "bg-[#FAFAFA] border-[#E5E5E5] text-[#888888] cursor-not-allowed"
                        : error
                        ? "border-red-500 ring-1 ring-red-500/20"
                        : "border-[#E5E5E5] hover:border-[#D5D5D5] focus-within:border-[#D4AF37] focus-within:ring-1 focus-within:ring-[#D4AF37]/20",
                    className,
                )}
            >
                <span className="text-sm font-bold text-[#171717] select-none shrink-0">
                    {currencySymbol}
                </span>
                <span className="text-[#D5D5D5] mx-2.5 select-none shrink-0">
                    |
                </span>
                <input
                    ref={inputRef}
                    type="text"
                    inputMode="numeric"
                    autoFocus={autoFocus}
                    disabled={disabled}
                    required={required}
                    name={name}
                    value={displayValue}
                    onChange={handleInputChange}
                    placeholder={placeholder}
                    className="w-full text-xs sm:text-sm font-medium outline-none placeholder:text-[#AAAAAA] bg-transparent text-[#171717] disabled:cursor-not-allowed"
                />
            </div>

            {error && (
                <span className="text-xs text-red-500 mt-0.5">{error}</span>
            )}
        </div>
    );
};

export default CustomPriceInput;

import { ChevronDown, Check } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export interface DropdownOption {
    label: string;
    value: string;
}

interface CustomDropdownProps {
    options: (DropdownOption | string)[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    variant?: "dark" | "light";
    className?: string;
    triggerClassName?: string;
    contentClassName?: string;
}

export const CustomDropdown = ({
    options,
    value,
    onChange,
    placeholder = "Select option",
    variant = "dark",
    className,
    triggerClassName,
    contentClassName,
}: CustomDropdownProps) => {
    // Normalize string[] or DropdownOption[] into unified object format
    const normalizedOptions: DropdownOption[] = options.map((opt) =>
        typeof opt === "string" ? { label: opt, value: opt } : opt,
    );

    const selectedOption = normalizedOptions.find((opt) => opt.value === value);

    const isLight = variant === "light";

    return (
        <DropdownMenu>
            <DropdownMenuTrigger
                className={cn(
                    "group relative flex w-full items-center justify-between gap-2 rounded-lg px-4 py-2.5 text-xs sm:text-sm font-hanken outline-none cursor-pointer transition-colors",
                    isLight
                        ? "border border-[#E5E5E5] bg-white text-[#171717] hover:border-[#D4AF37] focus:border-[#D4AF37] data-[state=open]:border-[#D4AF37]"
                        : "border border-neutral-800 bg-[#111111] text-white hover:border-neutral-700 focus:border-gold-500/50 data-[state=open]:border-gold-500/50",
                    triggerClassName,
                    className,
                )}
            >
                <span className="truncate">
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <ChevronDown
                    className={cn(
                        "size-4 shrink-0 transition-transform duration-200 pointer-events-none group-data-[state=open]:rotate-180",
                        isLight
                            ? "text-[#171717]"
                            : "text-neutral-400 group-data-[state=open]:text-white",
                    )}
                />
            </DropdownMenuTrigger>

            <DropdownMenuContent
                align="end"
                sideOffset={6}
                className={cn(
                    "z-50 w-full min-w-44 max-h-64 overflow-y-auto rounded-lg p-1 shadow-xl font-hanken",
                    isLight
                        ? "border border-[#E5E5E5] bg-white text-[#171717]"
                        : "border border-neutral-800 bg-[#111111] text-white",
                    contentClassName,
                )}
            >
                {normalizedOptions.map((option) => {
                    const isSelected = option.value === value;
                    return (
                        <DropdownMenuItem
                            key={option.value}
                            onClick={() => onChange(option.value)}
                            className={cn(
                                "flex w-full items-center justify-between rounded-md px-3 py-2 text-xs sm:text-sm cursor-pointer outline-none transition-colors",
                                isLight
                                    ? isSelected
                                        ? "bg-[#FAF7F2] font-semibold text-[#171717]"
                                        : "text-[#333333] hover:bg-[#FAF7F2] hover:text-[#171717] focus:bg-[#FAF7F2] focus:text-[#171717]"
                                    : isSelected
                                    ? "bg-neutral-800/80 font-medium text-white"
                                    : "text-neutral-300 hover:bg-neutral-900 hover:text-white focus:bg-neutral-900 focus:text-white",
                            )}
                        >
                            <span className="truncate">{option.label}</span>
                            {isSelected && (
                                <Check className="size-3.5 text-gold-500 shrink-0 ml-2" />
                            )}
                        </DropdownMenuItem>
                    );
                })}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

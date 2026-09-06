import { toast } from "@/components/ui/sonner";

/**
 * Standard notify utility providing quick access to toast notifications
 */
export const notify = (
    message: string,
    type: "success" | "error" | "warning" | "info" = "info",
    title?: string,
) => {
    switch (type) {
        case "success":
            toast.success(message, { title });
            break;
        case "error":
            toast.error(message, { title });
            break;
        case "warning":
            toast.warning(message, { title });
            break;
        default:
            toast.info(message, { title });
            break;
    }
};

export const CLOUDINARY_CONFIG = {
    cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "dzk1a6bjt",
    apiKey: import.meta.env.VITE_CLOUDINARY_API_KEY || "611134455337117",
    uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "eporium",
};

export interface CloudinaryUploadResponse {
    secure_url: string;
    url: string;
    public_id: string;
    asset_id: string;
    format: string;
    bytes: number;
    width: number;
    height: number;
    created_at: string;
}

/**
 * Uploads a file directly to Cloudinary using the designated upload preset.
 *
 * @param file The image File or Blob to upload
 * @returns The secure HTTPS Cloudinary URL
 */
export const uploadImageToCloudinary = async (
    file: File | Blob,
): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_CONFIG.uploadPreset);
    if (CLOUDINARY_CONFIG.apiKey) {
        formData.append("api_key", CLOUDINARY_CONFIG.apiKey);
    }

    const endpoint = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`;

    const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
            errorData?.error?.message ||
                `Cloudinary upload failed with status ${response.status}`,
        );
    }

    const data: CloudinaryUploadResponse = await response.json();
    return data.secure_url || data.url;
};

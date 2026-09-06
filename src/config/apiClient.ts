import axios, {
    type InternalAxiosRequestConfig,
    type AxiosResponse,
} from "axios";
import Cookies from "js-cookie";

// Create custom axios instance
export const apiClient = axios.create({
    baseURL:
        import.meta.env.VITE_API_BASE_URL ||
        "https://lumpy-stingily-lekisha.ngrok-free.dev/api/v1",
    headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
    },
});

// Alias for convenience across services
export const axiosInstance = apiClient;

// Helper to completely purge authentication storage
export const clearAuthStorage = () => {
    Cookies.remove("token", { path: "/" });
    Cookies.remove("token");
    Cookies.remove("accessToken", { path: "/" });
    Cookies.remove("accessToken");
    Cookies.remove("userData", { path: "/" });
    Cookies.remove("userData");
    localStorage.removeItem("token");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userData");
    localStorage.removeItem("refreshToken");
};

// Flag to track token generation lifecycle
let isRefreshing = false;
let isRedirecting = false;
let failedQueue: Array<{
    resolve: (token: string) => void;
    reject: (error: unknown) => void;
}> = [];

// Drain the queue when refresh succeeds or fails
const processQueue = (error: unknown, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else if (token) {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

// Safely redirect to login without triggering reload loops
const redirectToLogin = () => {
    clearAuthStorage();
    if (typeof window !== "undefined") {
        const isLoginPage = window.location.pathname.startsWith("/login");
        if (!isLoginPage && !isRedirecting) {
            isRedirecting = true;
            window.location.href = "/login";
        }
    }
};

/* Request Interceptor: Auto-inject access token into headers */
apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token =
            Cookies.get("token") ||
            Cookies.get("accessToken") ||
            localStorage.getItem("token") ||
            localStorage.getItem("accessToken");

        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error),
);

/* Response Interceptor: Seamless 401 interception & request retry */
apiClient.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error) => {
        const originalRequest = error.config as
            | (InternalAxiosRequestConfig & { _retry?: boolean })
            | undefined;

        if (!originalRequest) {
            return Promise.reject(error);
        }

        // Do not intercept or attempt token refresh for authentication requests
        const requestUrl = originalRequest.url || "";
        const isAuthRequest =
            requestUrl.includes("/login") ||
            requestUrl.includes("/refresh") ||
            requestUrl.includes("/register") ||
            requestUrl.includes("/forgot-password") ||
            requestUrl.includes("/reset-password");

        // Guard: Trigger refresh only on 401 errors for non-auth requests and ensure we don't loop infinitely
        if (
            error.response?.status === 401 &&
            !originalRequest._retry &&
            !isAuthRequest
        ) {
            const refreshToken = localStorage.getItem("refreshToken");

            // If there's no refresh token stored, session has expired -> redirect cleanly to login
            if (!refreshToken) {
                redirectToLogin();
                return Promise.reject(error);
            }

            // If a refresh is already in progress, queue this request until it's done
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        if (originalRequest.headers) {
                            originalRequest.headers.Authorization = `Bearer ${token}`;
                        }
                        return apiClient(originalRequest);
                    })
                    .catch((err) => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                // Call the silent refresh endpoint (using basic axios to bypass main interceptors)
                const response = await axios.post(
                    `${apiClient.defaults.baseURL}/auth/refresh`,
                    {
                        refreshToken,
                    },
                );

                const {
                    accessToken: newAccessToken,
                    refreshToken: newRefreshToken,
                } = response.data || {};

                if (newAccessToken) {
                    Cookies.set("token", newAccessToken, {
                        expires: 7,
                        path: "/",
                    });
                    Cookies.set("accessToken", newAccessToken, {
                        expires: 7,
                        path: "/",
                    });
                    localStorage.setItem("accessToken", newAccessToken);
                    localStorage.setItem("token", newAccessToken);
                }

                if (newRefreshToken) {
                    localStorage.setItem("refreshToken", newRefreshToken);
                }

                // Clear queue and retry the initial failed request
                processQueue(null, newAccessToken);
                if (newAccessToken && originalRequest.headers) {
                    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                }
                return apiClient(originalRequest);
            } catch (refreshError) {
                // Refresh token failed/expired -> Log user out completely
                processQueue(refreshError, null);
                redirectToLogin();
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    },
);

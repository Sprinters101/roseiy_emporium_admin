import React, { createContext, useContext, useState, useEffect } from "react";
import Cookies from "js-cookie";

import { getAdminMeFunc } from "@/service/apiFunc";
import type { AdminUser } from "@/service/types";

export type UserProfile =
    | AdminUser
    | {
          id?: string;
          adminId?: string;
          email?: string;
          firstName?: string;
          lastName?: string;
          role?: string;
          status?: string;
          lastLoginAt?: string;
      };

export interface AuthContextType {
    token: string | null;
    user: UserProfile | null;
    role: string;
    isAuthenticated: boolean;
    login: (token: string, userData?: UserProfile) => void;
    logout: () => void;
}

const TOKEN_KEY = "accessToken";
const USER_KEY = "userData";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [token, setToken] = useState<string | null>(() => {
        return (
            Cookies.get(TOKEN_KEY) ||
            Cookies.get("token") ||
            localStorage.getItem(TOKEN_KEY) ||
            localStorage.getItem("token") ||
            null
        );
    });

    const logout = () => {
        Cookies.remove(TOKEN_KEY, { path: "/" });
        Cookies.remove("token", { path: "/" });
        Cookies.remove(USER_KEY, { path: "/" });
        localStorage.removeItem(USER_KEY);
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        setToken(null);
        setUser(null);
    };

    const [user, setUser] = useState<UserProfile | null>(() => {
        const cookieUser = Cookies.get(USER_KEY);
        if (cookieUser) {
            try {
                return JSON.parse(cookieUser);
            } catch {
                return null;
            }
        }
        const storedUser = localStorage.getItem(USER_KEY);
        if (storedUser) {
            try {
                return JSON.parse(storedUser);
            } catch {
                return null;
            }
        }
        return null;
    });

    // Fetch and synchronize fresh admin profile when token is present
    useEffect(() => {
        if (!token) return;

        let isMounted = true;
        getAdminMeFunc()
            .then((res) => {
                if (!isMounted) return;
                const adminData = res?.data?.admin;
                if (adminData) {
                    setUser(adminData);
                    Cookies.set(USER_KEY, JSON.stringify(adminData), {
                        expires: 7,
                        path: "/",
                    });
                    localStorage.setItem(USER_KEY, JSON.stringify(adminData));
                }
            })
            .catch((err) => {
                if (!isMounted) return;
                if (err?.response?.status === 401) {
                    logout();
                }
            });

        return () => {
            isMounted = false;
        };
    }, [token]);

    const login = (newToken: string, userData?: UserProfile) => {
        // Store token across cookies & localStorage
        Cookies.set(TOKEN_KEY, newToken, { expires: 7, path: "/" });
        Cookies.set("token", newToken, { expires: 7, path: "/" });
        localStorage.setItem(TOKEN_KEY, newToken);
        localStorage.setItem("token", newToken);
        setToken(newToken);

        if (userData) {
            setUser(userData);
            Cookies.set(USER_KEY, JSON.stringify(userData), {
                expires: 7,
                path: "/",
            });
            localStorage.setItem(USER_KEY, JSON.stringify(userData));
        }
    };

    return (
        <AuthContext.Provider
            value={{
                token,
                user,
                role: user?.role || "admin",
                isAuthenticated: Boolean(token),
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

export default AuthContext;

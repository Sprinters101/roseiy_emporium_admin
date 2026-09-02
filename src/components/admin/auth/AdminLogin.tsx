import React, { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/components/ui/sonner";
import { footerLogo, heroBg } from "@/lib/site_data";
import { CustomInput } from "@/components/common/CustomInput";

export const AdminLogin: React.FC = () => {
    const [email, setEmail] = useState("admin@roseiyemporium.com");
    const [password, setPassword] = useState("••••••••••••");
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        setTimeout(() => {
            // Allow login with any credentials for demo/development
            const dummyToken = `admin-jwt-token-roseiy-${Date.now()}`;
            const adminUser = {
                id: "admin-1",
                email: email.trim() || "admin@roseiyemporium.com",
                firstName: "Roseiy",
                lastName: "Bolanle",
                role: "Super Administrator",
            };

            login(dummyToken, adminUser);
            toast.success("Welcome to Roseiy Emporium Admin Portal");
            navigate("/", { replace: true });
            setIsLoading(false);
        }, 400);
    };

    return (
        <div className="min-h-screen bg-black-900 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Ambient gold glow background */}
            <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
                <img
                    src={heroBg}
                    alt="Premium selection background"
                    className="w-full h-full object-cover object-center"
                />
            </div>

            <div className="w-full max-w-md mx-auto">
                <img
                    src={footerLogo}
                    alt="Roseiy Emporium Logo"
                    className="w-[140px] relative object-contain block mx-auto z-20"
                />

                <div className="w-full mt-6 bg-black-700 rounded-2xl p-8 shadow-2xl relative z-10 animate-fadeIn border border-[#262626]">
                    {/* Brand Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-2xl md:text-[1.9375rem] font-bold font-playfair text-white tracking-tight">
                            Welcome Back
                        </h1>
                        <p className="text-xs sm:text-sm text-ivory-600 font-hanken mt-2">
                            Enter any login details to access the admin portal
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <CustomInput
                            name="email"
                            type="text"
                            label="Administrator Email"
                            placeholder="admin@roseiyemporium.com"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />

                        <CustomInput
                            name="password"
                            type="password"
                            label="Password"
                            placeholder="Enter your password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full mt-6 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#d4af37] hover:bg-[#e5c158] text-black font-semibold text-sm transition-all shadow-md cursor-pointer disabled:opacity-50"
                        >
                            <span>
                                {isLoading
                                    ? "Signing in..."
                                    : "Sign In to Portal"}
                            </span>
                            <ArrowRight className="size-4" />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;

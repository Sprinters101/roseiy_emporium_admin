import type { Product } from "@/config/types";
import {
    Boxes,
    Crown,
    LayoutDashboard,
    Package,
    Settings,
    ShoppingBasket,
    Truck,
    Users,
} from "lucide-react";

export const logo =
    "https://res.cloudinary.com/dzk1a6bjt/image/upload/v1785511077/Roseiy_Emporium_Logo_2_aikz0d.png";
export const footerLogo =
    "https://res.cloudinary.com/dzk1a6bjt/image/upload/v1785061330/footerLogo_qx820x.png";
export const activeNavImg =
    "https://res.cloudinary.com/dzk1a6bjt/image/upload/v1784400550/navUder_dw5zhf.png";

export const navLinks = [
    { name: "Home", href: "/" },
    { name: "About Us", href: "/#about" },
    { name: "Shop", href: "/shop" },
    { name: "Contact Us", href: "/contact" },
    { name: "FAQs", href: "/#faqs" },
];
// hero section
export const heroBg =
    "https://res.cloudinary.com/dzk1a6bjt/image/upload/v1784496510/image_43_buvvmk.png";
export const heroBg2 =
    "https://res.cloudinary.com/dzk1a6bjt/image/upload/v1784497637/hero_drink_mzkc2u.png";
export const heroBgMobile =
    "https://res.cloudinary.com/dzk1a6bjt/image/upload/v1784788437/mobilehereo_lkqweh.png";

// decorative divider

export const decorativeDivider =
    "https://res.cloudinary.com/dzk1a6bjt/image/upload/v1784469193/decorative_Divider_1_dsqk09.png";
export const badgeOrnament =
    "https://res.cloudinary.com/dzk1a6bjt/image/upload/v1784546318/badge_ardoment_hwzvqz.png";

export const hennessyLogo =
    "https://res.cloudinary.com/dzk1a6bjt/image/upload/v1784784438/image_23_kj73da.png";
export const chamdorLogo =
    "https://res.cloudinary.com/dzk1a6bjt/image/upload/v1784784581/image_25_rclwv6.png";
export const evaLogo = "/assets/brands/eva.png";
export const johnnieWalkerLogo =
    "https://res.cloudinary.com/dzk1a6bjt/image/upload/v1784784640/image_24_jwixdb.png";

export const brandDivider =
    "https://res.cloudinary.com/dzk1a6bjt/image/upload/v1784784710/Group_1_qjk9jy.png";
export const topFlourishOrnament =
    "https://res.cloudinary.com/dzk1a6bjt/image/upload/v1784762751/Group_wfssz0.png";

// category grid

export const categoryHeaderDivider =
    "https://res.cloudinary.com/dzk1a6bjt/image/upload/v1784791945/Group_2_gistev.png";

export const champagneImg =
    "https://res.cloudinary.com/dzk1a6bjt/image/upload/v1784792766/champange_bukmp4.png";
export const sweetwineImg =
    "https://res.cloudinary.com/dzk1a6bjt/image/upload/v1784802773/Image_qs1ex3.png";
export const whiskeyImg =
    "https://res.cloudinary.com/dzk1a6bjt/image/upload/v1784802920/Image_1_nsdp2h.png";
export const cognacImg =
    "https://res.cloudinary.com/dzk1a6bjt/image/upload/v1784803007/Image_2_xcjlsy.png";
export const tequilaImg =
    "https://res.cloudinary.com/dzk1a6bjt/image/upload/v1784803138/Image_3_jcvz6e.png";
export const rumImg =
    "https://res.cloudinary.com/dzk1a6bjt/image/upload/v1784803194/Image_4_z8kfyz.png";

export const products: Product[] = [
    {
        id: "1",
        name: "Glenfiddich Single Scotch",
        category: "Whiskey",
        brand: "Glenfiddich",
        volume: "750ml",
        piecesLeft: 37,
        casesLeft: 0,
        price: 75000,
        status: "Available",
        image: "https://res.cloudinary.com/dzk1a6bjt/image/upload/v1784813212/p_5_ohp3t7.png",
        isFeatured: true,
    },
    {
        id: "2",
        name: "Hennessy XO",
        category: "Cognac",
        brand: "Hennessy",
        volume: "700ml",
        piecesLeft: 53,
        casesLeft: 0,
        price: 3125000,
        status: "Available",
        image: "https://res.cloudinary.com/dzk1a6bjt/image/upload/v1784813212/p_6_eph9tv.png",
        isFeatured: true,
    },
    {
        id: "3",
        name: "Don Julio 1942",
        category: "Tequila",
        brand: "Don Julio",
        volume: "750ml",
        piecesLeft: 55,
        casesLeft: 10,
        price: 120000,
        status: "Available",
        image: "https://res.cloudinary.com/dzk1a6bjt/image/upload/v1784813212/p_8_zk4ynx.png",
        isFeatured: true,
    },
    {
        id: "4",
        name: "Clase Azul Reposado",
        category: "Tequila",
        brand: "Azul",
        volume: "750ml",
        piecesLeft: 24,
        casesLeft: 12,
        price: 5000000,
        status: "Available",
        image: "https://res.cloudinary.com/dzk1a6bjt/image/upload/v1784813212/p_8_zk4ynx.png",
        isFeatured: true,
    },
    {
        id: "5",
        name: "Moet & Chandon Imperial Brut",
        category: "Champagne",
        brand: "Moet & Chandon",
        volume: "750ml",
        piecesLeft: 2,
        casesLeft: 0,
        price: 1225000,
        status: "Available",
        image: "https://res.cloudinary.com/dzk1a6bjt/image/upload/v1784813213/p_1_pndwco.png",
        isFeatured: true,
    },
    {
        id: "6",
        name: "VOSS Still Water",
        category: "Bottled Water",
        brand: "Voss",
        volume: "800ml",
        piecesLeft: 0,
        casesLeft: 11,
        price: 1225000,
        status: "Available",
        image: "https://res.cloudinary.com/dzk1a6bjt/image/upload/v1784813213/p_2_wyfdyq.png",
    },
    {
        id: "7",
        name: "Bombay Sapphire",
        category: "Gin",
        brand: "Bombay",
        volume: "1000ml",
        piecesLeft: 24,
        casesLeft: 12,
        price: 1225000,
        status: "Available",
        image: "https://res.cloudinary.com/dzk1a6bjt/image/upload/v1784813213/p_2_wyfdyq.png",
    },
    {
        id: "8",
        name: "Four Cousins",
        category: "Sweetwine",
        brand: "Four Cousins",
        volume: "750ml",
        piecesLeft: 3,
        casesLeft: 7,
        price: 1225000,
        status: "Available",
        image: "https://res.cloudinary.com/dzk1a6bjt/image/upload/v1784813212/p_7_bsy5mg.png",
    },
    {
        id: "9",
        name: "Glenfiddich Single Scotch",
        category: "Whiskey",
        brand: "Glenfiddich",
        volume: "750ml",
        piecesLeft: 0,
        casesLeft: 7,
        price: 1225000,
        status: "Available",
        image: "https://res.cloudinary.com/dzk1a6bjt/image/upload/v1784813212/p_5_ohp3t7.png",
    },
    {
        id: "10",
        name: "Don Julio Reposado",
        category: "Tequila",
        brand: "Don Julio",
        volume: "750ml",
        piecesLeft: 64,
        casesLeft: 0,
        price: 1225000,
        status: "Available",
        image: "https://res.cloudinary.com/dzk1a6bjt/image/upload/v1784813212/p_8_zk4ynx.png",
    },
    {
        id: "11",
        name: "Bacardi Superior White Rum",
        category: "Rum",
        brand: "Bacardi",
        volume: "750ml",
        piecesLeft: 0,
        casesLeft: 0,
        price: 850000,
        status: "Out of Stock",
        image: "https://res.cloudinary.com/dzk1a6bjt/image/upload/v1784813212/p_4_ga8oeh.png",
    },
    {
        id: "12",
        name: "Veuve Clicquot Brut",
        category: "Champagne",
        brand: "Moet & Chandon",
        volume: "750ml",
        piecesLeft: 0,
        casesLeft: 0,
        price: 1450000,
        status: "Out of Stock",
        image: "https://res.cloudinary.com/dzk1a6bjt/image/upload/v1784813213/p_1_pndwco.png",
    },
];

export const categories = [
    {
        title: "Champagne",
        image: champagneImg,
        href: "/shop?category=champagne",
    },
    {
        title: "Sweetwine",
        image: sweetwineImg,
        href: "/shop?category=sweetwine",
    },
    {
        title: "Whiskey",
        image: whiskeyImg,
        href: "/shop?category=whiskey",
    },
    { title: "Cognac", image: cognacImg, href: "/shop?category=cognac" },
    {
        title: "Tequila",
        image: tequilaImg,
        href: "/shop?category=tequila",
    },
    { title: "Rum", image: rumImg, href: "/shop?category=rum" },
];

export const glenfiddichLogo = "/icon/I_1.svg";
export const domPerignonLogo = "/icon/I_2.svg";
export const veuveClicquotLogo = "/icon/I_3.svg";
export const moetLogo = "/icon/I_4.svg";

export const donJulioLogo = "/icon/I_5.svg";
export const claseAzulLogo = "/icon/I_6.svg";
export const tequilaLogo = "/icon/I_7.svg";

export const donJulioReposadoImg = "/icon/p_1.svg";
export const hennessyXoImg = "/icon/p_2.svg";
export const claseAzulImg = "/icon/p_3.svg";

export const aboutSplashImg =
    "https://res.cloudinary.com/dzk1a6bjt/image/upload/v1784980140/glass_zkobvg.png";

export const contactChampagneImg =
    "https://res.cloudinary.com/dzk1a6bjt/image/upload/v1785057214/image_35_i4k23o.png";

export const heroBg3 =
    "https://res.cloudinary.com/dzk1a6bjt/image/upload/v1785967279/herobg_qzddbs.png";

export const navItems = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Products", href: "/products", icon: Package },
    { name: "Categories", href: "/categories", icon: ShoppingBasket },
    { name: "Brands", href: "/brands", icon: Crown },
    { name: "Orders", href: "/orders", icon: Boxes },
    { name: "Deliveries", href: "/deliveries", icon: Truck },
    { name: "Customers", href: "/customers", icon: Users },
    { name: "Settings", href: "/settings", icon: Settings },
];

export interface BestSellerItem {
    product: Product;
    totalSold: number;
    revenue: number;
}

export interface TopCustomerItem {
    id: string;
    name: string;
    email: string;
    totalOrders: number;
    totalSpend: number;
}

export interface RecentOrderItem {
    id: string;
    orderNumber: string;
    customerName: string;
    customerEmail?: string;
    itemsCount?: number;
    totalAmount: number;
    status:
        | "pending"
        | "processing"
        | "shipped"
        | "delivered"
        | "ongoing"
        | "failed"
        | "cancelled";
    createdAt: string;
}

export const bestSellingProducts: BestSellerItem[] = [
    {
        product: products[0],
        totalSold: 42,
        revenue: 14700000,
    },
    {
        product: products[4],
        totalSold: 35,
        revenue: 43750000,
    },
    {
        product: products[6],
        totalSold: 28,
        revenue: 40600000,
    },
    {
        product: products[9],
        totalSold: 24,
        revenue: 2640000,
    },
];

export const topCustomers: TopCustomerItem[] = [
    {
        id: "cust-1",
        name: "Adeyemi Adeleke",
        email: "adeyemi.a@example.com",
        totalOrders: 6,
        totalSpend: 2450000,
    },
    {
        id: "cust-2",
        name: "Folashade Morgan",
        email: "f.morgan@example.com",
        totalOrders: 3,
        totalSpend: 880000,
    },
    {
        id: "cust-3",
        name: "Babajide Williams",
        email: "bwilliams@example.com",
        totalOrders: 8,
        totalSpend: 3900000,
    },
    {
        id: "cust-4",
        name: "Chukwuma Eze",
        email: "c.eze@example.com",
        totalOrders: 5,
        totalSpend: 1350000,
    },
];

export const recentOrders: RecentOrderItem[] = [
    {
        id: "1",
        orderNumber: "RE-2026-7890",
        customerName: "John Amadi",
        customerEmail: "john.amadi@example.com",
        totalAmount: 75000,
        status: "delivered",
        createdAt: "25th July, 2024",
    },
    {
        id: "2",
        orderNumber: "RE-2026-7892",
        customerName: "Quilox Ent",
        customerEmail: "contact@quilox.com",
        totalAmount: 3125000,
        status: "ongoing",
        createdAt: "26th July, 2024",
    },
    {
        id: "3",
        orderNumber: "RE-2026-7891",
        customerName: "Castiel Dean",
        customerEmail: "castiel.dean@example.com",
        totalAmount: 120000,
        status: "delivered",
        createdAt: "27th July, 2024",
    },
    {
        id: "4",
        orderNumber: "RE-2026-7890",
        customerName: "Castle Lounge",
        customerEmail: "info@castlelounge.com",
        totalAmount: 5000000,
        status: "ongoing",
        createdAt: "25th July, 2024",
    },
    {
        id: "5",
        orderNumber: "RE-2026-7893",
        customerName: "Sunflower Bar",
        customerEmail: "orders@sunflowerbar.com",
        totalAmount: 1225000,
        status: "failed",
        createdAt: "28th July, 2024",
    },
];

export const adminMetrics = {
    totalRevenue: 85400000,
    todayRevenue: 1250000,
    totalOrders: 148,
};

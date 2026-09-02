# Roseiy Emporium — Administrative Dashboard 🍾👑

**Roseiy Emporium Admin Portal** is an enterprise-grade, luxury administrative dashboard engineered for managing operations, orders, catalogue inventory, delivery logistics, and administrative team access for the **Roseiy Emporium** fine wines, premium spirits, and champagne retail ecosystem.

Built with **React 19**, **Vite 8**, **TypeScript**, and **Tailwind CSS v4**, this application provides store administrators and operations managers with an intuitive, performant, and visually refined control center.

---

## 🚀 Tech Stack & Tooling

The administrative portal leverages a modern, high-performance web stack:

*   **Frontend Framework:** [React 19](https://react.dev/)
*   **Build Tool & Bundler:** [Vite 8](https://vite.dev/) with Rolldown compiler support
*   **Programming Language:** [TypeScript 5.x / 6.x](https://www.typescriptlang.org/)
*   **Styling & Design System:** [Tailwind CSS v4](https://tailwindcss.com/) with `@tailwindcss/vite`
*   **Routing:** [React Router v8](https://reactrouter.com/) (declarative nested admin layouts and route guards)
*   **State & Query Layer:** [TanStack React Query v5](https://tanstack.com/query)
*   **UI Primitives & Feedback:**
    *   [@base-ui/react](https://base-ui.com/) (accessible UI components)
    *   [Lucide React](https://lucide.dev/) (iconography)
    *   [Sonner](https://sonner.emilkowal.ski/) (customizable toast notifications)
    *   `class-variance-authority` (CVA) & `tailwind-merge` (dynamic styling tokens)
*   **Typography:** Playfair Display (`font-playfair`) & Hanken Grotesk / Geist (`font-hanken`) with bespoke luxury gold styling (`#D4AF37`).

---

## 📂 Project Structure

```text
roseiy_emporium_admin/
├── src/
│   ├── assets/              # Branding assets, logos, and vector illustrations
│   ├── components/
│   │   ├── admin/           # Dedicated Administrative Modules
│   │   │   ├── auth/        # Admin Login & credentials authentication
│   │   │   ├── brands/      # Brand directory, filtering & creation modals
│   │   │   ├── categories/  # Category directory, counters & management
│   │   │   ├── customers/   # Customer directories, KPI banners & customer details
│   │   │   ├── dashboard/   # Executive overview, KPI metric strips & recent orders
│   │   │   ├── deliveries/  # Delivery areas, fees & free delivery threshold rules
│   │   │   ├── layout/      # Admin Topbar, persistent Sidebar & responsive navigation
│   │   │   ├── orders/      # Orders list (Ongoing/Completed/Failed) & multi-stage fulfillment
│   │   │   ├── products/    # Product inventory, Add/Edit product with 2-column pricing & preview
│   │   │   └── settings/    # Store profile, credentials, admin management & admin details
│   │   ├── common/          # Reusable Form & Component Primitives
│   │   │   ├── CustomConfirmModal.tsx  # Universal deletion & confirmation dialogs
│   │   │   ├── CustomDropdown.tsx      # Standardized light/dark select menus
│   │   │   ├── CustomInput.tsx         # Styled form inputs
│   │   │   ├── CustomPriceInput.tsx    # Live currency formatting with ₦ symbol
│   │   │   └── CustomTable.tsx         # Reusable data table layouts
│   │   └── ui/              # Low-level primitives (dropdown-menu, dialog, sheet, sonner)
│   ├── config/              # Core interfaces, types, and constants
│   ├── context/             # Global AuthContext & user session providers
│   ├── layouts/             # High-level shell layouts (AdminLayout, PublicLayout)
│   ├── lib/                 # Mock datastores, orders listener subscriptions & utils
│   │   ├── orders_data.ts   # Centralized reactive orders store & stage update methods
│   │   ├── site_data.ts     # Global product catalogue & category definitions
│   │   └── utils.ts         # Classnames (cn) merging helper
│   ├── routes/              # Administrative route declarations & guards
│   ├── App.tsx              # Router and Sonner provider initialization
│   ├── main.tsx             # Application mount point
│   └── index.css            # Tailwind 4 theme tokens, color definitions & fonts
├── public/                  # Public assets, web fonts & favicon
├── package.json             # Scripts and dependency specifications
├── tsconfig.json            # Strict TypeScript configuration
└── vite.config.ts           # Vite plugin ecosystem setup
```

---

## 💎 Key Features & Administrative Modules

### 1. 📦 Product & Catalogue Management
*   **Comprehensive Inventory Table:** Real-time stock status badges (*Available*, *Out of Stock*), piece & case counters, category & brand badges, search, and direct action modals.
*   **Add & Edit Product Workflows:**
    *   **2-Column Pricing Card:** Specialized `Selling Price in Pieces` and `Selling Price in Cases` inputs.
    *   **Live Interactive Preview:** Real-time visual product card updating as product details, images, category, and prices are inputted.
    *   **Multi-Image Upload:** Drag-and-drop file upload with cover image indicator and quick-remove controls.

### 2. 📋 Orders & Fulfillment Tracking
*   **Segmented Lifecycle Tabs:** Dedicated views for **Ongoing** (92), **Completed** (286), and **Failed** (12) orders with badge counters.
*   **Custom Filters:** Real-time search, progress filters (*In Transit*, *Confirmed*), sort options, and an **Interactive Calendar Date Range Popover**.
*   **Export Engine:** Instant export to **CSV**, **DOC**, and **PDF** formats.
*   **Multi-Stage Order Fulfillment Detail View:**
    *   Step 1: Customer Information card.
    *   Step 2: Ordered Items table with high-resolution bottles, quantities, and subtotal calculation.
    *   Step 3: Order financial summary (Subtotal, Delivery Fee, Grand Total).
    *   **4-Step Interactive Stepper:** (*Order Placed* → *Order Confirmed* → *In Transit* → *Delivered*) with action triggers (`Mark as Confirmed`, `Mark as in Transit`, `Mark as Delivered`, `Mark as Failed`).

### 3. 🚚 Delivery Areas & Free Delivery Thresholds
*   **Delivery Areas Directory:** Manage delivery locations, individual delivery rates, and active/disabled statuses with edit and delete confirmation modals.
*   **Free Delivery Rule Engine:** Configure minimum order thresholds for automated free delivery qualification.
*   **Empty State Illustration:** Custom 3D isometric package illustrations for zero-state scenarios.

### 4. 👥 Customer Management
*   **Customer KPI Metrics:** Total Orders, Lifetime Spend, and activity metrics.
*   **Customer History & Profile:** Drilldown view into individual order history, delivery addresses, and purchasing patterns.

### 5. ⚙️ Portal Settings & Admin Management
*   **General Settings:** In-place edit and view modes for Profile Information, Business Information, and Password & Security.
*   **Admin Team Management:** Admin users table with status indicators (`● Active` / `● Inactive`), last login timestamps, and search.
*   **Admin Creation & Detail Screen:** Dedicated Add Admin form and Admin Details view/edit screen with role and status assignment.

### 6. 💰 Reusable `CustomPriceInput`
*   **Real-time Comma Formatting:** Automatically formats values as typed (e.g., `80000` ➔ `80,000`).
*   **Cursor-Preserving Input:** Ensures caret position does not jump when inserting or deleting digits within formatted numbers.
*   **Unified Styling:** Standardized luxury currency badge (`₦ | [Amount]`) across all creation and modification forms.

---

## 🛠️ Getting Started

### 📋 Prerequisites

*   **Node.js**: Version `18.0.0` or higher
*   **npm**: Version `9.0.0` or higher (or `pnpm` / `yarn`)

### 📥 Installation

Clone the repository and install dependencies:

```bash
git clone <repository-url>
cd roseiy_emporium_admin
npm install
```

### 💻 Development Server

Start the local Vite development server with Hot Module Replacement (HMR):

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser to access the admin portal.

### 🏗️ Production Build

To run type checking and compile production-ready optimized assets:

```bash
npm run build
```

The compiled output will be generated in the `dist/` directory.

### 🔍 Preview Production Build

To test the generated production bundle locally:

```bash
npm run preview
```

### 🧹 Code Quality & Linting

Run ESLint to verify code quality and enforce standards:

```bash
npm run lint
```

---

## 🔒 Security & Authentication

*   Admin authentication states and user permissions are managed via `AuthContext`.
*   All sensitive routes under `/` (Orders, Products, Deliveries, Customers, Settings) are secured via `AdminRoute` protection guards.
*   Masked credential toggles (`👁` / `👁‍🗨`) and password confirmation validations are enforced on all security forms.

---

## 📄 License

Private & Proprietary — **Roseiy Emporium**. All rights reserved.

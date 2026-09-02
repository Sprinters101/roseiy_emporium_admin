import React from "react";

/**
 * BasketIllustration - Elegant gold wire basket with organic background blob
 * Matches the design sample for "Best Sellers" and "Top Customers" empty states.
 */
export const BasketIllustration: React.FC<{ className?: string }> = ({
    className = "size-36",
}) => {
    return (
        <div className={`relative flex items-center justify-center ${className}`}>
            <svg
                viewBox="0 0 160 160"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full"
            >
                {/* Organic soft beige backdrop blob */}
                <path
                    d="M125 45C142 62 148 95 136 118C124 141 94 154 68 148C42 142 20 117 21 91C22 65 46 38 72 25C98 12 108 28 125 45Z"
                    fill="#F7F1DF"
                    fillOpacity="0.8"
                />

                {/* Basket handles */}
                <path
                    d="M58 82L68 50M102 82L92 50"
                    stroke="#D4A72C"
                    strokeWidth="5"
                    strokeLinecap="round"
                />

                {/* Basket Rim */}
                <path
                    d="M40 82C40 80.3431 41.3431 79 43 79H117C118.657 79 120 80.3431 120 82V85C120 86.6569 118.657 88 117 88H43C41.3431 88 40 86.6569 40 85V82Z"
                    fill="#D4A72C"
                />

                {/* Basket Base Trapezoid */}
                <path
                    d="M47 88L54 125C54.5 127.8 56.9 129.8 59.8 129.8H100.2C103.1 129.8 105.5 127.8 106 125L113 88H47Z"
                    fill="#D4A72C"
                />

                {/* Vertical basket cutouts (negative space lines) */}
                <path
                    d="M62 93L66 123"
                    stroke="#F7F1DF"
                    strokeWidth="4"
                    strokeLinecap="round"
                />
                <path
                    d="M74 93L76 123"
                    stroke="#F7F1DF"
                    strokeWidth="4"
                    strokeLinecap="round"
                />
                <path
                    d="M86 93L84 123"
                    stroke="#F7F1DF"
                    strokeWidth="4"
                    strokeLinecap="round"
                />
                <path
                    d="M98 93L94 123"
                    stroke="#F7F1DF"
                    strokeWidth="4"
                    strokeLinecap="round"
                />
            </svg>
        </div>
    );
};

/**
 * PackageIllustration - 3D Isometric cardboard carton box with soft beige blob
 * Matches the design sample for "Recent Orders" empty state.
 */
export const PackageIllustration: React.FC<{ className?: string }> = ({
    className = "size-36",
}) => {
    return (
        <div className={`relative flex items-center justify-center ${className}`}>
            <svg
                viewBox="0 0 160 160"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full"
            >
                {/* Organic soft beige backdrop blob */}
                <path
                    d="M128 48C145 68 142 102 127 124C112 146 85 156 61 147C37 138 16 110 20 83C24 56 53 30 81 22C109 14 111 28 128 48Z"
                    fill="#F7F1DF"
                    fillOpacity="0.8"
                />

                {/* Isometric Box Top Face */}
                <path
                    d="M80 46L118 66L80 86L42 66L80 46Z"
                    fill="#E5B834"
                />

                {/* Box Left Face (shaded darker) */}
                <path
                    d="M42 66L80 86V130L42 110V66Z"
                    fill="#C6971F"
                />

                {/* Box Right Face (light shaded) */}
                <path
                    d="M80 86L118 66V110L80 130V86Z"
                    fill="#DFA826"
                />

                {/* Tape on top */}
                <path
                    d="M74 50L86 56L86 82L74 76L74 50Z"
                    fill="#A87E14"
                    fillOpacity="0.6"
                />

                {/* Shipping label on right face */}
                <rect
                    x="92"
                    y="88"
                    width="12"
                    height="16"
                    rx="1"
                    transform="skewY(-15)"
                    fill="#FFFFFF"
                    fillOpacity="0.9"
                />
            </svg>
        </div>
    );
};

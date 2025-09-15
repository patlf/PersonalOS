"use client";

import { cn } from "@/lib/utils";

interface LogoProps {
    className?: string;
    variant?: "icon" | "full" | "text";
    size?: "sm" | "md" | "lg";
}

export function Logo({ className, variant = "full", size = "md" }: LogoProps) {
    const sizeClasses = {
        sm: "h-6",
        md: "h-8",
        lg: "h-10"
    };

    // Your actual Coreos logo - Icon only version
    const LogoIcon = () => (
        <div className={cn(sizeClasses[size], className)}>
            <svg fill="none" height="48" viewBox="0 0 48 48" width="48" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" className="w-full h-full">
                <filter id="a" colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="54" width="48" x="0" y="-3">
                    <feFlood floodOpacity="0" result="BackgroundImageFix" />
                    <feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape" />
                    <feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
                    <feOffset dy="-3" />
                    <feGaussianBlur stdDeviation="1.5" />
                    <feComposite in2="hardAlpha" k2="-1" k3="1" operator="arithmetic" />
                    <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0" />
                    <feBlend in2="shape" mode="normal" result="effect1_innerShadow_3051_46887" />
                    <feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
                    <feOffset dy="3" />
                    <feGaussianBlur stdDeviation="1.5" />
                    <feComposite in2="hardAlpha" k2="-1" k3="1" operator="arithmetic" />
                    <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.1 0" />
                    <feBlend in2="effect1_innerShadow_3051_46887" mode="normal" result="effect2_innerShadow_3051_46887" />
                    <feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
                    <feMorphology in="SourceAlpha" operator="erode" radius="1" result="effect3_innerShadow_3051_46887" />
                    <feOffset />
                    <feComposite in2="hardAlpha" k2="-1" k3="1" operator="arithmetic" />
                    <feColorMatrix type="matrix" values="0 0 0 0 0.0627451 0 0 0 0 0.0941176 0 0 0 0 0.156863 0 0 0 0.24 0" />
                    <feBlend in2="effect2_innerShadow_3051_46887" mode="normal" result="effect3_innerShadow_3051_46887" />
                </filter>
                <filter id="b" colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="42" width="37.5" x="5.25" y="5.25">
                    <feFlood floodOpacity="0" result="BackgroundImageFix" />
                    <feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
                    <feMorphology in="SourceAlpha" operator="erode" radius="1.5" result="effect1_dropShadow_3051_46887" />
                    <feOffset dy="2.25" />
                    <feGaussianBlur stdDeviation="2.25" />
                    <feComposite in2="hardAlpha" operator="out" />
                    <feColorMatrix type="matrix" values="0 0 0 0 0.141176 0 0 0 0 0.141176 0 0 0 0 0.141176 0 0 0 0.1 0" />
                    <feBlend in2="BackgroundImageFix" mode="normal" result="effect1_dropShadow_3051_46887" />
                    <feBlend in="SourceGraphic" in2="effect1_dropShadow_3051_46887" mode="normal" result="shape" />
                </filter>
                <linearGradient id="c" gradientUnits="userSpaceOnUse" x1="24" x2="26" y1=".000001" y2="48">
                    <stop offset="0" stopColor="#fff" stopOpacity="0" />
                    <stop offset="1" stopColor="#fff" stopOpacity=".12" />
                </linearGradient>
                <linearGradient id="d" gradientUnits="userSpaceOnUse" x1="24.002" x2="24.002" y1="9.74963" y2="38.2496">
                    <stop offset="0" stopColor="#fff" stopOpacity=".8" />
                    <stop offset="1" stopColor="#fff" stopOpacity=".5" />
                </linearGradient>
                <linearGradient id="e" gradientUnits="userSpaceOnUse" x1="24" x2="24" y1="0" y2="48">
                    <stop offset="0" stopColor="#fff" stopOpacity=".12" />
                    <stop offset="1" stopColor="#fff" stopOpacity="0" />
                </linearGradient>
                <clipPath id="f">
                    <rect height="48" rx="12" width="48" />
                </clipPath>
                <g filter="url(#a)">
                    <g clipPath="url(#f)">
                        <rect fill="#22262F" height="48" rx="12" width="48" />
                        <path d="m0 0h48v48h-48z" fill="url(#c)" />
                        <g filter="url(#b)">
                            <path clipRule="evenodd" d="m19.6719 9.74963c-2.4115 0-4.6399 1.28657-5.8456 3.37497l-4.33017 7.5c-1.20577 2.0885-1.20578 4.6616-.00001 6.75l4.33018 7.5c1.2057 2.0885 3.4341 3.375 5.8456 3.375h8.6603c2.4115 0 4.6399-1.2865 5.8456-3.375l4.3302-7.5c1.2057-2.0884 1.2057-4.6615 0-6.75l-4.3302-7.5c-1.2057-2.0884-3.4341-3.37497-5.8456-3.37497zm8.6603 4.49997h-5.4127c-.866 0-1.4071.9375-.9735 1.6871 1.338 2.3128 2.6792 4.6239 4.0152 6.9379.4019.6962.4019 1.5539 0 2.25-1.336 2.314-2.6772 4.6251-4.0152 6.938-.4336.7496.1075 1.687.9735 1.687h5.4127c.8038 0 1.5466-.4288 1.9485-1.125l4.3302-7.5c.4019-.6961.4019-1.5538 0-2.25l-4.3302-7.5c-.4019-.6961-1.1447-1.125-1.9485-1.125z" fill="url(#d)" fillRule="evenodd" />
                        </g>
                    </g>
                    <rect height="46" rx="11" stroke="url(#e)" strokeWidth="2" width="46" x="1" y="1" />
                </g>
            </svg>
        </div>
    );

    // Your actual Coreos logo - Full version with text
    const LogoFull = () => (
        <div className={cn("flex items-center", className)}>
            <svg fill="none" height="48" viewBox="0 0 155 48" width="155" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" className={sizeClasses[size]}>
                <filter id="a" colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="54" width="48" x="0" y="-3">
                    <feFlood floodOpacity="0" result="BackgroundImageFix" />
                    <feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape" />
                    <feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
                    <feOffset dy="-3" />
                    <feGaussianBlur stdDeviation="1.5" />
                    <feComposite in2="hardAlpha" k2="-1" k3="1" operator="arithmetic" />
                    <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0" />
                    <feBlend in2="shape" mode="normal" result="effect1_innerShadow_3046_38745" />
                    <feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
                    <feOffset dy="3" />
                    <feGaussianBlur stdDeviation="1.5" />
                    <feComposite in2="hardAlpha" k2="-1" k3="1" operator="arithmetic" />
                    <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.1 0" />
                    <feBlend in2="effect1_innerShadow_3046_38745" mode="normal" result="effect2_innerShadow_3046_38745" />
                    <feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
                    <feMorphology in="SourceAlpha" operator="erode" radius="1" result="effect3_innerShadow_3046_38745" />
                    <feOffset />
                    <feComposite in2="hardAlpha" k2="-1" k3="1" operator="arithmetic" />
                    <feColorMatrix type="matrix" values="0 0 0 0 0.0627451 0 0 0 0 0.0941176 0 0 0 0 0.156863 0 0 0 0.24 0" />
                    <feBlend in2="effect2_innerShadow_3046_38745" mode="normal" result="effect3_innerShadow_3046_38745" />
                </filter>
                <filter id="b" colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="42" width="37.5" x="5.25" y="5.25">
                    <feFlood floodOpacity="0" result="BackgroundImageFix" />
                    <feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
                    <feMorphology in="SourceAlpha" operator="erode" radius="1.5" result="effect1_dropShadow_3046_38745" />
                    <feOffset dy="2.25" />
                    <feGaussianBlur stdDeviation="2.25" />
                    <feComposite in2="hardAlpha" operator="out" />
                    <feColorMatrix type="matrix" values="0 0 0 0 0.141176 0 0 0 0 0.141176 0 0 0 0 0.141176 0 0 0 0.1 0" />
                    <feBlend in2="BackgroundImageFix" mode="normal" result="effect1_dropShadow_3046_38745" />
                    <feBlend in="SourceGraphic" in2="effect1_dropShadow_3046_38745" mode="normal" result="shape" />
                </filter>
                <linearGradient id="c" gradientUnits="userSpaceOnUse" x1="24" x2="26" y1=".000001" y2="48">
                    <stop offset="0" stopColor="#fff" stopOpacity="0" />
                    <stop offset="1" stopColor="#fff" stopOpacity=".12" />
                </linearGradient>
                <linearGradient id="d" gradientUnits="userSpaceOnUse" x1="24.002" x2="24.002" y1="9.74963" y2="38.2496">
                    <stop offset="0" stopColor="#fff" stopOpacity=".8" />
                    <stop offset="1" stopColor="#fff" stopOpacity=".5" />
                </linearGradient>
                <linearGradient id="e" gradientUnits="userSpaceOnUse" x1="24" x2="24" y1="0" y2="48">
                    <stop offset="0" stopColor="#fff" stopOpacity=".12" />
                    <stop offset="1" stopColor="#fff" stopOpacity="0" />
                </linearGradient>
                <clipPath id="f">
                    <rect height="48" rx="12" width="48" />
                </clipPath>
                <g filter="url(#a)">
                    <g clipPath="url(#f)">
                        <rect fill="#22262F" height="48" rx="12" width="48" />
                        <path d="m0 0h48v48h-48z" fill="url(#c)" />
                        <g filter="url(#b)">
                            <path clipRule="evenodd" d="m19.6719 9.74963c-2.4115 0-4.6399 1.28657-5.8456 3.37497l-4.33017 7.5c-1.20577 2.0885-1.20578 4.6616-.00001 6.75l4.33018 7.5c1.2057 2.0885 3.4341 3.375 5.8456 3.375h8.6603c2.4115 0 4.6399-1.2865 5.8456-3.375l4.3302-7.5c1.2057-2.0884 1.2057-4.6615 0-6.75l-4.3302-7.5c-1.2057-2.0884-3.4341-3.37497-5.8456-3.37497zm8.6603 4.49997h-5.4127c-.866 0-1.4071.9375-.9735 1.6871 1.338 2.3128 2.6792 4.6239 4.0152 6.9379.4019.6962.4019 1.5539 0 2.25-1.336 2.314-2.6772 4.6251-4.0152 6.938-.4336.7496.1075 1.687.9735 1.687h5.4127c.8038 0 1.5466-.4288 1.9485-1.125l4.3302-7.5c.4019-.6961.4019-1.5538 0-2.25l-4.3302-7.5c-.4019-.6961-1.1447-1.125-1.9485-1.125z" fill="url(#d)" fillRule="evenodd" />
                        </g>
                    </g>
                    <rect height="46" rx="11" stroke="url(#e)" strokeWidth="2" width="46" x="1" y="1" />
                </g>
                <g fill="#fff">
                    <path d="m76.983 20.526h-4.536c-.513-1.809-1.809-2.781-3.645-2.781-2.781 0-4.374 2.322-4.374 6.102 0 3.807 1.566 6.048 4.374 6.048 1.728 0 3.078-.918 3.591-2.646h4.59c-.945 4.05-4.212 6.183-8.127 6.183-5.481 0-8.856-3.645-8.856-9.585s3.375-9.639 8.91-9.639c3.942 0 7.29 2.133 8.073 6.318z" />
                    <path d="m85.1442 33.432c-4.401 0-7.128-2.916-7.128-7.695 0-4.941 2.808-7.722 7.128-7.722 4.401 0 7.155 2.97 7.155 7.722 0 4.914-2.835 7.695-7.155 7.695zm0-3.348c1.917 0 2.916-1.512 2.916-4.347 0-2.808-1.026-4.374-2.916-4.374s-2.889 1.539-2.889 4.374c0 2.808 1.026 4.347 2.889 4.347z" />
                    <path d="m93.9439 33v-14.526h4.1309v2.025c.918-1.728 2.3222-2.484 3.8072-2.484.594 0 1.134.162 1.431.459v3.483c-.486-.108-.999-.162-1.647-.162-2.4841 0-3.5912 1.404-3.5912 3.699v7.506z" />
                    <path d="m117.851 28.221c-.756 3.348-3.456 5.211-7.02 5.211-4.509 0-7.29-2.916-7.29-7.695 0-4.941 2.808-7.722 7.128-7.722 4.347 0 7.074 2.889 7.074 7.641v.918h-9.99c.216 2.322 1.296 3.564 3.078 3.564 1.35 0 2.268-.594 2.7-1.917zm-7.182-6.912c-1.539 0-2.511.999-2.835 2.889h5.643c-.324-1.89-1.296-2.889-2.808-2.889z" />
                    <path d="m128.324 33.432c-5.697 0-9.207-3.672-9.207-9.585 0-5.94 3.51-9.639 9.207-9.639 5.67 0 9.18 3.699 9.18 9.639 0 5.913-3.51 9.585-9.18 9.585zm0-3.537c2.997 0 4.752-2.268 4.752-6.048s-1.755-6.102-4.752-6.102c-3.024 0-4.779 2.295-4.779 6.102 0 3.78 1.755 6.048 4.779 6.048z" />
                    <path d="m143.466 19.365c0 3.915 10.8.594 10.8 8.1 0 3.78-3.132 5.967-7.425 5.967-4.347 0-7.452-1.998-8.1-6.183h4.563c.351 1.809 1.62 2.808 3.564 2.808s2.97-.783 2.97-2.052c0-4.104-10.827-.972-10.827-8.235 0-3.078 2.565-5.562 7.074-5.562 3.807 0 7.101 1.809 7.668 6.048h-4.617c-.378-1.809-1.431-2.673-3.213-2.673-1.512 0-2.457.702-2.457 1.782z" />
                </g>
            </svg>
        </div>
    );

    if (variant === "icon") {
        return <LogoIcon />;
    }

    if (variant === "text") {
        return (
            <div className="flex flex-col min-w-0">
                <span className="text-sm font-semibold truncate">Coreos</span>
            </div>
        );
    }

    // Full logo with icon and text
    return <LogoFull />;
}
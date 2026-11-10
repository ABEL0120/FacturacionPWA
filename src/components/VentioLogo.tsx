import React, { useId } from "react";

interface VentioLogoProps {
  className?: string;
  variant?: "color" | "white" | "monochrome";
}

export const VentioLogo: React.FC<VentioLogoProps> = ({
  className = "w-10 h-10",
  variant = "color",
}) => {
  const uid = useId().replace(/:/g, "");
  const gradLeftId = `ventioGradLeft-${uid}`;
  const gradRightId = `ventioGradRight-${uid}`;

  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id={gradLeftId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0b5ed7" />
          <stop offset="100%" stopColor="#010080" />
        </linearGradient>
        <linearGradient id={gradRightId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#0b5ed7" />
        </linearGradient>
      </defs>

      {variant === "white" ? (
        <g fill="#ffffff">
          <path
            d="M18 20 H34 L50 64 L40 68 Z"
            fill="#ffffff"
            opacity="0.95"
          />
          <path
            d="M82 20 H66 L50 64 L60 68 Z"
            fill="#ffffff"
            opacity="0.8"
          />
          <path d="M40 68 L50 84 L60 68 Z" fill="#ffffff" />
          <circle cx="76" cy="18" r="5" fill="#ffffff" />
        </g>
      ) : (
        <g>
          <path d="M18 20 H34 L50 64 L40 68 Z" fill={`url(#${gradLeftId})`} />
          <path d="M82 20 H66 L50 64 L60 68 Z" fill={`url(#${gradRightId})`} />
          <path d="M40 68 L50 84 L60 68 Z" fill="#010080" />
          <circle cx="76" cy="18" r="5" fill="#0b5ed7" />
        </g>
      )}
    </svg>
  );
};

export default VentioLogo;

"use client";

import Link from "next/link";
import { useState } from "react";

type ColorVariant = "dark" | "standard" | "light";

const blueColors: Record<ColorVariant, string> = {
  dark: "#0c0c48f2",
  standard: "#0a437902",
  light: "#1a6ab102",
};

const blueHoverColors: Record<ColorVariant, string> = {
  dark: "#080830",
  standard: "#083059",
  light: "#155a96",
};

interface ButtonProps {
  href?: string;
  onClick?: () => void;
  variant?: "blue" | "white";
  children: React.ReactNode;
  className?: string;
  type?: "button" | "submit" | "reset";
  color?: ColorVariant;
}

export default function Button({
  href,
  onClick,
  variant = "blue",
  children,
  className = "",
  type = "button",
  color = "standard",
}: ButtonProps) {
  const [hovered, setHovered] = useState(false);

  const base =
    "inline-flex items-center justify-center font-semibold rounded-full text-[16px] transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 w-fit";

  const blueStyle = {
    backgroundColor: hovered ? blueHoverColors[color] : blueColors[color],
    color: "white",
    padding: "0.6em 1.5em",
  };

  const whiteStyle = {
    backgroundColor: hovered ? blueColors[color] : "white",
    color: hovered ? "white" : "#0c0c48",
    padding: "1em 3em",
    border: `1px solid white`,
  };

  const style = variant === "blue" ? blueStyle : whiteStyle;

  const props = {
    className: `${base} ${className}`,
    style,
    onMouseEnter: () => setHovered(true),
    onMouseLeave: () => setHovered(false),
  };

  if (href) {
    return (
      <Link href={href} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} {...props}>
      {children}
    </button>
  );
}

import React from "react";
import { cn } from "@/lib/utils";

interface HeadingProps {
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";
  children: React.ReactNode;
  className?: string;
}

export function Heading({ 
  as: Component = "h2", 
  size = "md", 
  children, 
  className, 
  ...props 
}: HeadingProps) {
  const sizeClasses = {
    xs: "text-xs",
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
    xl: "text-xl font-bold",
    "2xl": "text-2xl font-bold",
    "3xl": "text-3xl font-bold",
  };

  return (
    <Component
      className={cn(sizeClasses[size], className)}
      {...props}
    >
      {children}
    </Component>
  );
}

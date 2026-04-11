import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  variant: "success" | "error" | "warning" | "info" | "neutral" | "linkedin" | "medal";
  size?: "sm" | "md" | "lg";
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

const variantStyles = {
  success: "bg-success-light text-success",
  error: "bg-destructive/10 text-destructive",
  warning: "bg-warning-light text-warning-foreground",
  info: "bg-info-light text-info",
  neutral: "bg-secondary text-secondary-foreground",
  linkedin: "bg-linkedin-light text-linkedin",
  medal: "bg-medal-light text-medal-dark",
};

const sizeStyles = {
  sm: "text-[11px] px-1.5 py-0.5",
  md: "text-xs px-2 py-0.5",
  lg: "text-[13px] px-2.5 py-1",
};

export function StatusBadge({ variant, size = "md", icon, children, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full font-medium whitespace-nowrap",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {icon && <span className="flex-shrink-0 w-3 h-3">{icon}</span>}
      {children}
    </span>
  );
}

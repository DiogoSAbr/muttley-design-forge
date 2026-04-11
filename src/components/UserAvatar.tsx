import { cn } from "@/lib/utils";
import { useMemo } from "react";

interface UserAvatarProps {
  name: string;
  src?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: "w-7 h-7 text-[10px]",
  md: "w-10 h-10 text-sm",
  lg: "w-16 h-16 text-xl",
};

const avatarColors = [
  "bg-primary/20 text-primary",
  "bg-medal/20 text-medal-dark",
  "bg-success/20 text-success",
  "bg-info/20 text-info",
  "bg-warning/20 text-warning-foreground",
  "bg-destructive/20 text-destructive",
];

function hashName(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

export function UserAvatar({ name, src, size = "md", className }: UserAvatarProps) {
  const initials = useMemo(() => {
    return name
      .split(" ")
      .map((w) => w[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  }, [name]);

  const colorClass = avatarColors[hashName(name) % avatarColors.length];

  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center font-semibold flex-shrink-0 overflow-hidden",
        sizeMap[size],
        !src && colorClass,
        className
      )}
    >
      {src ? (
        <img src={src} alt={name} className="w-full h-full object-cover" />
      ) : (
        initials
      )}
    </div>
  );
}

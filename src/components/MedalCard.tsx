import { cn } from "@/lib/utils";
import { LinkedInStatusBadge } from "./LinkedInStatusBadge";
import { StatusBadge } from "./StatusBadge";
import { Award } from "lucide-react";

interface MedalCardProps {
  name: string;
  issuer: string;
  date: string;
  category?: string;
  description?: string;
  keywords?: string[];
  linkedInStatus: "published" | "pending" | "error";
  variant?: "compact" | "expanded";
  className?: string;
  onRetry?: () => void;
}

const categoryColors: Record<string, string> = {
  "Tecnologia": "border-l-info",
  "Liderança": "border-l-medal",
  "Comunicação": "border-l-success",
  "Gestão": "border-l-primary",
  "default": "border-l-muted-foreground",
};

export function MedalCard({
  name,
  issuer,
  date,
  category,
  description,
  keywords,
  linkedInStatus,
  variant = "compact",
  className,
  onRetry,
}: MedalCardProps) {
  const borderColor = category ? (categoryColors[category] || categoryColors["default"]) : categoryColors["default"];

  if (variant === "compact") {
    return (
      <div
        className={cn(
          "flex items-center gap-3 px-4 py-3 bg-card rounded-lg border border-border shadow-card hover:shadow-elevated transition-shadow duration-200 border-l-[3px]",
          borderColor,
          className
        )}
      >
        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-medal/10 flex items-center justify-center">
          <Award className="w-5 h-5 text-medal" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-card-foreground truncate">{name}</p>
          <p className="text-xs text-muted-foreground truncate">{issuer} · {date}</p>
        </div>
        <LinkedInStatusBadge status={linkedInStatus} onRetry={onRetry} />
      </div>
    );
  }

  return (
    <div className={cn("bg-card rounded-xl border border-border shadow-card p-6", className)}>
      <div className="flex flex-col items-center text-center mb-4">
        <div className="w-20 h-20 rounded-xl bg-medal/10 flex items-center justify-center mb-3">
          <Award className="w-10 h-10 text-medal" />
        </div>
        <h3 className="text-lg font-medium text-card-foreground">{name}</h3>
        {description && (
          <p className="text-sm text-muted-foreground mt-1 line-clamp-3">{description}</p>
        )}
      </div>
      <div className="space-y-3 text-sm">
        <div className="flex justify-between text-muted-foreground">
          <span>Emissor</span>
          <span className="text-card-foreground font-medium">{issuer}</span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>Data</span>
          <span className="text-card-foreground">{date}</span>
        </div>
        {category && (
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Categoria</span>
            <StatusBadge variant="medal" size="sm">{category}</StatusBadge>
          </div>
        )}
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">LinkedIn</span>
          <LinkedInStatusBadge status={linkedInStatus} onRetry={onRetry} />
        </div>
      </div>
      {keywords && keywords.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-4 pt-4 border-t border-border">
          {keywords.map((kw) => (
            <span key={kw} className="px-2 py-0.5 bg-secondary text-secondary-foreground text-[11px] rounded-full">
              {kw}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

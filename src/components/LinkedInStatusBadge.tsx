import { cn } from "@/lib/utils";
import { Check, Clock, AlertTriangle, Linkedin } from "lucide-react";
import { StatusBadge } from "./StatusBadge";

type LinkedInStatus = "published" | "pending" | "error";

interface LinkedInStatusBadgeProps {
  status: LinkedInStatus;
  onRetry?: () => void;
  className?: string;
}

export function LinkedInStatusBadge({ status, onRetry, className }: LinkedInStatusBadgeProps) {
  if (status === "published") {
    return (
      <StatusBadge variant="linkedin" icon={<Linkedin className="w-3 h-3" />} className={className}>
        Publicado
      </StatusBadge>
    );
  }

  if (status === "pending") {
    return (
      <StatusBadge variant="warning" icon={<Clock className="w-3 h-3" />} className={className}>
        Aguardando
      </StatusBadge>
    );
  }

  return (
    <div className={cn("inline-flex items-center gap-1.5", className)}>
      <StatusBadge variant="error" icon={<AlertTriangle className="w-3 h-3" />}>
        Erro
      </StatusBadge>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-xs text-destructive hover:underline font-medium"
        >
          Tentar novamente
        </button>
      )}
    </div>
  );
}

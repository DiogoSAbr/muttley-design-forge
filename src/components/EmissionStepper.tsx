import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface EmissionStepperProps {
  currentStep: number;
  steps: string[];
  className?: string;
}

export function EmissionStepper({ currentStep, steps, className }: EmissionStepperProps) {
  return (
    <div className={cn("flex items-center w-full", className)}>
      {steps.map((label, idx) => {
        const isCompleted = idx < currentStep;
        const isActive = idx === currentStep;
        const isFuture = idx > currentStep;

        return (
          <div key={idx} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200 border-2",
                  isCompleted && "bg-primary border-primary text-primary-foreground",
                  isActive && "border-primary text-primary bg-primary/10",
                  isFuture && "border-border text-muted-foreground bg-card"
                )}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4 animate-check" />
                ) : (
                  idx + 1
                )}
              </div>
              <span
                className={cn(
                  "text-xs whitespace-nowrap",
                  isActive && "text-primary font-medium",
                  isCompleted && "text-foreground font-medium",
                  isFuture && "text-muted-foreground"
                )}
              >
                {label}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div className="flex-1 mx-3 mt-[-20px]">
                <div className="h-[2px] w-full bg-border rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full bg-primary transition-all duration-300",
                      isCompleted ? "w-full" : "w-0"
                    )}
                  />
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

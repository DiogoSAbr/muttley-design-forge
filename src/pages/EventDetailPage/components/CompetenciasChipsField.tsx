import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface CompetenciasChipsFieldProps {
    value: string[];
    onChange: (next: string[]) => void;
    max?: number;
    maxLength?: number;
    disabled?: boolean;
}

export function CompetenciasChipsField({
    value,
    onChange,
    max = 10,
    maxLength = 15,
    disabled = false,
}: CompetenciasChipsFieldProps) {
    const [input, setInput] = useState("");

    const trimmed = input.trim();
    const canAdd =
        !disabled &&
        trimmed.length > 0 &&
        trimmed.length <= maxLength &&
        value.length < max &&
        !value.includes(trimmed);

    function addCompetency() {
        if (!canAdd) return;
        onChange([...value, trimmed]);
        setInput("");
    }

    function removeAt(index: number) {
        if (disabled) return;
        onChange(value.filter((_, i) => i !== index));
    }

    return (
        <div className="space-y-2">
            <div className="flex gap-2">
                <Input
                    placeholder="Adicionar competência..."
                    value={input}
                    maxLength={maxLength}
                    disabled={disabled}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => {
                        if (e.key === "Enter") {
                            e.preventDefault();
                            addCompetency();
                        }
                    }}
                />
                <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    disabled={!canAdd}
                    onClick={addCompetency}
                >
                    <Plus className="w-4 h-4" />
                </Button>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
                <span>{input.length}/{maxLength}</span>
                <span>{value.length}/{max}</span>
            </div>
            {value.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                    {value.map((c, i) => (
                        <span
                            key={`${c}-${i}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-accent text-accent-foreground border border-border"
                        >
                            {c}
                            {!disabled && (
                                <button
                                    type="button"
                                    onClick={() => removeAt(i)}
                                    className="text-muted-foreground hover:text-destructive"
                                    aria-label={`Remover ${c}`}
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            )}
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}

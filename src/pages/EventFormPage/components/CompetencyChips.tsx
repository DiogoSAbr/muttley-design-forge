import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useFormContext } from "react-hook-form";
import type { EventFormValues } from "../eventFormSchema";

const MAX_COMPETENCIAS = 10;
const MAX_LEN = 15;

export function CompetencyChips() {
    const { watch, setValue, formState: { errors } } = useFormContext<EventFormValues>();
    const competencias = watch("competencias") ?? [];
    const [input, setInput] = useState("");

    const canAdd =
        input.trim().length > 0 &&
        input.trim().length <= MAX_LEN &&
        competencias.length < MAX_COMPETENCIAS &&
        !competencias.includes(input.trim());

    function addCompetency() {
        if (!canAdd) return;
        setValue("competencias", [...competencias, input.trim()], { shouldValidate: true });
        setInput("");
    }

    function removeAt(index: number) {
        setValue(
            "competencias",
            competencias.filter((_, i) => i !== index),
            { shouldValidate: true }
        );
    }

    const error = errors.competencias?.message;

    return (
        <div className="space-y-2">
            <div className="flex gap-2">
                <Input
                    placeholder="Adicionar competência..."
                    value={input}
                    maxLength={MAX_LEN}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            e.preventDefault();
                            addCompetency();
                        }
                    }}
                />
                <Button type="button" variant="outline" size="icon" disabled={!canAdd} onClick={addCompetency}>
                    <Plus className="w-4 h-4" />
                </Button>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
                <span>{input.length}/{MAX_LEN}</span>
                <span>{competencias.length}/{MAX_COMPETENCIAS}</span>
            </div>
            {competencias.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                    {competencias.map((c, i) => (
                        <span
                            key={`${c}-${i}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-accent text-accent-foreground border border-border"
                        >
                            {c}
                            <button
                                type="button"
                                onClick={() => removeAt(i)}
                                className="text-muted-foreground hover:text-destructive"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </span>
                    ))}
                </div>
            )}
            {error && <p className="text-xs text-destructive">{error as string}</p>}
        </div>
    );
}

import { useFormContext, Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { MODALIDADE_OPTIONS } from "@/models/Event/EventCreatePayload";
import type { EventFormValues } from "../eventFormSchema";

function FieldError({ message }: { message?: string }) {
    if (!message) return null;
    return <p className="text-xs text-destructive mt-1">{message}</p>;
}

export function LocationStep() {
    const { register, control, watch, formState: { errors } } = useFormContext<EventFormValues>();
    const modalidade = watch("modalidade");
    const isRemoto = modalidade === "REMOTO";

    return (
        <div className="space-y-4">
            <Controller
                control={control}
                name="modalidade"
                render={({ field }) => (
                    <div>
                        <Label>Modalidade *</Label>
                        <Select value={field.value ?? ""} onValueChange={field.onChange}>
                            <SelectTrigger className="mt-1">
                                <SelectValue placeholder="Selecione a modalidade" />
                            </SelectTrigger>
                            <SelectContent>
                                {MODALIDADE_OPTIONS.map((opt) => (
                                    <SelectItem key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <FieldError message={errors.modalidade?.message as string | undefined} />
                    </div>
                )}
            />

            <div>
                <Label htmlFor="endereco">
                    {isRemoto ? "Endereço ou link da sala (opcional)" : "Endereço *"}
                </Label>
                <Input
                    id="endereco"
                    className="mt-1"
                    placeholder={
                        isRemoto
                            ? "Ex: https://meet.exemplo.com/sala-123"
                            : "Ex: Bloco A — Sala 203, FATEC Zona Leste"
                    }
                    {...register("endereco")}
                />
                <FieldError message={errors.endereco?.message as string | undefined} />
            </div>

            <div>
                <Label htmlFor="capacidade">Capacidade (opcional)</Label>
                <Input
                    id="capacidade"
                    type="number"
                    min={1}
                    className="mt-1"
                    placeholder="Número de vagas"
                    {...register("capacidade", { valueAsNumber: true })}
                />
                <FieldError message={errors.capacidade?.message as string | undefined} />
            </div>
        </div>
    );
}

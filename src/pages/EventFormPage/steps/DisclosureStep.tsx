import { useFormContext, Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { TIPO_OPTIONS } from "@/models/Event/EventCreatePayload";
import { CompetencyChips } from "../components/CompetencyChips";
import type { EventFormValues } from "../eventFormSchema";

function FieldError({ message }: { message?: string }) {
    if (!message) return null;
    return <p className="text-xs text-destructive mt-1">{message}</p>;
}

export function DisclosureStep() {
    const { register, control, watch, formState: { errors } } = useFormContext<EventFormValues>();
    const assunto = watch("assuntoEvento") ?? "";
    const descricao = watch("descricao") ?? "";

    return (
        <div className="space-y-4">
            <Controller
                control={control}
                name="tipo"
                render={({ field }) => (
                    <div>
                        <Label>Tipo *</Label>
                        <Select value={field.value ?? ""} onValueChange={field.onChange}>
                            <SelectTrigger className="mt-1">
                                <SelectValue placeholder="Selecione o tipo do evento" />
                            </SelectTrigger>
                            <SelectContent>
                                {TIPO_OPTIONS.map((opt) => (
                                    <SelectItem key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <FieldError message={errors.tipo?.message as string | undefined} />
                    </div>
                )}
            />

            <div>
                <Label htmlFor="assunto">Assunto do evento *</Label>
                <Input
                    id="assunto"
                    className="mt-1"
                    placeholder="Ex: Desenvolvimento Front-End com React"
                    maxLength={50}
                    {...register("assuntoEvento")}
                />
                <div className="flex justify-between mt-1">
                    <FieldError message={errors.assuntoEvento?.message as string | undefined} />
                    <span className="text-xs text-muted-foreground ml-auto">{assunto.length}/50</span>
                </div>
            </div>

            <div>
                <Label>Competências</Label>
                <p className="text-xs text-muted-foreground mb-2">
                    Até 10 itens, 15 caracteres cada.
                </p>
                <CompetencyChips />
            </div>

            <div>
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                    id="descricao"
                    className="mt-1"
                    rows={4}
                    placeholder="Detalhes do evento, objetivos, programação..."
                    maxLength={255}
                    {...register("descricao")}
                />
                <div className="flex justify-between mt-1">
                    <FieldError message={errors.descricao?.message as string | undefined} />
                    <span className="text-xs text-muted-foreground ml-auto">{descricao.length}/255</span>
                </div>
            </div>
        </div>
    );
}

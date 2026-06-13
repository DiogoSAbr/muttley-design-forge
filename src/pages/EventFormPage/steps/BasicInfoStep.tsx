import { useFormContext, Controller } from "react-hook-form";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { EventFormValues } from "../eventFormSchema";

function FieldError({ message }: { message?: string }) {
    if (!message) return null;
    return <p className="text-xs text-destructive mt-1">{message}</p>;
}

function DateField({
    name,
    label,
    required,
}: {
    name: "dataInicial" | "dataFinal";
    label: string;
    required?: boolean;
}) {
    const { control, formState: { errors } } = useFormContext<EventFormValues>();
    const errorMessage = errors[name]?.message as string | undefined;

    return (
        <Controller
            control={control}
            name={name}
            render={({ field }) => {
                const date = field.value ? new Date(`${field.value}T00:00:00`) : undefined;
                return (
                    <div>
                        <Label>
                            {label} {required && "*"}
                        </Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    type="button"
                                    variant="outline"
                                    className={cn(
                                        "mt-1 w-full justify-start font-normal",
                                        !date && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="w-4 h-4 mr-2" />
                                    {date
                                        ? format(date, "dd/MM/yyyy", { locale: ptBR })
                                        : "Selecione a data"}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={date}
                                    onSelect={(d) => {
                                        if (d) {
                                            const yyyy = d.getFullYear();
                                            const mm = String(d.getMonth() + 1).padStart(2, "0");
                                            const dd = String(d.getDate()).padStart(2, "0");
                                            field.onChange(`${yyyy}-${mm}-${dd}`);
                                        } else {
                                            field.onChange("");
                                        }
                                    }}
                                    locale={ptBR}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                        <FieldError message={errorMessage} />
                    </div>
                );
            }}
        />
    );
}

function TimeField({
    name,
    label,
    required,
}: {
    name: "horaInicial" | "horaFinal";
    label: string;
    required?: boolean;
}) {
    const { control, formState: { errors } } = useFormContext<EventFormValues>();
    const errorMessage = errors[name]?.message as string | undefined;

    return (
        <Controller
            control={control}
            name={name}
            render={({ field }) => (
                <div>
                    <Label htmlFor={name}>
                        {label} {required && "*"}
                    </Label>
                    <Input
                        id={name}
                        type="time"
                        className="mt-1"
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.value)}
                    />
                    <FieldError message={errorMessage} />
                </div>
            )}
        />
    );
}

function CargaHorariaField() {
    const { control, formState: { errors } } = useFormContext<EventFormValues>();
    const errorMessage = errors.cargaHoraria?.message as string | undefined;

    return (
        <Controller
            control={control}
            name="cargaHoraria"
            render={({ field }) => {
                const display =
                    typeof field.value === "number" ? String(field.value) : "";

                function handleChange(raw: string) {
                    const digits = raw.replace(/\D/g, "");
                    if (digits === "") {
                        field.onChange(undefined);
                        return;
                    }
                    const num = Math.min(99, parseInt(digits, 10));
                    field.onChange(num);
                }

                return (
                    <div>
                        <Label htmlFor="cargaHoraria">Carga horária *</Label>
                        <div className="relative mt-1">
                            <Input
                                id="cargaHoraria"
                                type="text"
                                inputMode="numeric"
                                placeholder="Ex: 8"
                                value={display}
                                onChange={(e) => handleChange(e.target.value)}
                                className={cn(display && "pr-16")}
                            />
                            {display && (
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
                                    horas
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Apenas horas inteiras (1 a 99).
                        </p>
                        <FieldError message={errorMessage} />
                    </div>
                );
            }}
        />
    );
}

export function BasicInfoStep() {
    const { register, watch, formState: { errors } } = useFormContext<EventFormValues>();
    const titulo = watch("titulo") ?? "";

    return (
        <div className="space-y-4">
            <div>
                <Label htmlFor="titulo">Título *</Label>
                <Input
                    id="titulo"
                    className="mt-1"
                    placeholder="Ex: Workshop React"
                    maxLength={20}
                    {...register("titulo")}
                />
                <div className="flex justify-between mt-1">
                    <FieldError message={errors.titulo?.message as string | undefined} />
                    <span className="text-xs text-muted-foreground ml-auto">{titulo.length}/20</span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <DateField name="dataInicial" label="Data inicial" required />
                <DateField name="dataFinal" label="Data final" />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <TimeField name="horaInicial" label="Hora inicial" required />
                <TimeField name="horaFinal" label="Hora final" required />
            </div>

            <CargaHorariaField />

            <div>
                <Label htmlFor="pontos">Pontos *</Label>
                <Input
                    id="pontos"
                    type="number"
                    min={1}
                    max={100}
                    className="mt-1"
                    placeholder="1 a 100"
                    {...register("pontos", { valueAsNumber: true })}
                />
                <FieldError message={errors.pontos?.message as string | undefined} />
            </div>
        </div>
    );
}

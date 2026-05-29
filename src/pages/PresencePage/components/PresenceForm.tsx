import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ApiError } from "@/lib/api/client";
import { maskCpf } from "@/lib/cpf";
import { PublicEventService } from "@/services/PublicEventService";
import { presenceSchema, type PresenceFormValues } from "../presenceSchema";

function FieldError({ message }: { message?: string }) {
    if (!message) return null;
    return <p className="text-xs text-destructive mt-1">{message}</p>;
}

export function PresenceForm({
    eventId,
    onSuccess,
}: {
    eventId: string;
    onSuccess: () => void;
}) {
    const { toast } = useToast();
    const [submitting, setSubmitting] = useState(false);

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<PresenceFormValues>({
        resolver: zodResolver(presenceSchema),
        mode: "onBlur",
        defaultValues: { cpf: "" },
    });

    async function onSubmit(values: PresenceFormValues) {
        setSubmitting(true);
        try {
            await PublicEventService.confirmPresence(eventId, values);
            onSuccess();
        } catch (err) {
            const description =
                err instanceof ApiError
                    ? err.message
                    : "Não foi possível confirmar a presença. Tente novamente.";
            toast({ variant: "destructive", title: "Erro", description });
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="text-lg">Confirmação de presença</CardTitle>
                <CardDescription>
                    Informe seu CPF para confirmar sua presença no evento.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                    <Controller
                        control={control}
                        name="cpf"
                        render={({ field }) => (
                            <div>
                                <Label htmlFor="cpf">CPF *</Label>
                                <Input
                                    id="cpf"
                                    inputMode="numeric"
                                    className="mt-1"
                                    placeholder="000.000.000-00"
                                    maxLength={14}
                                    value={maskCpf(field.value ?? "")}
                                    onChange={(e) => field.onChange(maskCpf(e.target.value))}
                                    onBlur={field.onBlur}
                                    autoFocus
                                />
                                <FieldError message={errors.cpf?.message} />
                            </div>
                        )}
                    />

                    <Button type="submit" className="w-full" loading={submitting}>
                        Confirmar Presença
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}

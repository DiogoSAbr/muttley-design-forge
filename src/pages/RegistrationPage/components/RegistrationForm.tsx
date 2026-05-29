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
import { registrationSchema, type RegistrationFormValues } from "../registrationSchema";

function FieldError({ message }: { message?: string }) {
    if (!message) return null;
    return <p className="text-xs text-destructive mt-1">{message}</p>;
}

export function RegistrationForm({
    eventId,
    onSuccess,
}: {
    eventId: string;
    onSuccess: () => void;
}) {
    const { toast } = useToast();
    const [submitting, setSubmitting] = useState(false);

    const {
        register,
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<RegistrationFormValues>({
        resolver: zodResolver(registrationSchema),
        mode: "onBlur",
        defaultValues: { nome: "", email: "", cpf: "" },
    });

    async function onSubmit(values: RegistrationFormValues) {
        setSubmitting(true);
        try {
            await PublicEventService.registerParticipant(eventId, values);
            onSuccess();
        } catch (err) {
            const description =
                err instanceof ApiError
                    ? err.message
                    : "Não foi possível realizar a inscrição. Tente novamente.";
            toast({ variant: "destructive", title: "Erro", description });
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="text-lg">Inscrição no evento</CardTitle>
                <CardDescription>
                    Preencha seus dados para confirmar sua participação.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                    <div>
                        <Label htmlFor="nome">Nome *</Label>
                        <Input
                            id="nome"
                            className="mt-1"
                            placeholder="Seu nome completo"
                            autoComplete="name"
                            {...register("nome")}
                        />
                        <FieldError message={errors.nome?.message} />
                    </div>

                    <div>
                        <Label htmlFor="email">E-mail *</Label>
                        <Input
                            id="email"
                            type="email"
                            className="mt-1"
                            placeholder="seu@email.com"
                            autoComplete="email"
                            {...register("email")}
                        />
                        <FieldError message={errors.email?.message} />
                    </div>

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
                                />
                                <FieldError message={errors.cpf?.message} />
                            </div>
                        )}
                    />

                    <Button type="submit" className="w-full" loading={submitting}>
                        Realizar Inscrição
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}

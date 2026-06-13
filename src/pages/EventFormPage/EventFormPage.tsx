import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, Check, CheckCircle2 } from "lucide-react";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { ApiError } from "@/lib/api/client";
import { EventService } from "@/services/EventService";
import type { ParticipanteEvento, TipoParticipante } from "@/models/Client/Client";
import {
    eventFormSchema,
    emptyFormValues,
    STEP_LABELS,
    STEP_FIELDS,
    type EventFormValues,
} from "./eventFormSchema";
import { ClientsCacheProvider } from "./ClientsCacheContext";
import { BasicInfoStep } from "./steps/BasicInfoStep";
import { DisclosureStep } from "./steps/DisclosureStep";
import { LocationStep } from "./steps/LocationStep";
import { OrganizationStep } from "./steps/OrganizationStep";
import { SignatureStep } from "./steps/SignatureStep";

function Stepper({ step }: { step: number }) {
    return (
        <div className="flex items-center gap-1 mb-8">
            {STEP_LABELS.map((label, i) => (
                <div key={label} className="flex-1 flex flex-col items-center gap-1.5">
                    <div
                        className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all",
                            i < step
                                ? "bg-primary text-primary-foreground"
                                : i === step
                                    ? "bg-primary text-primary-foreground ring-2 ring-primary/30"
                                    : "bg-muted text-muted-foreground"
                        )}
                    >
                        {i < step ? <Check className="w-4 h-4" /> : i + 1}
                    </div>
                    <span
                        className={cn(
                            "text-[10px] leading-tight text-center",
                            i <= step ? "text-foreground font-medium" : "text-muted-foreground"
                        )}
                    >
                        {label}
                    </span>
                </div>
            ))}
        </div>
    );
}

function SuccessScreen({
    title,
    onCreateAnother,
}: {
    title: string;
    onCreateAnother: () => void;
}) {
    const navigate = useNavigate();
    return (
        <div className="min-h-screen bg-background">
            <AppSidebar />
            <main className="ml-60 p-8">
                <div className="max-w-2xl mx-auto text-center py-20 animate-fade-in">
                    <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="w-8 h-8 text-green-600" />
                    </div>
                    <h2 className="text-xl font-semibold text-foreground mb-2">
                        Evento criado com sucesso!
                    </h2>
                    <p className="text-muted-foreground mb-1 font-medium">{title}</p>
                    <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
                        O evento foi enviado para o servidor. A listagem ainda utiliza dados de teste
                        e será atualizada em breve.
                    </p>
                    <div className="flex gap-3 justify-center">
                        <Button variant="outline" onClick={() => navigate("/events")}>
                            Voltar à listagem
                        </Button>
                        <Button onClick={onCreateAnother}>Criar outro evento</Button>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default function EventFormPage() {
    const { toast } = useToast();
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [step, setStep] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState<{ titulo: string } | null>(null);

    const methods = useForm<EventFormValues>({
        resolver: zodResolver(eventFormSchema),
        defaultValues: emptyFormValues as EventFormValues,
        mode: "onBlur",
    });

    if (id) {
        return (
            <div className="min-h-screen bg-background">
                <AppSidebar />
                <main className="ml-60 p-8">
                    <div className="max-w-2xl mx-auto py-20 text-center">
                        <h2 className="text-lg font-semibold mb-2">Edição indisponível</h2>
                        <p className="text-sm text-muted-foreground mb-6">
                            A edição de eventos será reativada quando o endpoint de atualização
                            estiver disponível.
                        </p>
                        <Button variant="outline" onClick={() => navigate("/events")}>
                            <ArrowLeft className="w-4 h-4 mr-1" /> Voltar à listagem
                        </Button>
                    </div>
                </main>
            </div>
        );
    }

    async function handleNext() {
        const fields = STEP_FIELDS[step];
        const valid = await methods.trigger(fields as (keyof EventFormValues)[]);
        if (valid) setStep((s) => s + 1);
    }

    async function handleSubmit() {
        const valid = await methods.trigger();
        if (!valid) return;

        const values = methods.getValues();
        setSubmitting(true);
        try {
            await EventService.create({
                titulo: values.titulo,
                dataInicial: values.dataInicial,
                dataFinal: values.dataFinal || undefined,
                horaInicial: values.horaInicial,
                horaFinal: values.horaFinal,
                cargaHoraria: values.cargaHoraria,
                pontos: values.pontos,
                tipo: values.tipo,
                assuntoEvento: values.assuntoEvento,
                descricao: values.descricao || undefined,
                competencias: values.competencias,
                modalidade: values.modalidade,
                endereco: values.endereco || undefined,
                capacidade:
                    typeof values.capacidade === "number" && !Number.isNaN(values.capacidade)
                        ? values.capacidade
                        : undefined,
                nomeSignatario: values.nomeSignatario,
                cargoSignatario: values.cargoSignatario,
                participantes: (values.participantesEquipe ?? []).map(
                    (p): ParticipanteEvento => ({
                        clientId: p.clientId as string,
                        tipoParticipante: p.tipoParticipante as TipoParticipante,
                    })
                ),
                arquivoAssinaturaSignatario: values.arquivoAssinaturaSignatario,
            });
            toast({ title: "Evento criado com sucesso" });
            setSuccess({ titulo: values.titulo });
        } catch (err) {
            const message =
                err instanceof ApiError ? err.message : "Falha ao criar evento.";
            toast({
                title: "Não foi possível criar o evento",
                description: message,
                variant: "destructive",
            });
        } finally {
            setSubmitting(false);
        }
    }

    function resetForCreateAnother() {
        methods.reset(emptyFormValues as EventFormValues);
        setStep(0);
        setSuccess(null);
    }

    if (success) {
        return <SuccessScreen title={success.titulo} onCreateAnother={resetForCreateAnother} />;
    }

    const isLastStep = step === STEP_LABELS.length - 1;

    return (
        <FormProvider {...methods}>
            <ClientsCacheProvider>
                <div className="min-h-screen bg-background">
                    <AppSidebar />
                    <main className="ml-60 p-8">
                        <div className="max-w-2xl mx-auto animate-fade-in">
                            <div className="flex items-center gap-3 mb-6">
                                <Button variant="ghost" size="sm" onClick={() => navigate("/events")}>
                                    <ArrowLeft className="w-4 h-4 mr-1" /> Voltar
                                </Button>
                                <h1 className="text-xl font-semibold text-foreground">Novo evento</h1>
                            </div>

                            <Stepper step={step} />

                            <div className="bg-card border border-border rounded-xl p-6 mb-6">
                                {step === 0 && <BasicInfoStep />}
                                {step === 1 && <DisclosureStep />}
                                {step === 2 && <LocationStep />}
                                {step === 3 && <OrganizationStep />}
                                {step === 4 && <SignatureStep />}
                            </div>

                            <div className="flex justify-between">
                                {step > 0 ? (
                                    <Button
                                        variant="outline"
                                        onClick={() => setStep((s) => s - 1)}
                                        disabled={submitting}
                                    >
                                        <ArrowLeft className="w-4 h-4 mr-1" /> Voltar
                                    </Button>
                                ) : (
                                    <div />
                                )}
                                {!isLastStep ? (
                                    <Button onClick={handleNext}>
                                        Próximo <ArrowRight className="w-4 h-4 ml-1" />
                                    </Button>
                                ) : (
                                    <Button onClick={handleSubmit} loading={submitting}>
                                        <Check className="w-4 h-4 mr-1" /> Finalizar cadastro
                                    </Button>
                                )}
                            </div>
                        </div>
                    </main>
                </div>
            </ClientsCacheProvider>
        </FormProvider>
    );
}

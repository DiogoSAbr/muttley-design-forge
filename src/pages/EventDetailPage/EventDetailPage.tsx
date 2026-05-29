import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { ApiError } from "@/lib/api/client";
import { EventService } from "@/services/EventService";
import type { EventUpdatePayload } from "@/models/Event/EventUpdatePayload";
import { useEventDetail } from "./hooks/useEventDetail";
import { ConfirmDialog } from "./components/ConfirmDialog";
import { EventDetailHeader } from "./components/EventDetailHeader";
import {
    InformacoesTab,
    buildDraft,
    type EventDraft,
} from "./components/InformacoesTab";
import { LinksTab } from "./components/LinksTab";
import { ParticipantsTab } from "./components/ParticipantsTab";

type ConfirmAction = "save" | "delete" | "finalize" | null;

export default function EventDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();
    const { data, loading, error, refetch } = useEventDetail(id);

    const [mode, setMode] = useState<"view" | "edit">("view");
    const [draft, setDraft] = useState<EventDraft | null>(null);
    const [signatureFile, setSignatureFile] = useState<File | null>(null);
    const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        if (mode === "view") {
            setDraft(null);
            setSignatureFile(null);
        }
    }, [mode]);

    useEffect(() => {
        if (data && mode === "edit" && !draft) {
            setDraft(buildDraft(data));
        }
    }, [data, mode, draft]);

    function handleEditToggle() {
        if (!data) return;
        if (mode === "edit") {
            setMode("view");
            return;
        }
        setDraft(buildDraft(data));
        setSignatureFile(null);
        setMode("edit");
    }

    function handleSaveClick() {
        setConfirmAction("save");
    }

    async function confirmSave() {
        if (!id || !draft) return;
        setActionLoading(true);
        try {
            const payload: EventUpdatePayload = {
                titulo: draft.titulo,
                dataInicial: draft.dataInicial,
                dataFinal: draft.dataFinal || null,
                cargaHoraria: draft.cargaHoraria,
                pontos: draft.pontos,
                tipo: draft.tipo,
                assuntoEvento: draft.assuntoEvento,
                descricao: draft.descricao || null,
                competencias: draft.competencias,
                modalidade: draft.modalidade,
                endereco: draft.endereco || null,
                capacidade: draft.capacidade === "" ? null : draft.capacidade,
                nomeSignatario: draft.nomeSignatario,
                cargoSignatario: draft.cargoSignatario,
                participantes: draft.participantes,
                arquivoAssinaturaSignatario: signatureFile ?? undefined,
            };
            await EventService.update(id, payload);
            toast({ title: "Evento atualizado", description: "As alterações foram salvas." });
            setConfirmAction(null);
            setMode("view");
            refetch();
        } catch (err) {
            const message =
                err instanceof ApiError
                    ? err.message
                    : "Não foi possível salvar as alterações.";
            toast({ title: "Erro ao salvar", description: message, variant: "destructive" });
        } finally {
            setActionLoading(false);
        }
    }

    async function confirmDelete() {
        if (!id) return;
        setActionLoading(true);
        try {
            await EventService.remove(id);
            toast({ title: "Evento excluído" });
            setConfirmAction(null);
            navigate("/events");
        } catch (err) {
            const message =
                err instanceof ApiError
                    ? err.message
                    : "Não foi possível excluir o evento.";
            toast({ title: "Erro ao excluir", description: message, variant: "destructive" });
        } finally {
            setActionLoading(false);
        }
    }

    async function confirmFinalize() {
        if (!id) return;
        setActionLoading(true);
        try {
            await EventService.finalize(id);
            toast({ title: "Evento finalizado" });
            setConfirmAction(null);
            refetch();
        } catch (err) {
            const message =
                err instanceof ApiError
                    ? err.message
                    : "Não foi possível finalizar o evento.";
            toast({ title: "Erro ao finalizar", description: message, variant: "destructive" });
        } finally {
            setActionLoading(false);
        }
    }

    function handleConfirm() {
        if (confirmAction === "save") return confirmSave();
        if (confirmAction === "delete") return confirmDelete();
        if (confirmAction === "finalize") return confirmFinalize();
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-background">
                <AppSidebar />
                <main className="ml-60 p-8">
                    <div className="max-w-5xl mx-auto space-y-6">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-80" />
                        <Card className="p-6 space-y-4">
                            <Skeleton className="h-6 w-40" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-3/4" />
                        </Card>
                    </div>
                </main>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="min-h-screen bg-background">
                <AppSidebar />
                <main className="ml-60 p-8 flex items-center justify-center">
                    <div className="text-center space-y-3">
                        <p className="text-muted-foreground">
                            {error ?? "Evento não encontrado."}
                        </p>
                        <div className="flex items-center justify-center gap-2">
                            <Button variant="outline" onClick={() => navigate("/events")}>
                                <ArrowLeft className="w-4 h-4 mr-1" /> Voltar
                            </Button>
                            {error && (
                                <Button variant="outline" onClick={refetch}>
                                    Tentar novamente
                                </Button>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <AppSidebar />
            <main className="ml-60 p-8">
                <div className="max-w-5xl mx-auto animate-fade-in space-y-6">
                    <EventDetailHeader
                        titulo={data.titulo}
                        finalized={data.finalized}
                        mode={mode}
                        actionLoading={actionLoading}
                        onBack={() => navigate("/events")}
                        onEditToggle={handleEditToggle}
                        onSave={handleSaveClick}
                        onDelete={() => setConfirmAction("delete")}
                        onFinalize={() => setConfirmAction("finalize")}
                    />

                    <Tabs defaultValue="informacoes">
                        <TabsList>
                            <TabsTrigger value="informacoes">Informações</TabsTrigger>
                            <TabsTrigger value="participantes" disabled={mode === "edit"}>
                                Participantes
                            </TabsTrigger>
                            <TabsTrigger value="links" disabled={mode === "edit"}>
                                Links
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="informacoes" className="mt-4">
                            <InformacoesTab
                                detail={data}
                                mode={mode}
                                draft={draft ?? buildDraft(data)}
                                onDraftChange={setDraft}
                                signatureFile={signatureFile}
                                onSignatureFileChange={setSignatureFile}
                            />
                        </TabsContent>

                        <TabsContent value="participantes" className="mt-4">
                            <ParticipantsTab eventId={data.id} />
                        </TabsContent>

                        <TabsContent value="links" className="mt-4">
                            <LinksTab
                                qrCodeInscricao={data.qrCodeInscricao}
                                urlInscricao={data.urlInscricao}
                                qrCodeConfirmacao={data.qrCodeConfirmacao}
                                urlConfirmacao={data.urlConfirmacao}
                            />
                        </TabsContent>
                    </Tabs>
                </div>
            </main>

            <ConfirmDialog
                open={confirmAction === "save"}
                onOpenChange={open => !open && setConfirmAction(null)}
                title="Salvar alterações?"
                description="As alterações realizadas serão aplicadas ao evento."
                confirmLabel="Salvar"
                loading={actionLoading}
                onConfirm={handleConfirm}
            />

            <ConfirmDialog
                open={confirmAction === "delete"}
                onOpenChange={open => !open && setConfirmAction(null)}
                title="Excluir evento?"
                description="Esta ação não poderá ser desfeita. O evento será permanentemente removido."
                confirmLabel="Excluir"
                variant="destructive"
                loading={actionLoading}
                onConfirm={handleConfirm}
            />

            <ConfirmDialog
                open={confirmAction === "finalize"}
                onOpenChange={open => !open && setConfirmAction(null)}
                title="Finalizar evento?"
                description="O evento será marcado como finalizado e não aceitará novas alterações de status."
                confirmLabel="Finalizar"
                loading={actionLoading}
                onConfirm={handleConfirm}
            />
        </div>
    );
}

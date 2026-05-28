import { useFormContext } from "react-hook-form";
import { X } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ClientPicker } from "../components/ClientPicker";
import { useClientsCache } from "../ClientsCacheContext";
import type { EventFormValues } from "../eventFormSchema";
import type { TipoParticipante } from "@/models/Client/Client";

const TIPO_LABEL: Record<TipoParticipante, string> = {
    ORGANIZADOR: "Organizadores",
    PALESTRANTE: "Palestrantes",
    PATROCINADOR: "Patrocinadores",
};

function ParticipantesSummary() {
    const { watch, setValue } = useFormContext<EventFormValues>();
    const { getClient } = useClientsCache();
    const participantes = watch("participantesEquipe") ?? [];

    function removeAt(clientId: string, tipo: TipoParticipante) {
        setValue(
            "participantesEquipe",
            participantes.filter(
                (p) => !(p.clientId === clientId && p.tipoParticipante === tipo)
            ),
            { shouldValidate: true }
        );
    }

    return (
        <div className="grid grid-cols-3 gap-3 mt-4">
            {(["ORGANIZADOR", "PALESTRANTE", "PATROCINADOR"] as TipoParticipante[]).map((tipo) => {
                const items = participantes.filter((p) => p.tipoParticipante === tipo);
                return (
                    <div key={tipo} className="bg-muted/40 rounded-lg p-3 min-h-[80px]">
                        <p className="text-xs font-medium text-muted-foreground mb-2">
                            {TIPO_LABEL[tipo]} ({items.length})
                        </p>
                        <div className="space-y-1 max-h-32 overflow-y-auto">
                            {items.length === 0 && (
                                <p className="text-xs text-muted-foreground italic">Nenhum</p>
                            )}
                            {items.map((p) => {
                                const client = getClient(p.clientId);
                                return (
                                    <div
                                        key={`${tipo}-${p.clientId}`}
                                        className="flex items-center gap-1 text-xs bg-background border border-border rounded px-2 py-1"
                                    >
                                        <span className="flex-1 truncate" title={client?.nome ?? p.clientId}>
                                            {client?.nome ?? `#${p.clientId}`}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => removeAt(p.clientId, tipo)}
                                            className="text-muted-foreground hover:text-destructive"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

export function OrganizationStep() {
    const { formState: { errors }, watch } = useFormContext<EventFormValues>();
    const participantes = watch("participantesEquipe") ?? [];
    const orgCount = participantes.filter((p) => p.tipoParticipante === "ORGANIZADOR").length;

    return (
        <div className="space-y-4">
            <p className="text-xs text-muted-foreground">
                Selecione clientes em cada aba. <span className="font-medium">Pelo menos 1 organizador é obrigatório.</span>
            </p>

            <Tabs defaultValue="ORGANIZADOR">
                <TabsList className="w-full">
                    <TabsTrigger value="ORGANIZADOR" className="flex-1">
                        Organizadores
                        {orgCount > 0 && (
                            <Badge variant="secondary" className="ml-2 text-[10px]">{orgCount}</Badge>
                        )}
                    </TabsTrigger>
                    <TabsTrigger value="PALESTRANTE" className="flex-1">Palestrantes</TabsTrigger>
                    <TabsTrigger value="PATROCINADOR" className="flex-1">Patrocinadores</TabsTrigger>
                </TabsList>
                <TabsContent value="ORGANIZADOR" className="mt-4">
                    <ClientPicker tipoParticipante="ORGANIZADOR" label="Organizadores selecionados" />
                </TabsContent>
                <TabsContent value="PALESTRANTE" className="mt-4">
                    <ClientPicker tipoParticipante="PALESTRANTE" label="Palestrantes selecionados" />
                </TabsContent>
                <TabsContent value="PATROCINADOR" className="mt-4">
                    <ClientPicker tipoParticipante="PATROCINADOR" label="Patrocinadores selecionados" />
                </TabsContent>
            </Tabs>

            <ParticipantesSummary />

            {errors.participantesEquipe?.message && (
                <p className="text-sm text-destructive">{errors.participantesEquipe.message as string}</p>
            )}
        </div>
    );
}

import { ArrowLeft, CheckCircle2, Loader2, Pencil, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EventStatusBadge } from "./EventStatusBadge";

interface EventDetailHeaderProps {
    titulo: string;
    finalized: boolean;
    mode: "view" | "edit";
    actionLoading: boolean;
    onBack: () => void;
    onEditToggle: () => void;
    onSave: () => void;
    onDelete: () => void;
    onFinalize: () => void;
}

export function EventDetailHeader({
    titulo,
    finalized,
    mode,
    actionLoading,
    onBack,
    onEditToggle,
    onSave,
    onDelete,
    onFinalize,
}: EventDetailHeaderProps) {
    const disabled = actionLoading;
    const isEdit = mode === "edit";

    return (
        <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
                <Button variant="ghost" size="sm" onClick={onBack} disabled={disabled}>
                    <ArrowLeft className="w-4 h-4 mr-1" /> Voltar
                </Button>
                <div className="flex items-center gap-3 min-w-0">
                    <h1 className="text-xl font-semibold text-foreground truncate">{titulo}</h1>
                    <EventStatusBadge finalized={finalized} />
                </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
                {isEdit ? (
                    <>
                        <Button variant="outline" onClick={onEditToggle} disabled={disabled}>
                            Cancelar
                        </Button>
                        <Button onClick={onSave} disabled={disabled}>
                            {actionLoading ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <Save className="w-4 h-4 mr-2" />
                            )}
                            Salvar Alterações
                        </Button>
                    </>
                ) : (
                    <>
                        <Button variant="outline" onClick={onEditToggle} disabled={disabled}>
                            <Pencil className="w-4 h-4 mr-2" />
                            Editar Evento
                        </Button>
                        <Button
                            variant="outline"
                            onClick={onDelete}
                            disabled={disabled}
                            className="text-destructive hover:text-destructive"
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Excluir Evento
                        </Button>
                        {!finalized && (
                            <Button onClick={onFinalize} disabled={disabled}>
                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                Finalizar Evento
                            </Button>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

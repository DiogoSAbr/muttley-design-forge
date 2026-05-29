import { useEffect, useRef, useState } from "react";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ApiError } from "@/lib/api/client";
import { EventService } from "@/services/EventService";
import { CompetenciasChipsField } from "./CompetenciasChipsField";

interface RewardModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    eventoId: string;
    participanteIds: string[];
    onSuccess: () => void;
}

const MAX_DESCRICAO = 50;

export function RewardModal({
    open,
    onOpenChange,
    eventoId,
    participanteIds,
    onSuccess,
}: RewardModalProps) {
    const { toast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [descricao, setDescricao] = useState("");
    const [competencias, setCompetencias] = useState<string[]>([]);
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!file) {
            setPreview(null);
            return;
        }
        const url = URL.createObjectURL(file);
        setPreview(url);
        return () => URL.revokeObjectURL(url);
    }, [file]);

    useEffect(() => {
        if (!open) {
            setDescricao("");
            setCompetencias([]);
            setFile(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    }, [open]);

    const canSubmit =
        !submitting &&
        descricao.trim().length > 0 &&
        descricao.length <= MAX_DESCRICAO &&
        competencias.length > 0 &&
        !!file &&
        participanteIds.length > 0;

    async function handleSubmit() {
        if (!canSubmit || !file) return;
        setSubmitting(true);
        try {
            await EventService.rewardParticipants({
                eventoId,
                participanteIds,
                descricaoMedalha: descricao.trim(),
                competenciasMedalha: competencias,
                arquivoPlanoDeFundo: file,
            });
            toast({
                title: "Medalha enviada",
                description: `${participanteIds.length} participante(s) recompensado(s).`,
            });
            onOpenChange(false);
            onSuccess();
        } catch (err) {
            const message =
                err instanceof ApiError
                    ? err.message
                    : "Não foi possível enviar a medalha. Tente novamente.";
            toast({
                title: "Erro ao recompensar",
                description: message,
                variant: "destructive",
            });
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={open => !submitting && onOpenChange(open)}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>Recompensar participantes</DialogTitle>
                    <DialogDescription>
                        {participanteIds.length} participante(s) selecionado(s). Configure a medalha que será emitida.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="space-y-1">
                        <Label htmlFor="descricaoMedalha">Descrição da Medalha</Label>
                        <Input
                            id="descricaoMedalha"
                            value={descricao}
                            maxLength={MAX_DESCRICAO}
                            disabled={submitting}
                            onChange={e => setDescricao(e.target.value)}
                            placeholder="Ex: Participação ativa no workshop"
                        />
                        <div className="text-xs text-muted-foreground text-right">
                            {descricao.length}/{MAX_DESCRICAO}
                        </div>
                    </div>

                    <div className="space-y-1">
                        <Label>Competências</Label>
                        <CompetenciasChipsField
                            value={competencias}
                            onChange={setCompetencias}
                            disabled={submitting}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Plano de Fundo</Label>
                        <div className="flex items-start gap-3">
                            <div className="border border-dashed border-border rounded-md bg-muted/20 p-2 min-h-[96px] min-w-[160px] flex items-center justify-center overflow-hidden">
                                {preview ? (
                                    <img
                                        src={preview}
                                        alt="Pré-visualização do plano de fundo"
                                        className="max-h-24 max-w-[200px] object-contain"
                                    />
                                ) : (
                                    <span className="text-xs text-muted-foreground">Sem imagem</span>
                                )}
                            </div>
                            <div className="flex flex-col gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    disabled={submitting}
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <ImagePlus className="w-4 h-4 mr-1.5" />
                                    {file ? "Trocar imagem" : "Selecionar imagem"}
                                </Button>
                                {file && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        disabled={submitting}
                                        onClick={() => {
                                            setFile(null);
                                            if (fileInputRef.current) fileInputRef.current.value = "";
                                        }}
                                    >
                                        <Trash2 className="w-4 h-4 mr-1.5" />
                                        Remover
                                    </Button>
                                )}
                            </div>
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={e => setFile(e.target.files?.[0] ?? null)}
                        />
                        <p className="text-xs text-muted-foreground">
                            Recomendado: 16:9 ou A4 horizontal.
                        </p>
                    </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-2">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={submitting}
                    >
                        Cancelar
                    </Button>
                    <Button onClick={handleSubmit} disabled={!canSubmit}>
                        {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Recompensar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

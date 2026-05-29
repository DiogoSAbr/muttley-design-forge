import { useEffect, useMemo, useRef, useState } from "react";
import { ImagePlus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface SignaturePreviewProps {
    currentSrc: string | null;
    mode: "view" | "edit";
    file: File | null;
    onFileChange: (file: File | null) => void;
}

export function SignaturePreview({ currentSrc, mode, file, onFileChange }: SignaturePreviewProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [objectUrl, setObjectUrl] = useState<string | null>(null);

    useEffect(() => {
        if (!file) {
            setObjectUrl(null);
            return;
        }
        const url = URL.createObjectURL(file);
        setObjectUrl(url);
        return () => URL.revokeObjectURL(url);
    }, [file]);

    const displaySrc = useMemo(() => objectUrl ?? currentSrc, [objectUrl, currentSrc]);

    if (mode === "view") {
        return (
            <div className="space-y-2">
                <Label className="text-muted-foreground text-xs">Assinatura</Label>
                {displaySrc ? (
                    <div className="border border-border rounded-md bg-muted/20 p-3 inline-block">
                        <img
                            src={displaySrc}
                            alt="Assinatura do signatário"
                            className="max-h-24 max-w-[240px] object-contain"
                        />
                    </div>
                ) : (
                    <p className="text-sm text-foreground">-</p>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-2">
            <Label className="text-muted-foreground text-xs">Assinatura</Label>
            <div className="flex items-start gap-3">
                <div
                    className={cn(
                        "border border-dashed border-border rounded-md bg-muted/20 p-3 flex items-center justify-center",
                        "min-h-[96px] min-w-[160px]",
                    )}
                >
                    {displaySrc ? (
                        <img
                            src={displaySrc}
                            alt="Pré-visualização da assinatura"
                            className="max-h-20 max-w-[200px] object-contain"
                        />
                    ) : (
                        <span className="text-xs text-muted-foreground">Sem assinatura</span>
                    )}
                </div>
                <div className="flex flex-col gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => inputRef.current?.click()}
                    >
                        <ImagePlus className="w-4 h-4 mr-1.5" />
                        {file ? "Trocar imagem" : "Selecionar imagem"}
                    </Button>
                    {file && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                onFileChange(null);
                                if (inputRef.current) inputRef.current.value = "";
                            }}
                        >
                            <Trash2 className="w-4 h-4 mr-1.5" />
                            Remover
                        </Button>
                    )}
                </div>
            </div>
            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={e => {
                    const next = e.target.files?.[0] ?? null;
                    onFileChange(next);
                }}
            />
            <p className="text-xs text-muted-foreground">
                Mantenha vazio para preservar a assinatura atual.
            </p>
        </div>
    );
}

import { useState, useEffect } from "react";
import { useFormContext, useController } from "react-hook-form";
import { Upload, FileImage } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { EventFormValues } from "../eventFormSchema";

function FieldError({ message }: { message?: string }) {
    if (!message) return null;
    return <p className="text-xs text-destructive mt-1">{message}</p>;
}

function SignatureUpload() {
    const { control, formState: { errors } } = useFormContext<EventFormValues>();
    const { field } = useController({ control, name: "arquivoAssinaturaSignatario" });
    const errorMessage = errors.arquivoAssinaturaSignatario?.message as string | undefined;
    const [preview, setPreview] = useState<string | null>(null);

    useEffect(() => {
        const value = field.value as File | undefined;
        if (value instanceof File && value.type.startsWith("image/")) {
            const url = URL.createObjectURL(value);
            setPreview(url);
            return () => URL.revokeObjectURL(url);
        }
        setPreview(null);
    }, [field.value]);

    const file = field.value as File | undefined;

    return (
        <div>
            <Label>Arquivo da assinatura *</Label>
            <div className="mt-1">
                {file instanceof File ? (
                    <div className="flex items-center gap-3 p-3 border border-border rounded-lg">
                        {preview ? (
                            <img
                                src={preview}
                                alt="Pré-visualização"
                                className="w-16 h-16 object-contain border border-border rounded bg-white"
                            />
                        ) : (
                            <div className="w-16 h-16 flex items-center justify-center bg-muted rounded">
                                <FileImage className="w-6 h-6 text-muted-foreground" />
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{file.name}</p>
                            <p className="text-xs text-muted-foreground">
                                {(file.size / 1024).toFixed(1)} KB
                            </p>
                        </div>
                        <label>
                            <Button type="button" variant="outline" size="sm" asChild>
                                <span>Trocar</span>
                            </Button>
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => field.onChange(e.target.files?.[0])}
                            />
                        </label>
                    </div>
                ) : (
                    <label className="flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/30 transition-colors">
                        <Upload className="w-6 h-6 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                            Clique para enviar imagem da assinatura
                        </span>
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => field.onChange(e.target.files?.[0])}
                        />
                    </label>
                )}
            </div>
            <FieldError message={errorMessage} />
        </div>
    );
}

export function SignatureStep() {
    const { register, watch, formState: { errors } } = useFormContext<EventFormValues>();
    const nome = watch("nomeSignatario") ?? "";
    const cargo = watch("cargoSignatario") ?? "";

    return (
        <div className="space-y-4">
            <SignatureUpload />

            <div>
                <Label htmlFor="nomeSignatario">Nome do signatário *</Label>
                <Input
                    id="nomeSignatario"
                    className="mt-1"
                    placeholder="Ex: João Silva"
                    maxLength={30}
                    {...register("nomeSignatario")}
                />
                <div className="flex justify-between mt-1">
                    <FieldError message={errors.nomeSignatario?.message as string | undefined} />
                    <span className="text-xs text-muted-foreground ml-auto">{nome.length}/30</span>
                </div>
            </div>

            <div>
                <Label htmlFor="cargoSignatario">Cargo do signatário *</Label>
                <Input
                    id="cargoSignatario"
                    className="mt-1"
                    placeholder="Ex: Coordenador de Curso"
                    maxLength={30}
                    {...register("cargoSignatario")}
                />
                <div className="flex justify-between mt-1">
                    <FieldError message={errors.cargoSignatario?.message as string | undefined} />
                    <span className="text-xs text-muted-foreground ml-auto">{cargo.length}/30</span>
                </div>
            </div>
        </div>
    );
}

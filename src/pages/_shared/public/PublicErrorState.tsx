import { AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function PublicErrorState({
    title = "Evento inválido ou não encontrado",
    description = "Verifique o link recebido e tente novamente.",
}: {
    title?: string;
    description?: string;
}) {
    return (
        <Card className="w-full">
            <CardContent className="pt-8 pb-8 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                    <AlertCircle className="w-8 h-8 text-destructive" />
                </div>
                <h2 className="text-lg font-semibold text-foreground mb-2">{title}</h2>
                <p className="text-sm text-muted-foreground">{description}</p>
            </CardContent>
        </Card>
    );
}

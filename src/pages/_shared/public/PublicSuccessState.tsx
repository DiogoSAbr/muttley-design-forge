import { CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function PublicSuccessState({
    title,
    description,
}: {
    title: string;
    description: string;
}) {
    return (
        <Card className="w-full">
            <CardContent className="pt-8 pb-8 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-8 h-8 text-success" />
                </div>
                <h2 className="text-lg font-semibold text-foreground mb-2">{title}</h2>
                <p className="text-sm text-muted-foreground">{description}</p>
            </CardContent>
        </Card>
    );
}

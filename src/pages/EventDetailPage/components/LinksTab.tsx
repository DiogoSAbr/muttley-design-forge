import { Copy, Download, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface LinksTabProps {
    qrCodeInscricao: string | null;
    urlInscricao: string | null;
    qrCodeConfirmacao: string | null;
    urlConfirmacao: string | null;
}

function downloadDataUrl(dataUrl: string, filename: string) {
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function QrCard({
    title,
    qrCode,
    url,
    filename,
}: {
    title: string;
    qrCode: string | null;
    url: string | null;
    filename: string;
}) {
    const { toast } = useToast();

    async function handleCopy() {
        if (!url) return;
        try {
            await navigator.clipboard.writeText(url);
            toast({ title: "Link copiado", description: url });
        } catch {
            toast({
                title: "Não foi possível copiar",
                description: "Copie manualmente o link exibido.",
                variant: "destructive",
            });
        }
    }

    function handleDownload() {
        if (!qrCode) return;
        downloadDataUrl(qrCode, filename);
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base">{title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex justify-center">
                    {qrCode ? (
                        <div className="p-3 bg-white rounded-md border border-border">
                            <img
                                src={qrCode}
                                alt={title}
                                className="w-44 h-44 object-contain"
                            />
                        </div>
                    ) : (
                        <div className="w-44 h-44 rounded-md border border-dashed border-border flex items-center justify-center text-xs text-muted-foreground">
                            QR Code indisponível
                        </div>
                    )}
                </div>
                <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">Link</p>
                    {url ? (
                        <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sm text-primary hover:underline break-all"
                        >
                            {url}
                            <ExternalLink className="w-3 h-3 shrink-0" />
                        </a>
                    ) : (
                        <p className="text-sm text-foreground">-</p>
                    )}
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopy}
                        disabled={!url}
                        className="flex-1"
                    >
                        <Copy className="w-4 h-4 mr-1.5" />
                        Copiar link
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDownload}
                        disabled={!qrCode}
                        className="flex-1"
                    >
                        <Download className="w-4 h-4 mr-1.5" />
                        Baixar QR
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

export function LinksTab({
    qrCodeInscricao,
    urlInscricao,
    qrCodeConfirmacao,
    urlConfirmacao,
}: LinksTabProps) {
    return (
        <div className="grid grid-cols-2 gap-4">
            <QrCard
                title="QR Code de Inscrição"
                qrCode={qrCodeInscricao}
                url={urlInscricao}
                filename="qr-inscricao.png"
            />
            <QrCard
                title="QR Code de Confirmação"
                qrCode={qrCodeConfirmacao}
                url={urlConfirmacao}
                filename="qr-confirmacao.png"
            />
        </div>
    );
}

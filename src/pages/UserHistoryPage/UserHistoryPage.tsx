import { useNavigate, useParams } from "react-router-dom";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ArrowLeft, CalendarX, Search } from "lucide-react";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/StatusBadge";
import { DataTablePagination } from "@/pages/_shared/components/DataTablePagination";
import { useUserHistory } from "./hooks/useUserHistory";
import type { ClientEventHistoryItem } from "@/models/Client/ClientEventHistory";

const SKELETON_ROWS = 5;
const COLUMN_COUNT = 5;

const MODALIDADE_LABEL: Record<ClientEventHistoryItem["modalidade"], string> = {
    PRESENCIAL: "Presencial",
    REMOTO: "Remoto",
    HIBRIDO: "Híbrido",
};

const formatDay = (d: string) => {
    try {
        return format(parseISO(d), "dd/MM/yyyy", { locale: ptBR });
    } catch {
        return "—";
    }
};

const formatDateRange = (inicial: string, final?: string | null) => {
    if (!inicial) return "—";
    const start = formatDay(inicial);
    if (!final) return start;
    return `${start} - ${formatDay(final)}`;
};

type BadgeVariant = "success" | "error" | "warning" | "info" | "neutral";

const statusToVariant = (status: string): BadgeVariant => {
    const s = (status || "").toUpperCase();
    if (s.includes("FINALIZ") || s.includes("CONCLU")) return "neutral";
    if (s.includes("ANDAM") || s.includes("ABERT") || s.includes("ATIV")) return "success";
    if (s.includes("CANCEL") || s.includes("ERRO")) return "error";
    if (s.includes("PEND") || s.includes("AGUARD")) return "warning";
    return "info";
};

const formatStatus = (status: string) => {
    if (!status) return "—";
    const lower = status.toLowerCase().replace(/_/g, " ");
    return lower.charAt(0).toUpperCase() + lower.slice(1);
};

export default function UserHistoryPage() {
    const navigate = useNavigate();
    const { clientId } = useParams<{ clientId: string }>();
    const {
        data,
        loading,
        error,
        titulo,
        page,
        size,
        setTitulo,
        setPage,
        refetch,
    } = useUserHistory(clientId);

    const totalElements = data?.totalElements ?? 0;
    const items = data?.content ?? [];

    return (
        <div className="min-h-screen bg-background">
            <AppSidebar />
            <main className="ml-60 p-8">
                <div className="max-w-5xl mx-auto animate-fade-in">
                    <div className="mb-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(-1)}
                            className="h-8 px-2 -ml-2 text-muted-foreground hover:text-foreground"
                        >
                            <ArrowLeft className="w-4 h-4 mr-1" /> Voltar
                        </Button>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                        <div>
                            <h1 className="text-xl font-semibold text-foreground">Histórico do usuário</h1>
                            <p className="text-sm text-muted-foreground">
                                {totalElements} {totalElements === 1 ? "evento" : "eventos"} no histórico
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                        <div className="relative w-full sm:max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Pesquise por título"
                                className="pl-9"
                                value={titulo}
                                onChange={e => setTitulo(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="bg-card border border-border rounded-xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-border bg-muted/40">
                                        <th className="text-left p-3 font-medium text-muted-foreground text-sm">Título</th>
                                        <th className="text-left p-3 font-medium text-muted-foreground text-sm">Modalidade</th>
                                        <th className="text-left p-3 font-medium text-muted-foreground text-sm whitespace-nowrap">Data</th>
                                        <th className="text-left p-3 font-medium text-muted-foreground text-sm">Status</th>
                                        <th className="text-center p-3 font-medium text-muted-foreground text-sm whitespace-nowrap">Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading &&
                                        Array.from({ length: SKELETON_ROWS }).map((_, idx) => (
                                            <tr key={`skeleton-${idx}`} className="border-b border-border last:border-0">
                                                <td className="p-3"><Skeleton className="h-4 w-48" /></td>
                                                <td className="p-3"><Skeleton className="h-4 w-24" /></td>
                                                <td className="p-3"><Skeleton className="h-4 w-40" /></td>
                                                <td className="p-3"><Skeleton className="h-5 w-24 rounded-full" /></td>
                                                <td className="p-3"><Skeleton className="h-8 w-28 mx-auto rounded-md" /></td>
                                            </tr>
                                        ))}

                                    {!loading && error && (
                                        <tr>
                                            <td colSpan={COLUMN_COUNT} className="p-10">
                                                <div className="flex flex-col items-center gap-3 text-center">
                                                    <p className="text-sm text-muted-foreground">{error}</p>
                                                    <Button variant="outline" size="sm" onClick={refetch}>
                                                        Tentar novamente
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    )}

                                    {!loading && !error && items.length === 0 && (
                                        <tr>
                                            <td colSpan={COLUMN_COUNT} className="p-10">
                                                <div className="flex flex-col items-center gap-3 text-center">
                                                    <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                                                        <CalendarX className="w-5 h-5 text-muted-foreground" />
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">
                                                        Nenhum evento encontrado.
                                                    </p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}

                                    {!loading && !error && items.map(item => (
                                        <tr
                                            key={item.id}
                                            className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors"
                                        >
                                            <td className="p-3 font-medium text-foreground">{item.titulo}</td>
                                            <td className="p-3 text-muted-foreground">
                                                {MODALIDADE_LABEL[item.modalidade] ?? item.modalidade}
                                            </td>
                                            <td className="p-3 text-muted-foreground whitespace-nowrap">
                                                {formatDateRange(item.dataInicial, item.dataFinal)}
                                            </td>
                                            <td className="p-3">
                                                <StatusBadge variant={statusToVariant(item.status)}>
                                                    {formatStatus(item.status)}
                                                </StatusBadge>
                                            </td>
                                            <td className="p-3 text-center">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => navigate(`/events/${item.id}`)}
                                                >
                                                    Ver Detalhes
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {!loading && !error && data && (
                            <DataTablePagination
                                page={page}
                                size={size}
                                numberOfElements={data.numberOfElements}
                                totalElements={data.totalElements}
                                totalPages={data.totalPages}
                                onPageChange={setPage}
                            />
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

import { useMemo, useState } from "react";
import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/StatusBadge";
import { DataTablePagination } from "@/pages/_shared/components/DataTablePagination";
import { useEventParticipants } from "../hooks/useEventParticipants";
import { ParticipantsTableHeader } from "./ParticipantsTableHeader";
import { RewardModal } from "./RewardModal";
import type {
    EventParticipant,
    ParticipantRole,
    ParticipantStatus,
} from "@/models/Event/EventParticipants";

interface ParticipantsTabProps {
    eventId: string;
}

const COLUMN_COUNT = 5;
const SKELETON_ROWS = 5;

const cargoLabel: Record<ParticipantRole, string> = {
    ORGANIZADOR: "Organizador",
    PALESTRANTE: "Palestrante",
    PATROCINADOR: "Patrocinador",
    OUVINTE: "Ouvinte",
};

const formatDate = (d: string | null | undefined) =>
    d ? new Date(d).toLocaleDateString("pt-BR") : "-";

function StatusCell({ status }: { status: ParticipantStatus }) {
    if (status === "PRESENTE") {
        return <StatusBadge variant="success">Presente</StatusBadge>;
    }
    return <StatusBadge variant="info">Inscrito</StatusBadge>;
}

export function ParticipantsTab({ eventId }: ParticipantsTabProps) {
    const {
        page,
        proporcao,
        loading,
        error,
        sort,
        pageIndex,
        size,
        setSort,
        setPage,
        refetch,
    } = useEventParticipants(eventId);

    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [rewardOpen, setRewardOpen] = useState(false);

    const participants = useMemo<EventParticipant[]>(
        () => page?.content ?? [],
        [page],
    );

    const visibleIds = useMemo(() => participants.map(p => p.id), [participants]);
    const allVisibleSelected =
        visibleIds.length > 0 && visibleIds.every(id => selectedIds.has(id));
    const anyVisibleSelected = visibleIds.some(id => selectedIds.has(id));

    function toggleAll(checked: boolean) {
        setSelectedIds(prev => {
            const next = new Set(prev);
            visibleIds.forEach(id => {
                if (checked) next.add(id);
                else next.delete(id);
            });
            return next;
        });
    }

    function toggleOne(id: string, checked: boolean) {
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (checked) next.add(id);
            else next.delete(id);
            return next;
        });
    }

    function handleRewardSuccess() {
        setSelectedIds(new Set());
        refetch();
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                    Inscritos/Presentes:{" "}
                    <span className="text-foreground font-medium">
                        {proporcao ?? "-"}
                    </span>
                </p>
                <Button
                    disabled={selectedIds.size === 0}
                    onClick={() => setRewardOpen(true)}
                >
                    Recompensar ({selectedIds.size})
                </Button>
            </div>

            <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <ParticipantsTableHeader
                            sort={sort}
                            onSortChange={setSort}
                            allSelected={allVisibleSelected}
                            indeterminate={anyVisibleSelected}
                            onToggleAll={toggleAll}
                        />
                        <tbody>
                            {loading &&
                                Array.from({ length: SKELETON_ROWS }).map((_, idx) => (
                                    <tr
                                        key={`skeleton-${idx}`}
                                        className="border-b border-border last:border-0"
                                    >
                                        <td className="p-3"><Skeleton className="h-4 w-4" /></td>
                                        <td className="p-3"><Skeleton className="h-4 w-40" /></td>
                                        <td className="p-3"><Skeleton className="h-4 w-24" /></td>
                                        <td className="p-3"><Skeleton className="h-4 w-24" /></td>
                                        <td className="p-3"><Skeleton className="h-5 w-20 rounded-full" /></td>
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

                            {!loading && !error && participants.length === 0 && (
                                <tr>
                                    <td colSpan={COLUMN_COUNT} className="p-10">
                                        <div className="flex flex-col items-center gap-3 text-center">
                                            <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                                                <Users className="w-5 h-5 text-muted-foreground" />
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                Nenhum participante encontrado.
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            )}

                            {!loading && !error && participants.map(p => (
                                <tr
                                    key={p.id}
                                    className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors"
                                >
                                    <td className="p-3">
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.has(p.id)}
                                            onChange={e => toggleOne(p.id, e.target.checked)}
                                            aria-label={`Selecionar ${p.nome}`}
                                            className="h-4 w-4 rounded border-border accent-primary"
                                        />
                                    </td>
                                    <td className="p-3 font-medium text-foreground">{p.nome}</td>
                                    <td className="p-3 text-muted-foreground">
                                        {cargoLabel[p.tipoParticipante] ?? p.tipoParticipante}
                                    </td>
                                    <td className="p-3 text-muted-foreground">
                                        {formatDate(p.dataInscricao)}
                                    </td>
                                    <td className="p-3">
                                        <StatusCell status={p.statusPresenca} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {!loading && !error && page && (
                    <DataTablePagination
                        page={pageIndex}
                        size={size}
                        numberOfElements={page.numberOfElements}
                        totalElements={page.totalElements}
                        totalPages={page.totalPages}
                        onPageChange={setPage}
                    />
                )}
            </div>

            <RewardModal
                open={rewardOpen}
                onOpenChange={setRewardOpen}
                eventoId={eventId}
                participanteIds={Array.from(selectedIds)}
                onSuccess={handleRewardSuccess}
            />
        </div>
    );
}

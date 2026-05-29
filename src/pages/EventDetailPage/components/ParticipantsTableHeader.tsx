import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ParticipantSortOption } from "@/models/Event/EventParticipants";

type SortableField = "client.nome" | "client.dataInscricao";

interface ParticipantsTableHeaderProps {
    sort: ParticipantSortOption;
    onSortChange: (next: ParticipantSortOption) => void;
    allSelected: boolean;
    indeterminate: boolean;
    onToggleAll: (checked: boolean) => void;
}

function parseSort(sort: ParticipantSortOption): {
    field: SortableField;
    direction: "asc" | "desc";
} {
    const [field, direction] = sort.split(",") as [SortableField, "asc" | "desc"];
    return { field, direction };
}

function SortableButton({
    label,
    field,
    sort,
    onSortChange,
    defaultDirection,
}: {
    label: string;
    field: SortableField;
    sort: ParticipantSortOption;
    onSortChange: (next: ParticipantSortOption) => void;
    defaultDirection: "asc" | "desc";
}) {
    const current = parseSort(sort);
    const isActive = current.field === field;
    const direction = isActive ? current.direction : null;

    const handleClick = () => {
        if (!isActive) {
            onSortChange(`${field},${defaultDirection}` as ParticipantSortOption);
            return;
        }
        const next = direction === "asc" ? "desc" : "asc";
        onSortChange(`${field},${next}` as ParticipantSortOption);
    };

    return (
        <button
            type="button"
            onClick={handleClick}
            className={cn(
                "inline-flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-foreground",
                isActive && "text-foreground",
            )}
            aria-sort={isActive ? (direction === "asc" ? "ascending" : "descending") : "none"}
        >
            {label}
            {isActive ? (
                direction === "asc" ? (
                    <ArrowUp className="w-3.5 h-3.5" />
                ) : (
                    <ArrowDown className="w-3.5 h-3.5" />
                )
            ) : (
                <ArrowUpDown className="w-3.5 h-3.5 opacity-50" />
            )}
        </button>
    );
}

export function ParticipantsTableHeader({
    sort,
    onSortChange,
    allSelected,
    indeterminate,
    onToggleAll,
}: ParticipantsTableHeaderProps) {
    return (
        <thead>
            <tr className="border-b border-border bg-muted/40">
                <th className="p-3 w-10">
                    <input
                        type="checkbox"
                        checked={allSelected}
                        ref={el => {
                            if (el) el.indeterminate = indeterminate && !allSelected;
                        }}
                        onChange={e => onToggleAll(e.target.checked)}
                        aria-label="Selecionar todos"
                        className="h-4 w-4 rounded border-border accent-primary"
                    />
                </th>
                <th className="text-left p-3 font-medium text-muted-foreground">
                    <SortableButton
                        label="Nome"
                        field="client.nome"
                        sort={sort}
                        onSortChange={onSortChange}
                        defaultDirection="asc"
                    />
                </th>
                <th className="text-left p-3 font-medium text-muted-foreground text-sm">Cargo</th>
                <th className="text-left p-3 font-medium text-muted-foreground">
                    <SortableButton
                        label="Data da Inscrição"
                        field="client.dataInscricao"
                        sort={sort}
                        onSortChange={onSortChange}
                        defaultDirection="desc"
                    />
                </th>
                <th className="text-left p-3 font-medium text-muted-foreground text-sm">Status</th>
            </tr>
        </thead>
    );
}

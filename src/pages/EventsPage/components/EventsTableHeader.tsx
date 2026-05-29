import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { EventSortOption } from "@/models/Event/EventListResponse";

type SortableField = "titulo" | "dataInicial";

interface EventsTableHeaderProps {
    sort: EventSortOption;
    onSortChange: (next: EventSortOption) => void;
}

function parseSort(sort: EventSortOption): { field: SortableField; direction: "asc" | "desc" } {
    const [field, direction] = sort.split(",") as [SortableField, "asc" | "desc"];
    return { field, direction };
}

function SortableHeader({
    label,
    field,
    sort,
    onSortChange,
    defaultDirection,
    align = "left",
}: {
    label: string;
    field: SortableField;
    sort: EventSortOption;
    onSortChange: (next: EventSortOption) => void;
    defaultDirection: "asc" | "desc";
    align?: "left" | "center";
}) {
    const current = parseSort(sort);
    const isActive = current.field === field;
    const direction = isActive ? current.direction : null;

    const handleClick = () => {
        if (!isActive) {
            onSortChange(`${field},${defaultDirection}` as EventSortOption);
            return;
        }
        const next = direction === "asc" ? "desc" : "asc";
        onSortChange(`${field},${next}` as EventSortOption);
    };

    return (
        <th
            className={cn(
                "p-3 font-medium text-muted-foreground",
                align === "left" ? "text-left" : "text-center",
            )}
        >
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
        </th>
    );
}

export function EventsTableHeader({ sort, onSortChange }: EventsTableHeaderProps) {
    return (
        <thead>
            <tr className="border-b border-border bg-muted/40">
                <SortableHeader
                    label="Título"
                    field="titulo"
                    sort={sort}
                    onSortChange={onSortChange}
                    defaultDirection="asc"
                />
                <th className="text-left p-3 font-medium text-muted-foreground text-sm">Modalidade</th>
                <SortableHeader
                    label="Data"
                    field="dataInicial"
                    sort={sort}
                    onSortChange={onSortChange}
                    defaultDirection="desc"
                />
                <th className="text-left p-3 font-medium text-muted-foreground text-sm">Status</th>
                <th className="text-center p-3 font-medium text-muted-foreground text-sm">Ver Detalhes</th>
            </tr>
        </thead>
    );
}

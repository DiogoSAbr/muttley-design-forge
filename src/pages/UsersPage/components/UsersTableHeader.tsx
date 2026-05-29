import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type {
    ClientSortableField,
    ClientSortOption,
} from "@/models/Client/ClientListResponse";

interface UsersTableHeaderProps {
    sort: ClientSortOption;
    onSortChange: (next: ClientSortOption) => void;
}

function parseSort(sort: ClientSortOption): {
    field: ClientSortableField;
    direction: "asc" | "desc";
} {
    const [field, direction] = sort.split(",") as [ClientSortableField, "asc" | "desc"];
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
    field: ClientSortableField;
    sort: ClientSortOption;
    onSortChange: (next: ClientSortOption) => void;
    defaultDirection: "asc" | "desc";
    align?: "left" | "center";
}) {
    const current = parseSort(sort);
    const isActive = current.field === field;
    const direction = isActive ? current.direction : null;

    const handleClick = () => {
        if (!isActive) {
            onSortChange(`${field},${defaultDirection}` as ClientSortOption);
            return;
        }
        const next = direction === "asc" ? "desc" : "asc";
        onSortChange(`${field},${next}` as ClientSortOption);
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

export function UsersTableHeader({ sort, onSortChange }: UsersTableHeaderProps) {
    return (
        <thead>
            <tr className="border-b border-border bg-muted/40">
                <SortableHeader
                    label="Nome"
                    field="nome"
                    sort={sort}
                    onSortChange={onSortChange}
                    defaultDirection="asc"
                />
                <th className="text-left p-3 font-medium text-muted-foreground text-sm whitespace-nowrap">CPF</th>
                <th className="text-left p-3 font-medium text-muted-foreground text-sm">E-mail</th>
                <SortableHeader
                    label="Pontos"
                    field="totalPontos"
                    sort={sort}
                    onSortChange={onSortChange}
                    defaultDirection="desc"
                />
                <th className="text-left p-3 font-medium text-muted-foreground text-sm whitespace-nowrap">Certificados</th>
                <th className="text-left p-3 font-medium text-muted-foreground text-sm whitespace-nowrap">Medalhas</th>
                <th className="text-center p-3 font-medium text-muted-foreground text-sm whitespace-nowrap">Ações</th>
            </tr>
        </thead>
    );
}

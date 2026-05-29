import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DataTablePaginationProps {
    page: number;
    size: number;
    numberOfElements: number;
    totalElements: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

const MAX_VISIBLE_PAGES = 5;

function buildPageWindow(current: number, total: number): (number | "ellipsis")[] {
    if (total <= MAX_VISIBLE_PAGES) {
        return Array.from({ length: total }, (_, i) => i);
    }

    const pages: (number | "ellipsis")[] = [];
    const last = total - 1;

    pages.push(0);

    const windowStart = Math.max(1, current - 1);
    const windowEnd = Math.min(last - 1, current + 1);

    if (windowStart > 1) pages.push("ellipsis");
    for (let i = windowStart; i <= windowEnd; i++) pages.push(i);
    if (windowEnd < last - 1) pages.push("ellipsis");

    pages.push(last);
    return pages;
}

export function DataTablePagination({
    page,
    size,
    numberOfElements,
    totalElements,
    totalPages,
    onPageChange,
}: DataTablePaginationProps) {
    if (totalElements === 0) return null;

    const start = page * size + 1;
    const end = page * size + numberOfElements;
    const pages = buildPageWindow(page, totalPages);

    return (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 py-3 border-t border-border bg-muted/20">
            <p className="text-sm text-muted-foreground">
                {start} à {end} de {totalElements}
            </p>
            <nav aria-label="Paginação" className="flex items-center gap-1">
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onPageChange(page - 1)}
                    disabled={page === 0}
                    aria-label="Página anterior"
                >
                    <ChevronLeft className="w-4 h-4" />
                </Button>
                {pages.map((p, idx) =>
                    p === "ellipsis" ? (
                        <span
                            key={`ellipsis-${idx}`}
                            className="px-2 text-sm text-muted-foreground"
                            aria-hidden
                        >
                            …
                        </span>
                    ) : (
                        <Button
                            key={p}
                            variant={p === page ? "outline" : "ghost"}
                            size="icon"
                            className={cn(
                                "h-8 w-8 text-sm",
                                p === page && "border-primary text-foreground",
                            )}
                            onClick={() => onPageChange(p)}
                            aria-current={p === page ? "page" : undefined}
                        >
                            {p + 1}
                        </Button>
                    ),
                )}
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onPageChange(page + 1)}
                    disabled={page >= totalPages - 1}
                    aria-label="Próxima página"
                >
                    <ChevronRight className="w-4 h-4" />
                </Button>
            </nav>
        </div>
    );
}

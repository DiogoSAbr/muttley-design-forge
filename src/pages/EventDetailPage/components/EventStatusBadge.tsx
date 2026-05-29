import { StatusBadge } from "@/components/StatusBadge";

interface EventStatusBadgeProps {
    finalized: boolean;
}

export function EventStatusBadge({ finalized }: EventStatusBadgeProps) {
    if (finalized) {
        return <StatusBadge variant="neutral">Finalizado</StatusBadge>;
    }
    return <StatusBadge variant="success">Em Andamento</StatusBadge>;
}

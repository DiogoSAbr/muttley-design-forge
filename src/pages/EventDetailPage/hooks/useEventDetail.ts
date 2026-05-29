import { useCallback, useEffect, useState } from "react";
import { ApiError } from "@/lib/api/client";
import { EventService } from "@/services/EventService";
import type { EventDetail } from "@/models/Event/EventDetailResponse";

interface UseEventDetailReturn {
    data: EventDetail | null;
    loading: boolean;
    error: string | null;
    refetch: () => void;
}

export function useEventDetail(id: string | undefined): UseEventDetailReturn {
    const [data, setData] = useState<EventDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refetchTrigger, setRefetchTrigger] = useState(0);

    useEffect(() => {
        if (!id) {
            setData(null);
            setLoading(false);
            setError(null);
            return;
        }

        const controller = new AbortController();
        let cancelled = false;
        setLoading(true);
        setError(null);

        EventService.getById(id, controller.signal)
            .then(result => {
                if (cancelled) return;
                setData(result);
            })
            .catch(err => {
                if (cancelled || controller.signal.aborted) return;
                if (err instanceof DOMException && err.name === "AbortError") return;
                const message =
                    err instanceof ApiError
                        ? err.message
                        : "Não foi possível carregar o evento. Tente novamente.";
                setError(message);
                setData(null);
            })
            .finally(() => {
                if (cancelled) return;
                setLoading(false);
            });

        return () => {
            cancelled = true;
            controller.abort();
        };
    }, [id, refetchTrigger]);

    const refetch = useCallback(() => {
        setRefetchTrigger(prev => prev + 1);
    }, []);

    return { data, loading, error, refetch };
}

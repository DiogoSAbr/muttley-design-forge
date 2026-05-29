import { useCallback, useEffect, useState } from "react";
import { ApiError } from "@/lib/api/client";
import { EventService } from "@/services/EventService";
import type {
    EventParticipant,
    EventParticipantsResponse,
    ParticipantSortOption,
} from "@/models/Event/EventParticipants";
import type { SpringPage } from "@/models/Event/EventListResponse";

const DEFAULT_SIZE = 10;
const DEFAULT_SORT: ParticipantSortOption = "client.nome,asc";

interface UseEventParticipantsReturn {
    page: SpringPage<EventParticipant> | null;
    proporcao: string | null;
    loading: boolean;
    error: string | null;
    pageIndex: number;
    size: number;
    sort: ParticipantSortOption;
    setPage: (value: number) => void;
    setSort: (value: ParticipantSortOption) => void;
    refetch: () => void;
}

export function useEventParticipants(eventId: string | undefined): UseEventParticipantsReturn {
    const [pageIndex, setPageIndex] = useState(0);
    const [sort, setSortState] = useState<ParticipantSortOption>(DEFAULT_SORT);
    const [response, setResponse] = useState<EventParticipantsResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refetchTrigger, setRefetchTrigger] = useState(0);

    useEffect(() => {
        if (!eventId) {
            setLoading(false);
            return;
        }
        const controller = new AbortController();
        let cancelled = false;
        setLoading(true);
        setError(null);

        EventService.listParticipants(
            eventId,
            { page: pageIndex, size: DEFAULT_SIZE, sort },
            controller.signal,
        )
            .then(result => {
                if (cancelled) return;
                setResponse(result);
            })
            .catch(err => {
                if (cancelled || controller.signal.aborted) return;
                if (err instanceof DOMException && err.name === "AbortError") return;
                const message =
                    err instanceof ApiError
                        ? err.message
                        : "Não foi possível carregar os participantes.";
                setError(message);
                setResponse(null);
            })
            .finally(() => {
                if (cancelled) return;
                setLoading(false);
            });

        return () => {
            cancelled = true;
            controller.abort();
        };
    }, [eventId, pageIndex, sort, refetchTrigger]);

    const setSort = useCallback((value: ParticipantSortOption) => {
        setSortState(value);
        setPageIndex(0);
    }, []);

    const refetch = useCallback(() => {
        setRefetchTrigger(prev => prev + 1);
    }, []);

    return {
        page: response?.participantes ?? null,
        proporcao: response?.proporcaoParticipantes ?? null,
        loading,
        error,
        pageIndex,
        size: DEFAULT_SIZE,
        sort,
        setPage: setPageIndex,
        setSort,
        refetch,
    };
}

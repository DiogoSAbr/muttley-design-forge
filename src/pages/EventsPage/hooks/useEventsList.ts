import { useCallback, useEffect, useState } from "react";
import { EventService } from "@/services/EventService";
import { ApiError } from "@/lib/api/client";
import type {
    EventListItem,
    EventSortOption,
    SpringPage,
} from "@/models/Event/EventListResponse";

const DEFAULT_SIZE = 10;
const DEFAULT_SORT: EventSortOption = "dataInicial,desc";
const SEARCH_DEBOUNCE_MS = 300;

interface UseEventsListReturn {
    data: SpringPage<EventListItem> | null;
    loading: boolean;
    error: string | null;
    titulo: string;
    sort: EventSortOption;
    page: number;
    size: number;
    setTitulo: (value: string) => void;
    setPage: (value: number) => void;
    setSort: (value: EventSortOption) => void;
    refetch: () => void;
}

export function useEventsList(): UseEventsListReturn {
    const [titulo, setTituloRaw] = useState("");
    const [debouncedTitulo, setDebouncedTitulo] = useState("");
    const [page, setPage] = useState(0);
    const [sort, setSortState] = useState<EventSortOption>(DEFAULT_SORT);
    const [data, setData] = useState<SpringPage<EventListItem> | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refetchTrigger, setRefetchTrigger] = useState(0);

    useEffect(() => {
        const handle = window.setTimeout(() => {
            setDebouncedTitulo(titulo);
        }, SEARCH_DEBOUNCE_MS);
        return () => window.clearTimeout(handle);
    }, [titulo]);

    useEffect(() => {
        const controller = new AbortController();
        let cancelled = false;
        setLoading(true);
        setError(null);

        EventService.list(
            { titulo: debouncedTitulo, page, size: DEFAULT_SIZE, sort },
            controller.signal,
        )
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
                        : "Não foi possível carregar os eventos. Tente novamente.";
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
    }, [debouncedTitulo, page, sort, refetchTrigger]);

    const setTitulo = useCallback((value: string) => {
        setTituloRaw(value);
        setPage(0);
    }, []);

    const setSort = useCallback((value: EventSortOption) => {
        setSortState(value);
        setPage(0);
    }, []);

    const refetch = useCallback(() => {
        setRefetchTrigger(prev => prev + 1);
    }, []);

    return {
        data,
        loading,
        error,
        titulo,
        sort,
        page,
        size: DEFAULT_SIZE,
        setTitulo,
        setPage,
        setSort,
        refetch,
    };
}

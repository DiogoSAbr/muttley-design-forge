import { useCallback, useEffect, useState } from "react";
import { ClientService } from "@/services/ClientService";
import { ApiError } from "@/lib/api/client";
import type {
    ClientEventHistoryResponse,
    ClientEventHistorySortOption,
} from "@/models/Client/ClientEventHistory";

const DEFAULT_SIZE = 10;
const DEFAULT_SORT: ClientEventHistorySortOption = "dataInicial,desc";
const SEARCH_DEBOUNCE_MS = 300;

interface UseUserHistoryReturn {
    data: ClientEventHistoryResponse | null;
    loading: boolean;
    error: string | null;
    titulo: string;
    sort: ClientEventHistorySortOption;
    page: number;
    size: number;
    setTitulo: (value: string) => void;
    setPage: (value: number) => void;
    setSort: (value: ClientEventHistorySortOption) => void;
    refetch: () => void;
}

export function useUserHistory(clientId: string | undefined): UseUserHistoryReturn {
    const [titulo, setTituloRaw] = useState("");
    const [debouncedTitulo, setDebouncedTitulo] = useState("");
    const [page, setPage] = useState(0);
    const [sort, setSortState] = useState<ClientEventHistorySortOption>(DEFAULT_SORT);
    const [data, setData] = useState<ClientEventHistoryResponse | null>(null);
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
        if (!clientId) {
            setLoading(false);
            setError("Usuário inválido.");
            setData(null);
            return;
        }

        const controller = new AbortController();
        let cancelled = false;
        setLoading(true);
        setError(null);

        ClientService.listHistory(
            clientId,
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
                        : "Não foi possível carregar o histórico. Tente novamente.";
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
    }, [clientId, debouncedTitulo, page, sort, refetchTrigger]);

    const setTitulo = useCallback((value: string) => {
        setTituloRaw(value);
        setPage(0);
    }, []);

    const setSort = useCallback((value: ClientEventHistorySortOption) => {
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

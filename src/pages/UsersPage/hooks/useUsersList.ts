import { useCallback, useEffect, useState } from "react";
import { ClientService } from "@/services/ClientService";
import { ApiError } from "@/lib/api/client";
import type {
    ClientListResponse,
    ClientSortOption,
} from "@/models/Client/ClientListResponse";

const DEFAULT_SIZE = 10;
const DEFAULT_SORT: ClientSortOption = "totalPontos,desc";
const SEARCH_DEBOUNCE_MS = 300;

interface UseUsersListReturn {
    data: ClientListResponse | null;
    loading: boolean;
    error: string | null;
    nome: string;
    sort: ClientSortOption;
    page: number;
    size: number;
    setNome: (value: string) => void;
    setPage: (value: number) => void;
    setSort: (value: ClientSortOption) => void;
    refetch: () => void;
}

export function useUsersList(): UseUsersListReturn {
    const [nome, setNomeRaw] = useState("");
    const [debouncedNome, setDebouncedNome] = useState("");
    const [page, setPage] = useState(0);
    const [sort, setSortState] = useState<ClientSortOption>(DEFAULT_SORT);
    const [data, setData] = useState<ClientListResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refetchTrigger, setRefetchTrigger] = useState(0);

    useEffect(() => {
        const handle = window.setTimeout(() => {
            setDebouncedNome(nome);
        }, SEARCH_DEBOUNCE_MS);
        return () => window.clearTimeout(handle);
    }, [nome]);

    useEffect(() => {
        const controller = new AbortController();
        let cancelled = false;
        setLoading(true);
        setError(null);

        ClientService.list(
            { nome: debouncedNome, page, size: DEFAULT_SIZE, sort },
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
                        : "Não foi possível carregar os usuários. Tente novamente.";
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
    }, [debouncedNome, page, sort, refetchTrigger]);

    const setNome = useCallback((value: string) => {
        setNomeRaw(value);
        setPage(0);
    }, []);

    const setSort = useCallback((value: ClientSortOption) => {
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
        nome,
        sort,
        page,
        size: DEFAULT_SIZE,
        setNome,
        setPage,
        setSort,
        refetch,
    };
}

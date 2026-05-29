import { apiFetch } from "@/lib/api/client";
import type { Client } from "@/models/Client/Client";
import type {
    ClientListResponse,
    ClientSortOption,
} from "@/models/Client/ClientListResponse";
import type {
    ClientEventHistoryResponse,
    ClientEventHistorySortOption,
} from "@/models/Client/ClientEventHistory";

export interface ListClientsParams {
    nome?: string;
    page: number;
    size: number;
    sort: ClientSortOption;
}

export interface ListClientHistoryParams {
    titulo?: string;
    page: number;
    size: number;
    sort: ClientEventHistorySortOption;
}

export interface CreateClientRequest {
    nome: string;
    cpf: string;
    email: string;
}

export const ClientService = {
    list(params: ListClientsParams, signal?: AbortSignal): Promise<ClientListResponse> {
        return apiFetch<ClientListResponse>("clients", {
            method: "GET",
            params: {
                nome: params.nome?.trim() ? params.nome.trim() : undefined,
                page: params.page,
                size: params.size,
                sort: params.sort,
            },
            signal,
        });
    },

    create(data: CreateClientRequest): Promise<Client> {
        return apiFetch<Client>("clients", {
            method: "POST",
            body: data,
        });
    },

    listHistory(
        clientId: string,
        params: ListClientHistoryParams,
        signal?: AbortSignal,
    ): Promise<ClientEventHistoryResponse> {
        return apiFetch<ClientEventHistoryResponse>(
            `clients/${clientId}/historico-eventos`,
            {
                method: "GET",
                params: {
                    titulo: params.titulo?.trim() ? params.titulo.trim() : undefined,
                    page: params.page,
                    size: params.size,
                    sort: params.sort,
                },
                signal,
            },
        );
    },
};

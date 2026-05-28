import { apiFetch } from "@/lib/api/client";
import type { Client, PageResponse } from "@/models/Client/Client";

export interface ListClientsParams {
    nome?: string;
    page?: number;
    size?: number;
    sort?: string;
}

export interface CreateClientRequest {
    nome: string;
    cpf: string;
    email: string;
}

export const ClientService = {
    list(params: ListClientsParams = {}): Promise<PageResponse<Client>> {
        const { nome = "", page = 0, size = 10, sort = "nome,desc" } = params;
        return apiFetch<PageResponse<Client>>("clients", {
            params: { nome, page, size, sort },
        });
    },

    create(data: CreateClientRequest): Promise<Client> {
        return apiFetch<Client>("clients", {
            method: "POST",
            body: data,
        });
    },
};

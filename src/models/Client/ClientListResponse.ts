import type { Client } from "./Client";
import type { SpringPage } from "@/models/Event/EventListResponse";

export interface ClientListItem extends Client {
    dataCriacao: string;
    totalPontos: number;
    totalCertificados: number;
    totalMedalhas: number;
}

export type ClientSortableField = "nome" | "totalPontos";

export type ClientSortOption =
    | "nome,asc"
    | "nome,desc"
    | "totalPontos,asc"
    | "totalPontos,desc";

export type ClientListResponse = SpringPage<ClientListItem>;

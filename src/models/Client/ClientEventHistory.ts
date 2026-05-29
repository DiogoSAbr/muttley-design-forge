import type { SpringPage } from "@/models/Event/EventListResponse";

export type ModalidadeEvento = "PRESENCIAL" | "REMOTO" | "HIBRIDO";

export interface ClientEventHistoryItem {
    id: string;
    titulo: string;
    modalidade: ModalidadeEvento;
    dataInicial: string;
    dataFinal?: string | null;
    status: string;
}

export type ClientEventHistorySortOption =
    | "dataInicial,desc"
    | "dataInicial,asc";

export type ClientEventHistoryResponse = SpringPage<ClientEventHistoryItem>;

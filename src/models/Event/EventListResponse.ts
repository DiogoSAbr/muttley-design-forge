export interface EventListItem {
    id: string;
    titulo: string;
    modalidade: string;
    dataInicial: string;
    dataFinal: string;
    finalized: boolean;
}

export interface SpringPage<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
    numberOfElements: number;
    first: boolean;
    last: boolean;
    empty: boolean;
}

export type EventSortOption =
    | "dataInicial,desc"
    | "dataInicial,asc"
    | "titulo,asc"
    | "titulo,desc";

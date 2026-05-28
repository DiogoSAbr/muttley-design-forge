export interface Client {
    id: string;
    nome: string;
    cpf: string;
    email: string;
}

export type TipoParticipante = "ORGANIZADOR" | "PALESTRANTE" | "PATROCINADOR";

export interface ParticipanteEvento {
    clientId: string;
    tipoParticipante: TipoParticipante;
}

export interface PageResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
}

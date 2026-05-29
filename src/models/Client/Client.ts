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

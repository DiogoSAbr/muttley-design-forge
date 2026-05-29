import type { TipoParticipante } from "@/models/Client/Client";
import type { SpringPage } from "@/models/Event/EventListResponse";

export type ParticipantStatus = "INSCRITO" | "PRESENTE";

export type ParticipantRole = TipoParticipante | "OUVINTE";

export interface EventParticipant {
    id: string;
    nome: string;
    email: string;
    tipoParticipante: ParticipantRole;
    dataInscricao: string;
    statusPresenca: ParticipantStatus;
}

export interface EventParticipantsResponse {
    proporcaoParticipantes: string;
    participantes: SpringPage<EventParticipant>;
}

export type ParticipantSortOption =
    | "client.dataInscricao,desc"
    | "client.dataInscricao,asc"
    | "client.nome,desc"
    | "client.nome,asc";

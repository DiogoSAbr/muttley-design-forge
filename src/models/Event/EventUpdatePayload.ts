import type { ParticipanteEvento } from "@/models/Client/Client";
import type { EventoModalidade, EventoTipo } from "./EventCreatePayload";

export interface EventUpdatePayload {
    titulo: string;
    dataInicial: string;
    dataFinal?: string | null;
    horaInicial: string;
    horaFinal: string;
    cargaHoraria: number;
    pontos: number;
    tipo: EventoTipo;
    assuntoEvento: string;
    descricao?: string | null;
    competencias: string[];
    modalidade: EventoModalidade;
    endereco?: string | null;
    capacidade?: number | null;
    nomeSignatario: string;
    cargoSignatario: string;
    participantes: ParticipanteEvento[];
    arquivoAssinaturaSignatario?: File;
}

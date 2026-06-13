import type { TipoParticipante } from "@/models/Client/Client";
import type { EventoModalidade, EventoTipo } from "./EventCreatePayload";

export type ParticipantStatusPresenca = "INSCRITO" | "PRESENTE";

export interface EventDetailParticipant {
    id: string;
    clientId: string;
    nome: string;
    email: string;
    tipoParticipante: TipoParticipante;
    dataInscricao: string;
    statusPresenca: ParticipantStatusPresenca;
}

export interface EventDetail {
    id: string;
    titulo: string;
    dataInicial: string;
    dataFinal: string | null;
    horaInicial: string | null;
    horaFinal: string | null;
    cargaHoraria: number;
    pontos: number;
    tipo: EventoTipo;
    assuntoEvento: string;
    descricao: string | null;
    competencias: string;
    modalidade: EventoModalidade;
    endereco: string | null;
    capacidade: number | null;
    assinaturaSignatario: string | null;
    nomeSignatario: string;
    cargoSignatario: string;
    qrCodeInscricao: string | null;
    urlInscricao: string | null;
    qrCodeConfirmacao: string | null;
    urlConfirmacao: string | null;
    dataCriacao: string;
    finalized: boolean;
    participantes: EventDetailParticipant[];
}

export function parseCompetencias(value: string | null | undefined): string[] {
    if (!value) return [];
    try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === "string") : [];
    } catch {
        return [];
    }
}

export function toBase64ImageSrc(value: string | null | undefined): string | null {
    if (!value) return null;
    if (value.startsWith("data:")) return value;
    return `data:image/png;base64,${value}`;
}

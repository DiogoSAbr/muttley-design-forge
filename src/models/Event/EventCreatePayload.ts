import type { ParticipanteEvento } from "@/models/Client/Client";

export type EventoTipo =
    | "ACADEMICO"
    | "CIENTIFICO"
    | "CORPORATIVO"
    | "CURSO"
    | "ENTRETENIMENTO"
    | "ESPORTIVO"
    | "EXIBICAO"
    | "NETWORKING";

export type EventoModalidade = "PRESENCIAL" | "HIBRIDO" | "REMOTO";

export interface EventCreatePayload {
    titulo: string;
    dataInicial: string;
    dataFinal?: string;
    cargaHoraria: number;
    pontos: number;
    tipo: EventoTipo;
    assuntoEvento: string;
    descricao?: string;
    competencias: string[];
    modalidade: EventoModalidade;
    endereco?: string;
    capacidade?: number;
    nomeSignatario: string;
    cargoSignatario: string;
    participantes: ParticipanteEvento[];
}

export const TIPO_OPTIONS: { value: EventoTipo; label: string }[] = [
    { value: "ACADEMICO", label: "Acadêmico — Seminário/Jornada" },
    { value: "CIENTIFICO", label: "Científico — Congresso/Simpósio" },
    { value: "CORPORATIVO", label: "Corporativo — Empresarial" },
    { value: "CURSO", label: "Curso — Workshop/Palestra" },
    { value: "ENTRETENIMENTO", label: "Entretenimento — Show/Festa" },
    { value: "ESPORTIVO", label: "Esportivo — Jogos/Torneios" },
    { value: "EXIBICAO", label: "Exibição — Feira/Exposição" },
    { value: "NETWORKING", label: "Networking — Encontro/Meetup" },
];

export const MODALIDADE_OPTIONS: { value: EventoModalidade; label: string }[] = [
    { value: "PRESENCIAL", label: "Presencial" },
    { value: "HIBRIDO", label: "Híbrido" },
    { value: "REMOTO", label: "Remoto" },
];

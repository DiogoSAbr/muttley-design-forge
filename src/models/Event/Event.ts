export interface Organizer {
    name: string;
    type: "professor" | "aluno" | "outro";
}

export type MedalAudience = "palestrante" | "organizador" | "ouvintes";

export interface EventItem {
    id: string;
    title: string;
    modality: string;
    description: string;
    location?: string;
    startDate: string;
    endDate: string;
    startTime: string;
    endTime: string;
    speakers?: Organizer[];
    organizers: Organizer[];
    medalIds: string[];
    medalAudiences?: Record<string, MedalAudience[]>;
    status: "agendado" | "cancelado" | "concluido";
}
